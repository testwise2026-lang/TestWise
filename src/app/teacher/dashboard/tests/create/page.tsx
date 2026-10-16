'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Trash2, Save, ArrowLeft, BookOpen, Clock, AlertCircle, 
  Settings, Sparkles, FileText, Upload, CheckCircle2, Loader2, FileJson, Send,
  KeyRound, RotateCcw
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';

const generateRandomPasscode = () => {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = 'LIVE-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export default function CreateTest() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Assessment Type: mock, practice, or live
  const [testType, setTestType] = useState<'mock' | 'practice' | 'live'>('mock');
  const [livePasscode, setLivePasscode] = useState('');

  // AI & Bulk Upload Modals
  const [showAIModal, setShowAIModal] = useState(false);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiDifficulty, setAiDifficulty] = useState<string>('MEDIUM');
  const [aiCount, setAiCount] = useState<number>(5);
  const [generateMode, setGenerateMode] = useState<'single' | 'three_tests'>('single');
  const [contextText, setContextText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [mode, setMode] = React.useState('manual');

  const [editingTestId, setEditingTestId] = useState<string | null>(null);
  const [isLoadingTest, setIsLoadingTest] = useState(false);

  const loadTestForEdit = async (testId: string) => {
    setIsLoadingTest(true);
    setError(null);
    try {
      const { data: test, error: testErr } = await supabase
        .from('tests')
        .select('*')
        .eq('id', testId)
        .single();

      if (testErr || !test) {
        throw new Error(testErr?.message || 'Failed to load test details for editing.');
      }

      // Detect testType from description tag
      const rawDesc = test.description || '';
      let detectedType: 'mock' | 'practice' | 'live' = 'mock';
      let cleanDesc = rawDesc;
      if (rawDesc.includes('[TYPE:practice]')) {
        detectedType = 'practice';
        cleanDesc = rawDesc.replace('[TYPE:practice]', '').trim();
      } else if (rawDesc.includes('[TYPE:live]')) {
        detectedType = 'live';
        cleanDesc = rawDesc.replace('[TYPE:live]', '').trim();
      } else if (rawDesc.includes('[TYPE:mock]')) {
        cleanDesc = rawDesc.replace('[TYPE:mock]', '').trim();
      }

      const passMatch = cleanDesc.match(/\[PASSCODE:([^\]]+)\]/i);
      if (passMatch) {
        setLivePasscode(passMatch[1].trim());
        cleanDesc = cleanDesc.replace(/\[PASSCODE:[^\]]+\]/i, '').trim();
      } else if (detectedType === 'live') {
        setLivePasscode(generateRandomPasscode());
      }

      setTestType(detectedType);

      setTestDetails({
        title: test.title || '',
        description: cleanDesc,
        category: (test.category || 'aptitude').toLowerCase(),
        difficulty: test.difficulty || 'MEDIUM',
        duration_minutes: test.duration_minutes || 30
      });

      // Fetch questions
      const { data: qData, error: qErr } = await supabase
        .from('questions')
        .select('*')
        .eq('test_id', testId)
        .order('id');

      if (!qErr && qData && qData.length > 0) {
        setQuestions(qData.map(q => {
          let opts: string[] = [];
          if (Array.isArray(q.options)) {
            opts = q.options;
          } else if (typeof q.options === 'string') {
            try { opts = JSON.parse(q.options); } catch { opts = [q.options]; }
          }
          while (opts.length < 4) opts.push('');

          let correctIdx = 0;
          if (typeof q.correct_answer === 'number') {
            correctIdx = q.correct_answer;
          } else if (typeof q.correct_answer === 'string') {
            const found = opts.findIndex(o => o.trim() === q.correct_answer.trim());
            if (found !== -1) correctIdx = found;
          }

          return {
            question_text: q.question_text || '',
            options: opts,
            correct_answer: correctIdx,
            explanation: q.explanation || ''
          };
        }));
      }
    } catch (err: any) {
      console.error('Error loading test for edit:', err);
      setError(err.message || 'Error loading test');
    } finally {
      setIsLoadingTest(false);
    }
  };

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const currentMode = params.get('mode') || 'manual';
    const typeParam = params.get('type');
    const categoryParam = params.get('category');
    const topicParam = params.get('topic');
    const editParam = params.get('edit');

    if (editParam) {
      setEditingTestId(editParam);
      loadTestForEdit(editParam);
    }

    if (typeParam === 'practice' || typeParam === 'live' || typeParam === 'mock') {
      setTestType(typeParam);
      if (typeParam === 'live') {
        setLivePasscode(prev => prev || generateRandomPasscode());
      }
    }
    if (categoryParam) {
      setTestDetails(prev => ({
        ...prev,
        category: categoryParam.toLowerCase(),
        title: topicParam ? `${topicParam} - Practice` : prev.title
      }));
    }

    const durationParam = params.get('duration');
    const titleParam = params.get('title');
    if (durationParam || titleParam) {
      setTestDetails(prev => ({
        ...prev,
        ...(durationParam ? { duration_minutes: parseInt(durationParam) || prev.duration_minutes } : {}),
        ...(titleParam ? { title: decodeURIComponent(titleParam) } : {})
      }));
    }

    const levelParam = params.get('level') || params.get('difficulty');
    if (levelParam) {
      const norm = levelParam.toUpperCase();
      setTestDetails(prev => ({ ...prev, difficulty: norm }));
      setAiDifficulty(norm);
    }

    setMode(currentMode);
    if (currentMode === 'bulk') setShowPDFModal(true);
  }, []);
  
  const [testDetails, setTestDetails] = useState({
    title: '',
    description: '',
    category: 'aptitude',
    difficulty: 'MEDIUM',
    duration_minutes: 30
  });

  const [questions, setQuestions] = useState([
    {
      question_text: '',
      options: ['', '', '', ''],
      correct_answer: 0,
      explanation: ''
    }
  ]);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions, 
      { question_text: '', options: ['', '', '', ''], correct_answer: 0, explanation: '' }
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (index: number, field: string, value: any) => {
    const updated = [...questions];
    if (field.startsWith('option_')) {
      const optIndex = parseInt(field.split('_')[1]);
      updated[index].options[optIndex] = value;
    } else {
      (updated[index] as any)[field] = value;
    }
    setQuestions(updated);
  };

  const handleAIGenerate = async () => {
    if(!aiPrompt) return;
    setAiGenerating(true);
    setError(null);
    
    try {
      if (generateMode === 'three_tests') {
        const res = await fetch('/api/generate-questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            prompt: aiPrompt, 
            contextText,
            count: aiCount,
            generateThreeTests: true
          })
        });

        const rawText = await res.text();
        let data: any;
        try {
          data = JSON.parse(rawText);
        } catch {
          throw new Error(rawText.slice(0, 150) || 'Server returned an invalid response.');
        }

        if (!res.ok) {
          throw new Error(data.error || 'Failed to generate 3 tests');
        }

        const { easy, medium, hard } = data.threeTests || {};
        if (!easy?.length && !medium?.length && !hard?.length) {
          throw new Error('AI could not generate questions for 3 levels.');
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('Not authenticated. Please log in.');

        try {
          await supabase.from('profiles').upsert({
            id: session.user.id,
            role: 'teacher',
            email: session.user.email || '',
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Teacher'
          }, { onConflict: 'id' });
        } catch (profErr) {}

        const baseTitle = testDetails.title || (aiPrompt.length > 30 ? aiPrompt.slice(0, 30) + '...' : aiPrompt);
        const seriesLevels = [
          { level: 'EASY', label: 'Easy (Level 1)', questions: easy },
          { level: 'MEDIUM', label: 'Medium (Level 2)', questions: medium },
          { level: 'HARD', label: 'Hard (Level 3)', questions: hard }
        ];

        for (const item of seriesLevels) {
          const fullTitle = `${baseTitle} - ${item.label}`;
          const taggedDesc = `[TYPE:${testType}] ${fullTitle}`;

          const { data: testRow, error: tErr } = await supabase
            .from('tests')
            .insert({
              title: fullTitle,
              description: taggedDesc,
              category: testDetails.category,
              difficulty: item.level,
              duration_minutes: testDetails.duration_minutes || 30,
              total_questions: item.questions.length,
              created_by: session.user.id,
              is_active: true
            })
            .select('id')
            .single();

          if (tErr) throw tErr;

          const formattedQuestions = item.questions.map((q: any) => {
            let opts: string[] = Array.isArray(q.options) ? q.options : ['A', 'B', 'C', 'D'];
            while (opts.length < 4) opts.push('');
            let correctAns = opts[0];
            if (typeof q.correct_answer === 'number' && opts[q.correct_answer] !== undefined) {
              correctAns = opts[q.correct_answer];
            } else if (typeof q.correct_answer === 'string') {
              correctAns = q.correct_answer;
            }
            return {
              test_id: testRow.id,
              question_text: q.question_text,
              options: opts,
              correct_answer: correctAns,
              explanation: q.explanation || ''
            };
          });

          const { error: qErr } = await supabase.from('questions').insert(formattedQuestions);
          if (qErr) throw qErr;
        }

        setShowAIModal(false);
        setShowPDFModal(false);
        alert(`🎉 Created 3 separate tests:\n1. ${baseTitle} - Easy (Level 1)\n2. ${baseTitle} - Medium (Level 2)\n3. ${baseTitle} - Hard (Level 3)`);
        
        if (testType === 'practice') {
          router.push('/teacher/dashboard/tests/practice');
        } else {
          router.push('/teacher/dashboard/tests/mock');
        }
        return;
      }

      const res = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: aiPrompt, 
          contextText,
          difficulty: aiDifficulty,
          count: aiCount
        })
      });
      
      const rawText = await res.text();
      let data: any;
      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error(rawText.slice(0, 150) || 'Server returned an invalid response.');
      }
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate AI questions');
      }
      
      if (data.questions && Array.isArray(data.questions)) {
        setQuestions(data.questions);
        const selectedDiff = aiDifficulty === 'ALL' ? 'MIXED' : aiDifficulty;
        setTestDetails(prev => ({ 
          ...prev, 
          difficulty: selectedDiff,
          title: prev.title ? prev.title : `AI Test: ${aiPrompt} (${selectedDiff})` 
        }));
      }
      
      setShowAIModal(false);
      setShowPDFModal(false);
    } catch (err: any) {
      setError("AI Generation failed: " + err.message);
      setShowAIModal(false);
      setShowPDFModal(false);
    } finally {
      setAiGenerating(false);
    }
  };

  // Actual File Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/parse-pdf', {
        method: 'POST',
        body: formData,
      });

      const rawText = await res.text();
      let data: any;
      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error(rawText.slice(0, 150) || 'Failed to parse file');
      }

      if (!res.ok) {
        throw new Error(data.error || 'Failed to parse file');
      }

      setContextText(prev => prev ? prev + '\n\n' + data.text : data.text);
      if (!aiPrompt) {
        setAiPrompt('Generate 5 multiple choice questions with options and explanation based on this material');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to extract text from PDF');
    } finally {
      setIsParsing(false);
      e.target.value = '';
    }
  };

  // URL Fetch Handler
  const handleFetchUrl = async () => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = contextText.match(urlRegex);
    if (!urls || urls.length === 0) return;

    setIsParsing(true);
    try {
      for (const url of urls) {
        const res = await fetch('/api/fetch-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url })
        });
        if (res.ok) {
          const data = await res.json();
          setContextText(prev => prev.replace(url, `[Extracted from ${url}]:\n${data.text}`));
        }
      }
    } catch (err) {
      console.error('Failed to fetch URL contents', err);
    } finally {
      setIsParsing(false);
    }
  };

  const handleSaveTest = async (isPublish: boolean = true) => {
    if (isPublish) {
      setPublishing(true);
    } else {
      setSavingDraft(true);
    }
    setError(null);

    try {
      if (!testDetails.title.trim()) throw new Error("Test title is required");
      if (questions.length === 0) throw new Error("Please add at least one question");
      
      for (let i = 0; i < questions.length; i++) {
        if (!questions[i].question_text.trim()) throw new Error(`Question ${i + 1} text is empty`);
        if (questions[i].options.some(opt => !opt.trim())) throw new Error(`Question ${i + 1} has empty options`);
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated. Please log in.");

      // Ensure teacher profile exists in profiles table to prevent foreign key or RLS subquery failure
      try {
        await supabase.from('profiles').upsert({
          id: session.user.id,
          role: 'teacher',
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Teacher'
        }, { onConflict: 'id' });
      } catch (profErr) {
        console.warn('Profile sync notice:', profErr);
      }

      // Tag description with [TYPE:mock] or [TYPE:practice] or [TYPE:live]
      let cleanDesc = (testDetails.description || '')
        .replace(/^\[TYPE:[a-z]+\]\s*/i, '')
        .replace(/\[PASSCODE:[^\]]+\]/i, '')
        .trim();

      let taggedDescription = `[TYPE:${testType}] ${cleanDesc}`.trim();
      if (testType === 'live') {
        const finalCode = (livePasscode.trim() || generateRandomPasscode()).toUpperCase();
        taggedDescription = `[TYPE:live] [PASSCODE:${finalCode}] ${cleanDesc}`.trim();
      }

      let targetTestId = editingTestId;
      if (editingTestId) {
        const { error: testError } = await supabase
          .from('tests')
          .update({
            title: testDetails.title.trim(),
            description: taggedDescription,
            category: testDetails.category,
            difficulty: testDetails.difficulty,
            duration_minutes: testDetails.duration_minutes,
            total_questions: questions.length,
            is_active: isPublish
          })
          .eq('id', editingTestId);

        if (testError) throw testError;

        // Delete old questions to re-insert clean updated set
        await supabase.from('questions').delete().eq('test_id', editingTestId);
      } else {
        const { data: testData, error: testError } = await supabase
          .from('tests')
          .insert({
            title: testDetails.title.trim(),
            description: taggedDescription,
            category: testDetails.category,
            difficulty: testDetails.difficulty,
            duration_minutes: testDetails.duration_minutes,
            total_questions: questions.length,
            created_by: session.user.id,
            is_active: isPublish
          })
          .select('id')
          .single();

        if (testError) throw testError;
        targetTestId = testData.id;
      }

      const formattedQuestions = questions.map(q => ({
        test_id: targetTestId,
        question_text: q.question_text,
        options: q.options,
        correct_answer: q.options[q.correct_answer],
        explanation: q.explanation
      }));

      const { error: qError } = await supabase.from('questions').insert(formattedQuestions);
      if (qError) throw qError;

      // Navigate to the relevant tests list page so teacher sees their updated/created test
      if (testType === 'practice') {
        router.push('/teacher/dashboard/tests/practice');
      } else if (testType === 'live') {
        router.push('/teacher/dashboard/tests/live');
      } else {
        router.push('/teacher/dashboard/tests/mock');
      }
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.includes('row-level security') || msg.includes('violates row-level security')) {
        setError("Database Permission Notice: Supabase RLS policy must be configured. Please run the supabase_rls_fix.sql script in Supabase SQL editor.");
      } else {
        setError(msg || 'An error occurred while saving the test.');
      }
    } finally {
      setPublishing(false);
      setSavingDraft(false);
    }
  };

  const backLink = testType === 'practice' 
    ? '/teacher/dashboard/tests/practice' 
    : testType === 'live' 
    ? '/teacher/dashboard/tests/live' 
    : '/teacher/dashboard/tests/mock';

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href={backLink} className="p-2 bg-white text-slate-500 hover:text-indigo-600 rounded-xl hover:bg-indigo-50 transition-colors shadow-sm border border-slate-200">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {editingTestId ? 'Edit Assessment' : 'Test Builder'}
              </h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                testType === 'mock' ? 'bg-indigo-100 text-indigo-700' : testType === 'practice' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
              }`}>
                {testType === 'mock' ? 'Mock Test' : testType === 'practice' ? 'Practice Test' : 'Live Exam'}
              </span>
            </div>
            <p className="text-slate-500 text-sm font-medium">
              {editingTestId ? 'Update questions, options, and test details' : 'Create, draft, and publish new assessments'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link 
            href={backLink}
            className="px-4 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors text-sm"
          >
            Cancel
          </Link>

          <button 
            type="button"
            onClick={() => handleSaveTest(false)}
            disabled={savingDraft || publishing || isLoadingTest}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-bold transition-all border border-slate-300 disabled:opacity-50 text-sm shadow-sm"
          >
            {savingDraft ? <Loader2 size={16} className="animate-spin text-slate-600" /> : <Save size={16} className="text-slate-600" />}
            {savingDraft ? 'Saving...' : editingTestId ? 'Save Changes' : 'Save Draft'}
          </button>

          <button 
            type="button"
            onClick={() => handleSaveTest(true)}
            disabled={savingDraft || publishing || isLoadingTest}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-indigo-500/20 disabled:opacity-50 text-sm"
          >
            {publishing ? <Loader2 size={16} className="animate-spin text-white" /> : <Send size={16} />}
            {publishing ? 'Publishing...' : editingTestId ? 'Update & Publish' : 'Publish Test'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-center gap-3 border border-red-100 font-medium">
          <AlertCircle size={20} /> {error}
        </div>
      )}

        {/* AI & Bulk Upload Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={() => setShowAIModal(true)}
              className="relative overflow-hidden group bg-gradient-to-br from-violet-600 to-indigo-700 p-6 rounded-3xl text-left border border-indigo-500/30 shadow-lg shadow-indigo-900/10 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              
              <div className="relative z-10 flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white border border-white/20">
                  <Sparkles size={28} className="group-hover:animate-pulse" />
                </div>
                <div>
                  <h3 className="text-white font-extrabold text-lg">Generate with AI</h3>
                  <p className="text-indigo-100 text-sm font-medium mt-1">Let AI instantly write questions for any topic.</p>
                </div>
              </div>
            </button>

            <button 
              onClick={() => setShowPDFModal(true)}
              className="relative overflow-hidden group bg-white p-6 rounded-3xl text-left border-2 border-dashed border-emerald-300 hover:border-emerald-500 hover:bg-emerald-50 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform duration-300">
                  <Upload size={28} />
                </div>
                <div>
                  <h3 className="text-slate-900 font-extrabold text-lg group-hover:text-emerald-700 transition-colors">Bulk Import (PDF / Link)</h3>
                  <p className="text-slate-500 text-sm font-medium mt-1">Extract questions from notes or links.</p>
                </div>
              </div>
            </button>
        </div>

        {/* Test Settings */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4 flex items-center gap-2">
          <Settings size={20} className="text-indigo-500" /> Test Configuration
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Assessment Type</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTestType('mock')}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 border transition-all ${
                  testType === 'mock' 
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20' 
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                🏆 Mock Test
              </button>
              <button
                type="button"
                onClick={() => setTestType('practice')}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 border transition-all ${
                  testType === 'practice' 
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20' 
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                📝 Practice Test
              </button>
              <button
                type="button"
                onClick={() => {
                  setTestType('live');
                  if (!livePasscode) setLivePasscode(generateRandomPasscode());
                }}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 border transition-all ${
                  testType === 'live' 
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20' 
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                🔴 Live Exam
              </button>
            </div>
          </div>

          {testType === 'live' && (
            <div className="p-4 bg-rose-50/80 border border-rose-200 rounded-2xl space-y-2 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-bold text-rose-950">
                  <KeyRound size={16} className="text-rose-600" /> Live Exam Access Passcode
                </label>
                <button
                  type="button"
                  onClick={() => setLivePasscode(generateRandomPasscode())}
                  className="text-xs font-bold text-rose-700 hover:text-rose-900 bg-white px-2.5 py-1 rounded-lg border border-rose-200 shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw size={12} /> Generate New Code
                </button>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. LIVE-7429 or MATH101"
                  value={livePasscode}
                  onChange={e => setLivePasscode(e.target.value.toUpperCase())}
                  className="w-full bg-white border border-rose-200 rounded-xl px-4 py-2.5 text-rose-950 font-mono font-extrabold text-base tracking-widest focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all uppercase"
                />
              </div>
              <p className="text-xs text-rose-700 font-medium leading-relaxed">
                🔒 Students must enter this passcode to unlock and start this live assessment. Share this passcode in your WhatsApp group 5 minutes before the exam!
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Test Title</label>
            <input 
              type="text" 
              placeholder="e.g. Profit & Loss Advanced Level"
              value={testDetails.title}
              onChange={e => setTestDetails({...testDetails, title: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Description <span className="text-slate-400 font-normal">(Optional)</span></label>
            <textarea 
              rows={2}
              placeholder="Briefly describe what this test covers..."
              value={testDetails.description}
              onChange={e => setTestDetails({...testDetails, description: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Category</label>
              <select 
                value={testDetails.category}
                onChange={e => setTestDetails({...testDetails, category: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
              >
                <option value="aptitude">Aptitude</option>
                <option value="reasoning">Reasoning</option>
                <option value="verbal">Verbal</option>
                <option value="custom">Custom / Core Subject</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Difficulty</label>
              <select 
                value={testDetails.difficulty}
                onChange={e => setTestDetails({...testDetails, difficulty: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
              >
                <option value="EASY">Easy (Level 1)</option>
                <option value="MEDIUM">Medium (Level 2)</option>
                <option value="HARD">Hard (Level 3)</option>
                <option value="MIXED">All 3 Levels (Progressive)</option>
              </select>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-bold text-slate-700">Duration (Minutes)</label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setTestDetails(prev => ({ ...prev, duration_minutes: Math.max(1, questions.length) }))}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded transition-colors"
                    title="1 minute per question"
                  >
                    ⚡ 1m/Q ({questions.length}m)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTestDetails(prev => ({ ...prev, duration_minutes: Math.max(1, Math.round(questions.length * 1.5)) }))}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded transition-colors"
                    title="1.5 minutes per question"
                  >
                    ⚡ 1.5m/Q ({Math.round(questions.length * 1.5)}m)
                  </button>
                </div>
              </div>
              <div className="relative">
                <Clock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="number" 
                  min="1"
                  value={testDetails.duration_minutes}
                  onChange={e => setTestDetails({...testDetails, duration_minutes: parseInt(e.target.value) || 0})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Questions Builder */}
      <div className="space-y-6">
        <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
          <BookOpen className="text-indigo-600" /> Question Editor ({questions.length})
        </h2>

        {questions.map((q, qIndex) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={qIndex} 
            className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm relative group"
          >
            {questions.length > 1 && (
              <button 
                onClick={() => handleRemoveQuestion(qIndex)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={18} />
              </button>
            )}

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold shrink-0 mt-1">
                {qIndex + 1}
              </div>
              
              <div className="flex-1 space-y-6">
                <div>
                  <textarea 
                    rows={2}
                    placeholder="Type your question here..."
                    value={q.question_text}
                    onChange={(e) => handleQuestionChange(qIndex, 'question_text', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {q.options.map((opt, optIndex) => (
                    <div 
                      key={optIndex} 
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                        q.correct_answer === optIndex 
                          ? 'border-emerald-500 bg-emerald-50/50' 
                          : 'border-slate-100 bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <input 
                        type="radio"
                        name={`correct_answer_${qIndex}`}
                        checked={q.correct_answer === optIndex}
                        onChange={() => handleQuestionChange(qIndex, 'correct_answer', optIndex)}
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300"
                      />
                      <input 
                        type="text"
                        placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                        value={opt}
                        onChange={(e) => handleQuestionChange(qIndex, `option_${optIndex}`, e.target.value)}
                        className="flex-1 bg-transparent focus:outline-none text-sm font-medium text-slate-700"
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Explanation (Optional)</label>
                  <textarea 
                    rows={1}
                    placeholder="Explain why the answer is correct..."
                    value={q.explanation}
                    onChange={(e) => handleQuestionChange(qIndex, 'explanation', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium resize-none"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        <button 
          onClick={handleAddQuestion}
          className="w-full border-2 border-dashed border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 hover:border-indigo-300 text-indigo-700 font-bold py-6 rounded-3xl flex flex-col items-center justify-center gap-2 transition-all hover:scale-[1.01]"
        >
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
            <Plus size={20} />
          </div>
          Add Blank Question
        </button>
      </div>

      {/* Save Button at the Bottom */}
      <div className="pt-8 mt-8 border-t border-slate-200">
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-center gap-3 border border-red-100 font-medium mb-6">
            <AlertCircle size={20} /> {error}
          </div>
        )}
        <div className="flex flex-wrap items-center justify-end gap-3">
          <Link 
            href={backLink} 
            className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors text-sm"
          >
            Cancel
          </Link>
          <button 
            type="button"
            onClick={() => handleSaveTest(false)}
            disabled={savingDraft || publishing || isLoadingTest}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 px-6 py-3 rounded-xl font-bold transition-all border border-slate-300 disabled:opacity-50 shadow-sm text-sm"
          >
            {savingDraft ? <Loader2 size={18} className="animate-spin text-slate-700" /> : <Save size={18} className="text-slate-700" />}
            {savingDraft ? 'Saving...' : editingTestId ? 'Save Changes' : 'Save as Draft'}
          </button>
          <button 
            type="button"
            onClick={() => handleSaveTest(true)}
            disabled={savingDraft || publishing || isLoadingTest}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-extrabold transition-all shadow-lg shadow-indigo-500/30 disabled:opacity-50 hover:-translate-y-0.5 text-sm"
          >
            {publishing ? <Loader2 size={18} className="animate-spin text-white" /> : <Send size={18} />}
            {publishing ? 'Publishing...' : editingTestId ? 'Update & Publish' : 'Publish Test'}
          </button>
        </div>
      </div>

      {/* AI GENERATOR MODAL */}
      <AnimatePresence>
        {showAIModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => !aiGenerating && setShowAIModal(false)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md relative z-10 shadow-2xl"
            >
              {!aiGenerating ? (
                <>
                  <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                    <Sparkles size={24} />
                  </div>
                  <h2 className="text-2xl font-extrabold text-slate-900 mb-2">AI Test Generator</h2>
                  <p className="text-slate-500 text-sm mb-6">Describe the topic, and AI will create questions, options, and explanations instantly.</p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Topic / Prompt</label>
                      <textarea 
                        autoFocus
                        rows={3}
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="e.g. Generate 5 questions about logical reasoning and syllogisms..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium resize-none text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Output Mode</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setGenerateMode('single')}
                          className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all ${
                            generateMode === 'single'
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          Single Test
                        </button>
                        <button
                          type="button"
                          onClick={() => setGenerateMode('three_tests')}
                          className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all ${
                            generateMode === 'three_tests'
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          ⚡ 3 Separate Tests
                        </button>
                      </div>
                    </div>

                    {generateMode === 'single' ? (
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-sm font-bold text-slate-700">Difficulty Level</label>
                          <span className="text-xs text-indigo-600 font-bold">
                            {aiDifficulty === 'EASY' ? 'Level 1' : aiDifficulty === 'MEDIUM' ? 'Level 2' : aiDifficulty === 'HARD' ? 'Level 3' : 'All 3 Levels'}
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-1.5">
                          {[
                            { id: 'EASY', label: 'Easy (L1)' },
                            { id: 'MEDIUM', label: 'Medium (L2)' },
                            { id: 'HARD', label: 'Hard (L3)' },
                            { id: 'ALL', label: 'Mixed' }
                          ].map(lvl => (
                            <button
                              key={lvl.id}
                              type="button"
                              onClick={() => setAiDifficulty(lvl.id)}
                              className={`py-2 px-1 text-xs font-bold rounded-xl border text-center transition-all ${
                                aiDifficulty === lvl.id
                                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {lvl.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-900 text-xs font-medium space-y-1">
                        <div className="font-bold text-indigo-700">🚀 3-Level Pack Activated:</div>
                        <div>Generates and saves <strong>3 separate tests</strong> in your dashboard: Easy (Level 1), Medium (Level 2), and Hard (Level 3).</div>
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-sm font-bold text-slate-700">Questions Per Test</label>
                        <span className="text-xs text-indigo-600 font-bold">{aiCount} Questions</span>
                      </div>
                      <div className="grid grid-cols-5 gap-1.5">
                        {[5, 10, 15, 20, 30].map(cnt => (
                          <button
                            key={cnt}
                            type="button"
                            onClick={() => setAiCount(cnt)}
                            className={`py-1.5 text-xs font-bold rounded-xl border text-center transition-all ${
                              aiCount === cnt
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {cnt}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button 
                      onClick={handleAIGenerate}
                      disabled={!aiPrompt}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl disabled:opacity-50 transition-colors shadow-lg shadow-indigo-500/25 text-sm"
                    >
                      {generateMode === 'three_tests' ? '⚡ Generate & Save 3 Tests (Easy, Med, Hard)' : 'Generate Questions'}
                    </button>
                    <button 
                      onClick={() => setShowAIModal(false)}
                      className="w-full text-slate-500 font-bold py-2 hover:text-slate-900 transition-colors text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <div className="py-10 flex flex-col items-center justify-center text-center">
                  <div className="relative w-20 h-20 mb-6">
                    <div className="absolute inset-0 bg-indigo-100 rounded-full animate-ping"></div>
                    <div className="absolute inset-0 bg-white rounded-full flex items-center justify-center border-4 border-indigo-500">
                      <Sparkles className="text-indigo-600 animate-pulse" size={32} />
                    </div>
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 mb-2">AI is analyzing...</h3>
                  <p className="text-slate-500 text-sm max-w-[250px]">Generating accurate questions, distractor options, and explanations.</p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PDF UPLOAD MODAL */}
      <AnimatePresence>
        {showPDFModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => !aiGenerating && setShowPDFModal(false)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md relative z-10 shadow-2xl"
            >
              {!aiGenerating ? (
                <>
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
                    <FileText size={24} />
                  </div>
                  <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Upload or Paste Material</h2>
                  <p className="text-slate-500 text-sm mb-4">Upload a file, or paste notes/links below, and let AI generate questions based exactly on this content.</p>
                  
                  <div className="space-y-4 mb-6">
                    <label className="border-2 border-dashed border-slate-200 bg-slate-50 rounded-2xl p-4 flex flex-col items-center justify-center text-center hover:bg-slate-100 transition-colors hover:border-emerald-300 cursor-pointer relative">
                      <input type="file" className="hidden" accept=".pdf" onChange={handleFileUpload} />
                      <Upload className="text-slate-400 mb-2" size={24} />
                      <p className="text-sm font-bold text-slate-700">Click to upload PDF</p>
                      {isParsing && <p className="text-xs text-emerald-600 font-bold mt-2 animate-pulse">Extracting text from PDF...</p>}
                    </label>

                    {error && (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                        <AlertCircle size={16} className="shrink-0 text-rose-500" />
                        <span className="flex-1 font-medium">{error}</span>
                      </div>
                    )}

                    {contextText && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center justify-between">
                        <div className="flex items-center gap-2 font-bold">
                          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                          <span>PDF text extracted ({contextText.length} characters)</span>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => { setContextText(''); setError(null); }} 
                          className="text-slate-400 hover:text-rose-600 text-[11px] font-bold underline"
                        >
                          Clear
                        </button>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Paste Notes or Link</label>
                      <div className="relative">
                        <textarea 
                          rows={3}
                          value={contextText}
                          onChange={(e) => setContextText(e.target.value)}
                          placeholder="Paste your chapter notes, syllabus, or an article link here..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium resize-none"
                        />
                        {/(https?:\/\/[^\s]+)/.test(contextText) && (
                          <button 
                            type="button"
                            onClick={handleFetchUrl}
                            disabled={isParsing}
                            className="absolute bottom-2 right-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-xs font-bold py-1 px-2 rounded"
                          >
                            {isParsing ? 'Fetching...' : 'Extract Link'}
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Output Mode</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setGenerateMode('single')}
                          className={`py-1.5 px-2 text-xs font-bold rounded-xl border text-center transition-all ${
                            generateMode === 'single'
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          Single Test
                        </button>
                        <button
                          type="button"
                          onClick={() => setGenerateMode('three_tests')}
                          className={`py-1.5 px-2 text-xs font-bold rounded-xl border text-center transition-all ${
                            generateMode === 'three_tests'
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          ⚡ 3 Tests (Easy, Med, Hard)
                        </button>
                      </div>
                    </div>

                    {generateMode === 'single' ? (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Difficulty</label>
                          <select 
                            value={aiDifficulty}
                            onChange={(e) => setAiDifficulty(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                          >
                            <option value="EASY">Easy (Level 1)</option>
                            <option value="MEDIUM">Medium (Level 2)</option>
                            <option value="HARD">Hard (Level 3)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Question Count</label>
                          <select 
                            value={aiCount}
                            onChange={(e) => setAiCount(parseInt(e.target.value) || 5)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                          >
                            <option value={5}>5 Questions</option>
                            <option value={10}>10 Questions</option>
                            <option value={15}>15 Questions</option>
                            <option value={20}>20 Questions</option>
                            <option value={30}>30 Questions</option>
                          </select>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-medium">
                        <strong>⚡ 3-Level Series:</strong> AI will generate <strong>3 separate tests</strong> from this material: Easy (L1), Medium (L2), and Hard (L3).
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">AI Instructions</label>
                      <input 
                        type="text"
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="e.g. Generate multiple choice questions with explanation based on this material"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                      />
                    </div>
                  </div>

                  <button 
                    onClick={handleAIGenerate}
                    disabled={!aiPrompt || !contextText}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl disabled:opacity-50 transition-colors shadow-lg shadow-emerald-500/25 text-sm"
                  >
                    {generateMode === 'three_tests' ? '⚡ Generate & Save 3 Tests (Easy, Med, Hard)' : 'Generate from Material'}
                  </button>
                  <button 
                    onClick={() => setShowPDFModal(false)}
                    className="w-full text-slate-500 font-bold py-2 mt-2 hover:text-slate-900 transition-colors text-xs"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <div className="py-10 flex flex-col items-center justify-center text-center">
                  <div className="relative w-20 h-20 mb-6">
                    <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping"></div>
                    <div className="absolute inset-0 bg-white rounded-full flex items-center justify-center border-4 border-emerald-500">
                      <FileJson className="text-emerald-600 animate-pulse" size={32} />
                    </div>
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 mb-2">Processing Document</h3>
                  <p className="text-slate-500 text-sm max-w-[250px]">Running OCR and parsing text into formatted questions...</p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
