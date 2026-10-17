'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, AlertCircle, Maximize, CheckCircle2, ChevronRight, ChevronLeft, ArrowRight, Loader2,
  XCircle, HelpCircle, Lightbulb, BookOpen, RotateCcw, Check, X, Lock, KeyRound
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/utils/supabase';
import { checkStudentAccess } from '@/utils/cohort';
import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';

const getLivePasscode = (data: any) => {
  const desc = data?.description || '';
  const match = desc.match(/\[PASSCODE:([^\]]+)\]/i);
  if (match) return match[1].trim();
  const cleanId = String(data?.id || '').replace(/-/g, '').slice(-4).toUpperCase();
  return `LIVE-${cleanId || '8000'}`;
};

export default function StudentTestTakingEngine() {
  const router = useRouter();
  const { testId } = useParams();
  const searchParams = useSearchParams();
  const [testData, setTestData] = useState<any>(null);
  const isLive = searchParams.get('mode') === 'live' || Boolean(testData?.description?.includes('[TYPE:live]'));
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Cohort Restriction Gate States
  const [cohortRestricted, setCohortRestricted] = useState(false);
  const [targetCohort, setTargetCohort] = useState<any>(null);
  const [studentCohort, setStudentCohort] = useState<any>(null);

  // Live Exam Passcode States
  const [isPasscodeUnlocked, setIsPasscodeUnlocked] = useState(false);
  const [enteredPasscode, setEnteredPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState('');

  // States
  const [testState, setTestState] = useState<'instructions' | 'in-progress' | 'submitted'>('instructions');
  const [agreedToRules, setAgreedToRules] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'incorrect' | 'correct' | 'skipped'>('all');
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [visited, setVisited] = useState<Set<string>>(new Set());
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());
  
  const [timeLeft, setTimeLeft] = useState(0);
  
  // Webcam & Results State
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoNodeRef = useRef<HTMLVideoElement | null>(null);
  const audioAnalyserRef = useRef<AnalyserNode | null>(null);
  const audioDataArrayRef = useRef<Uint8Array | null>(null);
  const videoRef = useCallback((node: HTMLVideoElement) => {
    videoNodeRef.current = node;
    if (node && stream) {
      node.srcObject = stream;
    }
  }, [stream]);
  
  const [results, setResults] = useState<{score: number, correct: number, wrong: number, skipped: number} | null>(null);

  // Anti-Cheat States
  const [warnings, setWarnings] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningReason, setWarningReason] = useState("");
  const MAX_WARNINGS = 3;

  const [model, setModel] = useState<blazeface.BlazeFaceModel | null>(null);

  useEffect(() => {
    async function loadModel() {
      await tf.ready();
      const loadedModel = await blazeface.load();
      setModel(loadedModel);
    }
    loadModel();
  }, []);

  useEffect(() => {
    async function checkAuthAndFetchTest() {
      if (!testId) return;
      
      // 1. Mandatory Student Auth Check
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        const currentPath = window.location.pathname + window.location.search;
        router.replace(`/register?mode=login&role=student&redirect=${encodeURIComponent(currentPath)}`);
        return;
      }
      setCheckingAuth(false);

      // Fetch student profile for cohort verification
      const user = session.user;
      let studentData = user.user_metadata || {};
      try {
        const { data: prof } = await supabase
          .from('profiles')
          .select('stream, branch, year, section, roll_number, name')
          .eq('id', user.id)
          .maybeSingle();
        if (prof) {
          studentData = { ...studentData, ...prof };
        }
      } catch (err) {
        console.warn("Could not fetch student profile", err);
      }
      setStudentCohort(studentData);

      // 2. Fetch test info & questions
      const { data: testInfo, error: testError } = await supabase
        .from('tests')
        .select('*')
        .eq('id', testId)
        .single();
        
      if (testInfo) {
        // Check cohort access restriction
        const accessCheck = checkStudentAccess(testInfo.description, studentData);
        setTargetCohort(accessCheck.target);
        if (!accessCheck.allowed) {
          setCohortRestricted(true);
        }

        const { data: qData } = await supabase
          .from('questions')
          .select('*')
          .eq('test_id', testId);
          
        setTestData({
          ...testInfo,
          questions: qData || []
        });
        setTimeLeft(testInfo.duration_minutes * 60);

        // Check if live test was already unlocked in this browser session
        if (typeof window !== 'undefined' && testId) {
          const cachedUnlocked = sessionStorage.getItem(`live_unlocked_${testId}`);
          if (cachedUnlocked === 'true') {
            setIsPasscodeUnlocked(true);
          }
        }
      } else {
        console.error("Test not found", testError);
      }
      setLoading(false);
    }
    
    checkAuthAndFetchTest();
  }, [testId, router]);

  // Unified Warning Trigger Function
  const triggerWarning = useCallback((reason: string) => {
    setWarningReason(reason);
    setWarnings(prev => {
      const newWarnings = prev + 1;
      if (newWarnings < MAX_WARNINGS) {
        setShowWarningModal(true);
      }
      return newWarnings;
    });
  }, []);

  // Auto-submit when max warnings are reached
  useEffect(() => {
    if (warnings >= MAX_WARNINGS && testState === 'in-progress') {
      alert(`Maximum warnings exceeded due to suspicious activity. Test auto-submitted.`);
      setShowWarningModal(false);
      handleSubmit();
    }
  }, [warnings, testState]);

  // Anti-Cheat: Tab Visibility Listener
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (isLive && document.hidden && testState === 'in-progress') {
        triggerWarning("Tab Switch or Window Minimized");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [testState, triggerWarning, isLive]);

  // Anti-Cheat: Face Detection Interval
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isLive && testState === 'in-progress' && model && !showWarningModal) {
      interval = setInterval(async () => {
        if (videoNodeRef.current && videoNodeRef.current.readyState === 4) {
          const predictions = await model.estimateFaces(videoNodeRef.current, false);
          
          if (predictions.length === 0) {
            triggerWarning("Face Not Detected");
          } else if (predictions.length > 1) {
            triggerWarning("Multiple Faces Detected");
          } else if (predictions.length === 1) {
            // Check face angle
            const landmarks = predictions[0].landmarks as [number, number][];
            if (landmarks && landmarks.length >= 3) {
              const rightEye = landmarks[0];
              const leftEye = landmarks[1];
              const nose = landmarks[2];

              // Calculate horizontal distance from nose to each eye
              const distRight = Math.abs(nose[0] - rightEye[0]);
              const distLeft = Math.abs(leftEye[0] - nose[0]);

              // Calculate the ratio. If one distance is much smaller than the other, face is turned sideways.
              // Ratio < 0.45 corresponds roughly to > 45 degree turn.
              const maxDist = Math.max(distRight, distLeft);
              if (maxDist > 0) {
                const ratio = Math.min(distRight, distLeft) / maxDist;
                if (ratio < 0.4) {
                  triggerWarning("Looking Away From Screen");
                }
              }
            }
          }
        }

        // Check Audio Level
        if (audioAnalyserRef.current && audioDataArrayRef.current) {
          audioAnalyserRef.current.getByteFrequencyData(audioDataArrayRef.current);
          let sum = 0;
          for (let i = 0; i < audioDataArrayRef.current.length; i++) {
            sum += audioDataArrayRef.current[i];
          }
          const averageVolume = sum / audioDataArrayRef.current.length;
          
          // Threshold of 40 represents significant background noise/voices
          if (averageVolume > 40) {
            triggerWarning("Background Noise/Voices Detected");
          }
        }
      }, 3000);
    }
    
    return () => clearInterval(interval);
  }, [testState, model, showWarningModal, triggerWarning, isLive]);

  // Timer logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (testState === 'in-progress' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [testState, timeLeft]);

  // Fullscreen handlers
  const requestFullscreen = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
      setIsFullscreen(true);
    } catch (err) {
      console.warn("Fullscreen request failed", err);
    }
  };

  const exitFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    }
    setIsFullscreen(false);
  };

  const startTest = async () => {
    if (!agreedToRules) return;

    // Request Camera Access only for Live tests
    if (isLive) {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(mediaStream);
        
        // Setup Audio Analyser
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const microphone = audioContext.createMediaStreamSource(mediaStream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        microphone.connect(analyser);
        
        audioAnalyserRef.current = analyser;
        audioDataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);

      } catch (err) {
        alert("Camera and Microphone access are required to take this proctored Live test.");
        return;
      }
    }

    if (isLive) {
      requestFullscreen();
    }
    
    setTestState('in-progress');
    if (testData?.questions?.length > 0) {
      setVisited(new Set([testData.questions[0].id]));
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Actions
  const handleOptionSelect = (option: string, qId: string) => {
    setAnswers(prev => ({ ...prev, [qId]: option }));
  };

  const handleClearResponse = (qId: string) => {
    setAnswers(prev => {
      const next = { ...prev };
      delete next[qId];
      return next;
    });
  };

  const handleMarkReviewAndNext = (qId: string) => {
    setMarkedForReview(prev => new Set(prev).add(qId));
    goToNext();
  };

  const handleSaveAndNext = (qId: string) => {
    setMarkedForReview(prev => {
      const next = new Set(prev);
      next.delete(qId);
      return next;
    });
    goToNext();
  };

  const goToNext = () => {
    if (currentIndex < testData.questions.length - 1) {
      const nextId = testData.questions[currentIndex + 1].id;
      setVisited(prev => new Set(prev).add(nextId));
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      const prevId = testData.questions[currentIndex - 1].id;
      setVisited(prev => new Set(prev).add(prevId));
      setCurrentIndex(currentIndex - 1);
    }
  };

  const jumpToQuestion = (index: number) => {
    const qId = testData.questions[index].id;
    setVisited(prev => new Set(prev).add(qId));
    setCurrentIndex(index);
  };

  const handleSubmit = async () => {
    exitFullscreen();
    
    // Stop Camera
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }

    // Calculate Score
    let correct = 0;
    let wrong = 0;
    
    testData.questions.forEach((q: any) => {
      const studentAnswer = answers[q.id];
      if (studentAnswer) {
        if (studentAnswer === q.correct_answer) {
          correct++;
        } else {
          wrong++;
        }
      }
    });

    const skipped = testData.questions.length - (correct + wrong);
    
    // Save to Database
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // 1. Insert into test_attempts
      const { data: attemptData, error: attemptError } = await supabase
        .from('test_attempts')
        .insert({
          test_id: testId,
          student_id: user.id,
          status: warnings >= MAX_WARNINGS ? 'auto_submitted' : 'completed',
          score: correct,
          warnings_issued: warnings,
          completed_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (attemptError) {
        console.error("Failed to save test attempt:", attemptError);
      } else if (attemptData) {
        // 2. Insert into student_answers
        const answersToInsert = testData.questions.map((q: any) => {
          const studentAnswer = answers[q.id];
          return {
            attempt_id: attemptData.id,
            question_id: q.id,
            selected_answer: studentAnswer || null,
            is_correct: studentAnswer === q.correct_answer,
            time_taken_seconds: 0 // Simplification for now
          };
        });

        const { error: answersError } = await supabase
          .from('student_answers')
          .insert(answersToInsert);

        if (answersError) {
          console.error("Failed to save student answers:", answersError);
        }
      }
    }

    setResults({
      score: correct,
      correct,
      wrong,
      skipped
    });

    setTestState('submitted');
  };

  // Palette Status Helpers
  const getQuestionStatus = (qId: string) => {
    const isAnswered = answers[qId] !== undefined;
    const isMarked = markedForReview.has(qId);
    const isVisited = visited.has(qId);

    if (isAnswered && isMarked) return 'answered-marked'; // Purple with green dot
    if (isMarked) return 'marked'; // Purple
    if (isAnswered) return 'answered'; // Green
    if (isVisited) return 'not-answered'; // Red
    return 'not-visited'; // Gray
  };

  // --- RENDERING ---
  
  if (checkingAuth || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="text-slate-700 font-semibold text-lg">
          {checkingAuth ? 'Verifying Student Access...' : 'Loading test data...'}
        </p>
        <p className="text-slate-400 text-sm">
          {checkingAuth ? 'Please wait while we check your login credentials' : 'Preparing test questions and secure environment'}
        </p>
      </div>
    );
  }

  if (!testData || !testData.questions || testData.questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <AlertCircle className="w-12 h-12 text-rose-500" />
        <p className="text-xl font-bold text-slate-700">Test not found or has no questions.</p>
        <button onClick={() => router.push('/student/dashboard')} className="text-indigo-600 underline font-medium">Go back to dashboard</button>
      </div>
    );
  }

  // --- COHORT RESTRICTION GATE ---
  if (cohortRestricted && targetCohort?.isRestricted) {
    return (
      <div className="min-h-screen bg-slate-900/95 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 relative z-10"
        >
          {/* Header banner */}
          <div className="bg-gradient-to-r from-amber-500 via-orange-600 to-rose-600 p-6 text-white text-center relative">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-3 border border-white/30 shadow-inner">
              <Lock className="w-7 h-7 text-white" />
            </div>
            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider mb-2">
              🎯 Targeted Cohort Assessment
            </span>
            <h1 className="text-xl font-bold">{testData?.title || 'Restricted Assessment'}</h1>
            <p className="text-amber-100 text-xs mt-1">
              Access Restricted by Faculty
            </p>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-lg font-bold text-slate-800">You are not in the assigned cohort</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                This assessment is specifically allocated by your faculty only for the following cohort:
              </p>
            </div>

            {/* Targeted Cohort Details */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
              <div className="text-xs font-semibold text-amber-800 uppercase tracking-wide">Assigned To:</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white p-2.5 rounded-xl border border-amber-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Stream</span>
                  <span className="font-bold text-slate-800">{targetCohort.stream}</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-amber-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Branch</span>
                  <span className="font-bold text-slate-800">{targetCohort.branch}</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-amber-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Year</span>
                  <span className="font-bold text-slate-800">{targetCohort.year}</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-amber-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Section</span>
                  <span className="font-bold text-indigo-700">Section {targetCohort.section}</span>
                </div>
              </div>
            </div>

            {/* Student Current Profile */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
              <span className="text-slate-500 block font-medium">Your Current Academic Profile:</span>
              <div className="font-semibold text-slate-700">
                {studentCohort?.stream || 'B.Tech'} • {studentCohort?.branch || 'CSE'} • {studentCohort?.year || '3rd Year'} • Section {studentCohort?.section || 'A'}
              </div>
              <p className="text-[11px] text-slate-400">If your branch or section is incorrect, you can update it in your profile settings.</p>
            </div>

            <div className="space-y-2 pt-2">
              <Link
                href="/student/dashboard/settings"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
              >
                Update Academic Details
              </Link>
              <button
                onClick={() => router.push('/student/dashboard')}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition-colors"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // --- LIVE ASSESSMENT PASSCODE GATE ---
  if (isLive && !isPasscodeUnlocked) {
    const requiredPasscode = getLivePasscode(testData);

    const handleUnlock = (e: React.FormEvent) => {
      e.preventDefault();
      if (!enteredPasscode.trim()) {
        setPasscodeError("Please enter the exam passcode.");
        return;
      }
      if (enteredPasscode.trim().toUpperCase() === requiredPasscode.toUpperCase()) {
        setIsPasscodeUnlocked(true);
        if (typeof window !== 'undefined' && testId) {
          sessionStorage.setItem(`live_unlocked_${testId}`, 'true');
        }
        setPasscodeError('');
      } else {
        setPasscodeError("Invalid exam passcode! Please check the passcode shared by your teacher on WhatsApp.");
      }
    };

    return (
      <div className="min-h-screen bg-slate-900/95 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 relative z-10"
        >
          {/* Header banner */}
          <div className="bg-gradient-to-r from-rose-600 via-rose-700 to-pink-700 p-6 text-white text-center relative">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-3 border border-white/30 shadow-inner">
              <Lock className="w-7 h-7 text-white" />
            </div>
            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider mb-2">
              🔴 Live Assessment Locked
            </span>
            <h1 className="text-xl font-bold">{testData.title}</h1>
            <p className="text-rose-100 text-xs mt-1">
              {testData.duration_minutes} Mins • {testData.questions?.length || 0} Questions
            </p>
          </div>

          {/* Form */}
          <div className="p-6 md:p-8 space-y-6">
            <div className="text-center">
              <h2 className="text-lg font-bold text-slate-800">Enter Access Passcode</h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                This live examination is restricted. Your teacher will announce or share the access passcode in your WhatsApp group 5 minutes before start.
              </p>
            </div>

            {passcodeError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{passcodeError}</span>
              </div>
            )}

            <form onSubmit={handleUnlock} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Exam Passcode
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. LIVE-7429"
                  value={enteredPasscode}
                  onChange={(e) => {
                    setEnteredPasscode(e.target.value.toUpperCase());
                    setPasscodeError('');
                  }}
                  className="w-full text-center text-xl font-mono font-extrabold uppercase tracking-widest bg-slate-50 border-2 border-slate-200 focus:border-rose-500 focus:bg-white focus:outline-none rounded-xl py-3 px-4 transition-all"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <KeyRound className="w-4 h-4" /> Unlock & Enter Exam
              </button>
            </form>

            <div className="pt-4 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={() => router.push('/student/dashboard/tests/live')}
                className="text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors"
              >
                ← Back to Live Tests Dashboard
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (testState === 'instructions') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl w-full max-w-4xl overflow-hidden border border-slate-200"
        >
          <div className="bg-indigo-900 text-white p-8">
            <h1 className="text-3xl font-bold mb-2">{testData.title}</h1>
            <p className="text-indigo-200 flex items-center gap-2"><Clock size={18}/> Duration: {testData.duration_minutes} Minutes</p>
          </div>
          
          <div className="p-8 space-y-6">
            <h2 className="text-xl font-bold text-slate-800">Please read the following instructions carefully:</h2>
            
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 h-64 overflow-y-auto space-y-4 text-sm text-slate-700 leading-relaxed">
              <p><strong>1. General Instructions:</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Total duration of the examination is {testData.duration_minutes} minutes.</li>
                <li>The clock will be set at the server. The countdown timer in the top right corner of screen will display the remaining time.</li>
                <li>When the timer reaches zero, the examination will end by itself. You will not be required to end or submit your examination.</li>
              </ul>
              
              <p><strong>2. Question Palette:</strong></p>
              <p>The Question Palette displayed on the right side of screen will show the status of each question using one of the following symbols:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                <div className="flex items-center gap-2"><div className="w-6 h-6 rounded bg-slate-200 border border-slate-300"></div> You have not visited the question yet.</div>
                <div className="flex items-center gap-2"><div className="w-6 h-6 rounded bg-rose-500 border border-rose-600"></div> You have not answered the question.</div>
                <div className="flex items-center gap-2"><div className="w-6 h-6 rounded bg-emerald-500 border border-emerald-600"></div> You have answered the question.</div>
                <div className="flex items-center gap-2"><div className="w-6 h-6 rounded bg-purple-500 border border-purple-600"></div> You have marked the question for review.</div>
              </div>

              {isLive && (
                <>
                  <p className="mt-4"><strong>3. Anti-Cheat Warning:</strong></p>
                  <ul className="list-disc pl-5 space-y-1 text-rose-600 font-medium">
                    <li>This test is actively proctored. Ensure your camera is enabled.</li>
                    <li>Navigating away from the test window will be recorded.</li>
                    <li>Exiting full-screen mode or looking away from the screen will trigger warnings.</li>
                    <li>Do not press F5 or refresh the page.</li>
                  </ul>
                </>
              )}
            </div>

            <div className="flex flex-col gap-4 pt-4 border-t border-slate-100">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center mt-0.5">
                  <input type="checkbox" className="peer sr-only" checked={agreedToRules} onChange={(e) => setAgreedToRules(e.target.checked)} />
                  <div className="w-5 h-5 border-2 border-slate-300 rounded group-hover:border-indigo-500 peer-checked:bg-indigo-600 peer-checked:border-indigo-600 transition-all"></div>
                  <CheckCircle2 className="absolute text-white opacity-0 peer-checked:opacity-100 w-3.5 h-3.5" />
                </div>
                <span className="text-slate-700 font-medium select-none">
                  I have read and understood the instructions. {isLive && "I agree to not engage in any unfair means. I understand that the test will open in Full Screen mode."}
                </span>
              </label>

              <button 
                onClick={startTest}
                disabled={!agreedToRules}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 text-lg mt-4"
              >
                I am ready to begin <Maximize size={20} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (testState === 'submitted' && results) {
    const totalQuestions = testData.questions.length;
    const percentage = totalQuestions > 0 ? Math.round((results.correct / totalQuestions) * 100) : 0;

    const filteredQuestions = testData.questions.map((q: any, originalIndex: number) => {
      const studentAns = answers[q.id];
      const isCorrect = studentAns !== undefined && studentAns === q.correct_answer;
      const isSkipped = studentAns === undefined;
      const isWrong = !isSkipped && !isCorrect;
      return { q, originalIndex, studentAns, isCorrect, isSkipped, isWrong };
    }).filter((item: any) => {
      if (reviewFilter === 'correct') return item.isCorrect;
      if (reviewFilter === 'incorrect') return item.isWrong;
      if (reviewFilter === 'skipped') return item.isSkipped;
      return true; // 'all'
    });

    return (
      <div className="min-h-screen bg-slate-100 flex flex-col">
        {/* TOP NAVBAR */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-4 sm:px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-indigo-500/20">
              T
            </div>
            <div>
              <h1 className="font-extrabold text-slate-900 text-base sm:text-lg leading-tight line-clamp-1">{testData.title}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                  Assessment Completed
                </span>
                <span className="text-xs font-medium text-slate-500 capitalize">
                  {testData.category}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setAnswers({});
                setVisited(new Set([testData.questions[0]?.id]));
                setMarkedForReview(new Set());
                setCurrentIndex(0);
                setWarnings(0);
                setTimeLeft(testData.duration_minutes * 60);
                setResults(null);
                setTestState('in-progress');
              }}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-all"
            >
              <RotateCcw size={14} /> Retake Test
            </button>
            <button
              onClick={() => router.push('/student/dashboard')}
              className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 transition-all"
            >
              Dashboard <ArrowRight size={16} />
            </button>
          </div>
        </header>

        {/* MAIN CONTAINER */}
        <div className="max-w-4xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
          
          {/* RESULTS HERO CARD */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${
                  percentage >= 70 ? 'bg-emerald-100 text-emerald-600' : percentage >= 40 ? 'bg-indigo-100 text-indigo-600' : 'bg-rose-100 text-rose-600'
                }`}>
                  <CheckCircle2 size={40} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Performance Summary</h2>
                  <p className="text-slate-500 text-sm mt-0.5">
                    Your answers and detailed step-by-step explanations are below.
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-2xl font-black ${
                      percentage >= 70 ? 'text-emerald-600' : percentage >= 40 ? 'text-indigo-600' : 'text-rose-600'
                    }`}>
                      {percentage}%
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      ({results.correct} of {totalQuestions} correct)
                    </span>
                  </div>
                </div>
              </div>

              {/* STAT COUNTERS */}
              <div className="grid grid-cols-3 gap-3 shrink-0">
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-center min-w-[85px]">
                  <div className="text-2xl font-black text-emerald-700">{results.correct}</div>
                  <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider mt-0.5">Correct</div>
                </div>
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 text-center min-w-[85px]">
                  <div className="text-2xl font-black text-rose-700">{results.wrong}</div>
                  <div className="text-[11px] font-bold text-rose-700 uppercase tracking-wider mt-0.5">Incorrect</div>
                </div>
                <div className="bg-slate-100 border border-slate-200 rounded-2xl p-3 text-center min-w-[85px]">
                  <div className="text-2xl font-black text-slate-700">{results.skipped}</div>
                  <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mt-0.5">Skipped</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* FILTER TABS & EXPLANATION HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <BookOpen size={22} className="text-indigo-600" />
                Solutions & Explanations
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Review your answers, correct options, and step-by-step explanations for each question.
              </p>
            </div>

            {/* FILTER BUTTONS */}
            <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm self-start sm:self-auto overflow-x-auto max-w-full">
              {[
                { id: 'all', label: `All (${totalQuestions})` },
                { id: 'incorrect', label: `Incorrect (${results.wrong})` },
                { id: 'correct', label: `Correct (${results.correct})` },
                { id: 'skipped', label: `Skipped (${results.skipped})` }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setReviewFilter(tab.id as any)}
                  className={`px-3 py-1.5 text-xs font-extrabold rounded-xl transition-all whitespace-nowrap ${
                    reviewFilter === tab.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* QUESTIONS LIST WITH EXPLANATIONS */}
          <div className="space-y-6">
            {filteredQuestions.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-slate-200">
                <p className="text-slate-500 font-bold text-sm">No questions in this filter.</p>
              </div>
            ) : (
              filteredQuestions.map(({ q, originalIndex, studentAns, isCorrect, isSkipped, isWrong }: any) => {
                const optionsList: string[] = Array.isArray(q.options)
                  ? q.options
                  : typeof q.options === 'string'
                  ? (() => { try { return JSON.parse(q.options); } catch { return [q.options]; } })()
                  : [];

                return (
                  <motion.div
                    key={q.id || originalIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-white rounded-3xl p-6 sm:p-7 border-2 shadow-sm transition-all ${
                      isCorrect 
                        ? 'border-emerald-200/80 shadow-emerald-500/5' 
                        : isWrong 
                        ? 'border-rose-200/80 shadow-rose-500/5' 
                        : 'border-slate-200'
                    }`}
                  >
                    {/* CARD HEADER */}
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100 gap-4 mb-4">
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-xl bg-slate-900 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                          Q{originalIndex + 1}
                        </span>
                        <span className="text-sm font-bold text-slate-800">
                          Question {originalIndex + 1} of {totalQuestions}
                        </span>
                      </div>

                      {/* STATUS BADGE */}
                      {isCorrect && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 size={14} className="text-emerald-600" /> Correct (+1 Mark)
                        </span>
                      )}
                      {isWrong && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-800 border border-rose-200">
                          <XCircle size={14} className="text-rose-600" /> Incorrect (0 Marks)
                        </span>
                      )}
                      {isSkipped && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-slate-100 text-slate-700 border border-slate-200">
                          <HelpCircle size={14} className="text-slate-500" /> Not Attempted
                        </span>
                      )}
                    </div>

                    {/* QUESTION TEXT */}
                    <p className="text-base sm:text-lg font-semibold text-slate-900 leading-relaxed mb-6 whitespace-pre-wrap">
                      {q.question_text}
                    </p>

                    {/* OPTIONS */}
                    <div className="space-y-3 mb-6">
                      {optionsList.map((opt: string, optIdx: number) => {
                        const isStudentChoice = studentAns === opt;
                        const isTheCorrectAnswer = opt === q.correct_answer;

                        let cardStyle = 'bg-slate-50 border-slate-200 text-slate-700';
                        let badge = null;

                        if (isStudentChoice && isTheCorrectAnswer) {
                          cardStyle = 'bg-emerald-50 border-2 border-emerald-500 text-emerald-950 font-bold';
                          badge = (
                            <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-black uppercase text-emerald-700 bg-emerald-100/90 px-2.5 py-1 rounded-lg shrink-0">
                              <Check size={13} strokeWidth={3} /> Your Answer & Correct
                            </span>
                          );
                        } else if (isStudentChoice && !isTheCorrectAnswer) {
                          cardStyle = 'bg-rose-50 border-2 border-rose-500 text-rose-950 font-bold';
                          badge = (
                            <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-black uppercase text-rose-700 bg-rose-100/90 px-2.5 py-1 rounded-lg shrink-0">
                              <X size={13} strokeWidth={3} /> Your Answer (Incorrect)
                            </span>
                          );
                        } else if (isTheCorrectAnswer) {
                          cardStyle = 'bg-emerald-50/70 border-2 border-emerald-400 text-emerald-950 font-bold';
                          badge = (
                            <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-black uppercase text-emerald-700 bg-emerald-100/90 px-2.5 py-1 rounded-lg shrink-0">
                              <Check size={13} strokeWidth={3} /> Correct Answer
                            </span>
                          );
                        }

                        return (
                          <div
                            key={optIdx}
                            className={`flex items-center p-3.5 rounded-2xl border transition-all text-sm ${cardStyle}`}
                          >
                            <span className="w-6 h-6 rounded-lg bg-white/80 border border-slate-300 text-slate-700 font-extrabold text-xs flex items-center justify-center mr-3 shrink-0">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span className="font-medium flex-1">{opt}</span>
                            {badge}
                          </div>
                        );
                      })}
                    </div>

                    {/* EXPLANATION BOX */}
                    <div className="bg-gradient-to-r from-amber-50/80 to-yellow-50/60 border border-amber-200 rounded-2xl p-4 sm:p-5">
                      <div className="flex items-center gap-2 mb-2 text-amber-900 font-extrabold text-sm">
                        <Lightbulb size={18} className="text-amber-600 shrink-0" />
                        <span>Explanation & Step-by-Step Solution</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium whitespace-pre-wrap pl-6">
                        {q.explanation && q.explanation.trim() 
                          ? q.explanation 
                          : `The correct answer is "${q.correct_answer}". Please review the key concepts for this topic.`}
                      </p>
                    </div>

                  </motion.div>
                );
              })
            )}
          </div>

          {/* BOTTOM ACTIONS */}
          <div className="flex items-center justify-between pt-4 pb-12">
            <button
              onClick={() => {
                setAnswers({});
                setVisited(new Set([testData.questions[0]?.id]));
                setMarkedForReview(new Set());
                setCurrentIndex(0);
                setWarnings(0);
                setTimeLeft(testData.duration_minutes * 60);
                setResults(null);
                setTestState('in-progress');
              }}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-sm transition-all"
            >
              <RotateCcw size={16} /> Retake Test
            </button>

            <button
              onClick={() => router.push('/student/dashboard')}
              className="flex items-center gap-2 px-7 py-3 rounded-2xl font-extrabold text-xs sm:text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25 transition-all"
            >
              Back to Dashboard <ArrowRight size={16} />
            </button>
          </div>

        </div>
      </div>
    );
  }

  // IN PROGRESS STATE
  const currentQ = testData.questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const notAnsweredCount = visited.size - answeredCount;
  const notVisitedCount = testData.questions.length - visited.size;
  const markedCount = markedForReview.size;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col select-none relative">
      
      {/* EXAM HEADER */}
      <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 shrink-0 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <h1 className="font-bold text-slate-900 text-lg hidden sm:block">{testData.title}</h1>
          <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-100">{testData.category}</span>
        </div>
        
        <div className="flex items-center gap-6">
          {!isFullscreen && isLive && (
            <button onClick={requestFullscreen} className="text-rose-600 text-xs font-bold flex items-center gap-1 animate-pulse border border-rose-200 bg-rose-50 px-2 py-1 rounded">
              <Maximize size={12}/> Please enter Full Screen
            </button>
          )}
          <div className={`flex items-center gap-2 font-mono text-xl font-bold ${timeLeft < 300 ? 'text-rose-600 animate-pulse' : 'text-slate-700'}`}>
            <Clock size={20} /> {formatTime(timeLeft)}
          </div>
          <button onClick={() => setShowSubmitModal(true)} className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-2 rounded-lg font-bold text-sm shadow-md transition-colors">
            Submit Test
          </button>
        </div>
      </header>

      {/* EXAM BODY */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* LEFT/CENTER: Question Area */}
        <div className="flex-1 flex flex-col relative bg-white m-4 rounded-2xl shadow-sm border border-slate-200 overflow-hidden z-10">
          
          <div className="flex-1 overflow-y-auto p-6 md:p-10">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
              <h2 className="text-2xl font-extrabold text-slate-800">Question {currentIndex + 1}</h2>
              <div className="flex gap-2">
                <button className="text-slate-400 hover:text-rose-600 transition-colors flex items-center gap-1 text-sm font-semibold" title="Report Issue">
                  <AlertCircle size={16}/> Report Error
                </button>
              </div>
            </div>

            <div className="prose prose-slate max-w-none mb-10">
              <p className="text-lg text-slate-800 leading-relaxed font-medium whitespace-pre-wrap">
                {currentQ.question_text}
              </p>
            </div>

            <div className="space-y-4 max-w-3xl">
              {currentQ.options.map((opt: string, i: number) => (
                <label 
                  key={i} 
                  className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    answers[currentQ.id] === opt 
                      ? 'border-indigo-600 bg-indigo-50/50' 
                      : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="relative flex items-center justify-center mr-4">
                    <input 
                      type="radio" 
                      name={`q-${currentQ.id}`} 
                      value={opt} 
                      checked={answers[currentQ.id] === opt}
                      onChange={() => handleOptionSelect(opt, currentQ.id)}
                      className="peer sr-only" 
                    />
                    <div className="w-6 h-6 rounded-full border-2 border-slate-300 peer-checked:border-indigo-600 peer-checked:border-[6px] transition-all"></div>
                  </div>
                  <span className={`text-base ${answers[currentQ.id] === opt ? 'text-indigo-900 font-bold' : 'text-slate-700'}`}>{opt}</span>
                </label>
              ))}
            </div>
          </div>

          {/* BOTTOM BAR CONTROLS */}
          <div className="bg-slate-50 border-t border-slate-200 p-4 flex flex-wrap gap-3 items-center justify-between mt-auto">
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => handleMarkReviewAndNext(currentQ.id)}
                className="px-4 py-2.5 bg-white border-2 border-slate-200 text-slate-700 hover:border-purple-600 hover:text-purple-700 font-bold rounded-xl transition-colors shadow-sm flex items-center gap-2 text-sm"
              >
                Mark for Review & Next
              </button>
              <button 
                onClick={() => handleClearResponse(currentQ.id)}
                className="px-4 py-2.5 bg-white border-2 border-slate-200 text-slate-700 hover:border-slate-400 hover:bg-slate-100 font-bold rounded-xl transition-colors shadow-sm text-sm"
              >
                Clear Response
              </button>
            </div>

            <div className="flex gap-3">
              {currentIndex > 0 && (
                <button 
                  onClick={goToPrev}
                  className="px-4 md:px-6 py-2.5 bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 font-bold rounded-xl transition-colors shadow-sm flex items-center gap-2 text-sm"
                >
                  <ChevronLeft size={18} /> <span className="hidden sm:inline">Previous</span>
                </button>
              )}
              
              <button 
                onClick={() => {
                  handleSaveAndNext(currentQ.id);
                  if (currentIndex === testData.questions.length - 1) {
                    setShowSubmitModal(true);
                  }
                }}
                className="px-6 md:px-8 py-2.5 bg-indigo-600 border-2 border-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors shadow-md flex items-center gap-2 text-sm"
              >
                {currentIndex === testData.questions.length - 1 ? 'Save & Submit' : 'Save & Next'} <ChevronRight size={18} />
              </button>
            </div>
          </div>

        </div>

        {/* RIGHT: Status Palette & Webcam */}
        <div className="w-full md:w-80 bg-white border-l border-slate-200 flex flex-col shrink-0 mt-4 md:mt-0 shadow-sm md:shadow-none z-10 md:z-0">
          
          {/* ANTI-CHEAT: Premium Webcam Preview */}
          {isLive && (
            <div className="bg-slate-50 border-b border-slate-200 p-6 flex flex-col items-center justify-center shrink-0 relative overflow-hidden">
              {/* Background subtle glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-100 rounded-full blur-3xl opacity-50"></div>
              
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-xl shadow-slate-300/50 overflow-hidden bg-slate-900 z-10 group">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover opacity-90 scale-105"
                />
                {/* Animated AI Scanning Ring */}
                <div className="absolute inset-0 rounded-full border-2 border-rose-500/20 border-t-rose-500 animate-[spin_3s_linear_infinite] z-20"></div>
              </div>

              <div className="mt-4 flex flex-col items-center z-10">
                <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
                  <span className="text-[10px] text-rose-700 font-bold tracking-wider uppercase">AI Proctoring Active</span>
                </div>
              </div>
            </div>
          )}

          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold">
              SJ
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm">Student</div>
              <div className="text-[10px] text-slate-500 max-w-[150px] truncate">Authenticated User</div>
            </div>
          </div>

          <div className="p-4 grid grid-cols-2 gap-3 text-xs font-semibold text-slate-600 border-b border-slate-200 shrink-0">
            <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-md bg-emerald-500 text-white flex items-center justify-center font-bold">{answeredCount}</div> Answered</div>
            <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-md bg-rose-500 text-white flex items-center justify-center font-bold">{notAnsweredCount}</div> Not Answered</div>
            <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-md bg-slate-200 text-slate-500 flex items-center justify-center font-bold">{notVisitedCount}</div> Not Visited</div>
            <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-md bg-purple-500 text-white flex items-center justify-center font-bold">{markedCount}</div> Marked</div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50">
            <h3 className="font-bold text-slate-800 mb-4 text-sm flex items-center justify-between">
              Question Palette
            </h3>
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-4 gap-3">
              {testData.questions.map((q: any, idx: number) => {
                const status = getQuestionStatus(q.id);
                let bgClass = "bg-slate-200 text-slate-600 border-transparent hover:bg-slate-300"; // not-visited
                
                if (status === 'answered') bgClass = "bg-emerald-500 text-white border-emerald-600 shadow-md shadow-emerald-500/20";
                else if (status === 'not-answered') bgClass = "bg-rose-500 text-white border-rose-600 shadow-md shadow-rose-500/20";
                else if (status === 'marked') bgClass = "bg-purple-500 text-white border-purple-600 shadow-md shadow-purple-500/20";
                else if (status === 'answered-marked') bgClass = "bg-purple-500 text-white border-purple-600 shadow-md shadow-purple-500/20 relative";

                return (
                  <button
                    key={q.id}
                    onClick={() => jumpToQuestion(idx)}
                    className={`h-10 md:h-12 rounded-xl flex items-center justify-center font-bold text-sm border-b-4 transition-transform hover:scale-105 active:scale-95 ${bgClass} ${currentIndex === idx ? 'ring-2 ring-offset-2 ring-indigo-600' : ''}`}
                  >
                    {idx + 1}
                    {status === 'answered-marked' && (
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full"></span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

        </div>

      </div>

      {/* ANTI-CHEAT: Warning Modal */}
      <AnimatePresence>
        {showWarningModal && (
          <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 text-center border-2 border-rose-500 overflow-hidden relative"
            >
              <div className="absolute top-0 left-0 right-0 h-2 bg-rose-500"></div>
              
              <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle size={40} className="animate-pulse" />
              </div>
              
              <h2 className="text-2xl font-black text-slate-900 mb-2">Suspicious Activity Detected</h2>
              <p className="text-slate-600 font-medium mb-6">
                The AI Proctoring system flagged the following issue:
                <br/>
                <span className="text-rose-600 font-bold mt-2 inline-block">"{warningReason}"</span>
              </p>
              
              <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 mb-8">
                <p className="text-rose-800 font-bold text-lg">Warning {warnings} of {MAX_WARNINGS}</p>
                <p className="text-rose-600 text-sm mt-1">If you reach 3 warnings, your test will be automatically submitted and flagged.</p>
              </div>

              <button 
                onClick={() => setShowWarningModal(false)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-all shadow-lg"
              >
                I Understand, Return to Test
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EXAM SUBMISSION REVIEW / CONFIRMATION MODAL */}
      <AnimatePresence>
        {showSubmitModal && (
          <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 sm:p-8 text-center border border-slate-200 overflow-hidden relative"
            >
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <CheckCircle2 size={36} />
              </div>

              <h2 className="text-2xl font-black text-slate-900 mb-2">Submit Assessment?</h2>
              <p className="text-slate-500 text-sm mb-6">
                Please review your progress before final submission. Once submitted, answers cannot be modified.
              </p>

              {/* Summary Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 text-left">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Total</span>
                  <span className="text-xl font-extrabold text-slate-800">{testData?.questions?.length || 0}</span>
                </div>
                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                  <span className="text-[10px] font-bold uppercase text-emerald-600 block">Answered</span>
                  <span className="text-xl font-extrabold text-emerald-700">{answeredCount}</span>
                </div>
                <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
                  <span className="text-[10px] font-bold uppercase text-amber-600 block">Unanswered</span>
                  <span className="text-xl font-extrabold text-amber-700">{Math.max(0, (testData?.questions?.length || 0) - answeredCount)}</span>
                </div>
                <div className="bg-purple-50 p-3 rounded-xl border border-purple-200">
                  <span className="text-[10px] font-bold uppercase text-purple-600 block">For Review</span>
                  <span className="text-xl font-extrabold text-purple-700">{markedCount}</span>
                </div>
              </div>

              {Math.max(0, (testData?.questions?.length || 0) - answeredCount) > 0 && (
                <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 mb-6 text-left flex items-start gap-2.5">
                  <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-amber-800 text-xs font-semibold leading-relaxed">
                    You have <span className="font-bold underline">{Math.max(0, (testData?.questions?.length || 0) - answeredCount)} unanswered question(s)</span>. Click <strong>Review Questions</strong> to attempt them, or <strong>Confirm & Submit</strong> to finish.
                  </p>
                </div>
              )}

              {/* Action Buttons: Review vs Confirm Submit */}
              <div className="flex flex-col-reverse sm:flex-row gap-3">
                <button 
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all text-sm border border-slate-300 shadow-sm"
                >
                  Review Questions
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setShowSubmitModal(false);
                    handleSubmit();
                  }}
                  className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-all shadow-md shadow-rose-600/20 text-sm flex items-center justify-center gap-1.5"
                >
                  Confirm & Submit
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
