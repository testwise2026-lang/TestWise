'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, AlertCircle, Maximize, CheckCircle2, ChevronRight, ChevronLeft, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '@/utils/supabase';
import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';

export default function StudentTestTakingEngine() {
  const router = useRouter();
  const { testId } = useParams();
  const searchParams = useSearchParams();
  const isLive = searchParams.get('mode') === 'live';
  
  const [testData, setTestData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // States
  const [testState, setTestState] = useState<'instructions' | 'in-progress' | 'submitted'>('instructions');
  const [agreedToRules, setAgreedToRules] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
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
    async function fetchTest() {
      if (!testId) return;
      
      const { data: testInfo, error: testError } = await supabase
        .from('tests')
        .select('*')
        .eq('id', testId)
        .single();
        
      if (testInfo) {
        const { data: qData } = await supabase
          .from('questions')
          .select('*')
          .eq('test_id', testId);
          
        setTestData({
          ...testInfo,
          questions: qData || []
        });
        setTimeLeft(testInfo.duration_minutes * 60);
      } else {
        console.error("Test not found", testError);
      }
      setLoading(false);
    }
    
    fetchTest();
  }, [testId]);

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
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="text-slate-500 font-medium">Loading test data...</p>
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
    const percentage = Math.round((results.correct / totalQuestions) * 100);

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl shadow-xl w-full max-w-lg p-10 text-center border border-slate-200"
        >
          <div className="w-24 h-24 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Test Completed!</h2>
          <p className="text-slate-600 mb-8">Your responses have been recorded successfully.</p>

          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 mb-8 shadow-inner">
            <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Your Score</div>
            <div className="text-5xl font-black text-indigo-600 mb-1">{percentage}%</div>
            <div className="text-slate-600 font-medium">({results.correct} out of {totalQuestions} correct)</div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
              <div className="text-2xl font-extrabold text-emerald-700">{results.correct}</div>
              <div className="text-[10px] font-bold text-emerald-600 mt-1 uppercase">Correct</div>
            </div>
            <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100">
              <div className="text-2xl font-extrabold text-rose-700">{results.wrong}</div>
              <div className="text-[10px] font-bold text-rose-600 mt-1 uppercase">Incorrect</div>
            </div>
            <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200">
              <div className="text-2xl font-extrabold text-slate-700">{results.skipped}</div>
              <div className="text-[10px] font-bold text-slate-500 mt-1 uppercase">Skipped</div>
            </div>
          </div>

          <button 
            onClick={() => router.push('/student/dashboard')}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
          >
            Back to Dashboard <ArrowRight size={20} />
          </button>
        </motion.div>
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
          <button onClick={handleSubmit} className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-2 rounded-lg font-bold text-sm shadow-md transition-colors">
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
                    handleSubmit();
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

    </div>
  );
}
