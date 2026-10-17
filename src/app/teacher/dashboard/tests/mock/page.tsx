'use client'

import { useState, useEffect } from 'react';
import { PlusCircle, Edit3, Trash2, Send, Search, Calculator, BrainCircuit, MessageSquare, ChevronLeft, Upload, Edit2, Trophy, Clock, PlayCircle, Users, Activity, Download, Loader2, Sparkles, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { supabase } from '@/utils/supabase';
import { parseCohortTarget } from '@/utils/cohort';

export default function TeacherMockTestsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [isCreating, setIsCreating] = useState(false);
  const [createStep, setCreateStep] = useState(1);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [mockDuration, setMockDuration] = useState<number>(30);
  const [dbTests, setDbTests] = useState<any[]>([]);
  const [loadingDb, setLoadingDb] = useState(true);

  // 3-Test Series Generator States
  const [showThreeTestModal, setShowThreeTestModal] = useState(false);
  const [threeTestTitle, setThreeTestTitle] = useState('');
  const [threeTestPrompt, setThreeTestPrompt] = useState('');
  const [threeTestCount, setThreeTestCount] = useState(5);
  const [threeTestDuration, setThreeTestDuration] = useState(30);
  const [threeTestGenerating, setThreeTestGenerating] = useState(false);
  const [threeTestStep, setThreeTestStep] = useState('');
  const [threeTestError, setThreeTestError] = useState<string | null>(null);

  const fetchDbTests = async () => {
    try {
      setLoadingDb(true);
      const { data, error } = await supabase
        .from('tests')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        // Read deleted IDs from localStorage
        let deletedList: string[] = [];
        try {
          const stored = localStorage.getItem('testwise_deleted_test_ids');
          if (stored) deletedList = JSON.parse(stored);
        } catch (e) {}

        const cleanData = data.filter((t: any) => {
          if (deletedList.includes(t.id)) return false;
          // Filter out seed/dummy tests
          if (/^[123]{8}-[123]{4}-[123]{4}-[123]{4}-[123]{12}$/.test(t.id)) return false;
          const title = (t.title || '').trim().toLowerCase();
          if (title === 'basic aptitude test' || title === 'logical reasoning mock') return false;
          return true;
        });
        setDbTests(cleanData);
      }
    } catch (err) {
      console.error('Failed to load tests:', err);
    } finally {
      setLoadingDb(false);
    }
  };

  useEffect(() => {
    fetchDbTests();
  }, []);

  // Convert real Supabase tests into mock cards
  const formattedDbTests = dbTests
    .filter(t => {
      const desc = t.description || '';
      if (desc.includes('[DELETED]')) return false;
      if (desc.includes('[TYPE:practice]') || desc.includes('[TYPE:live]')) return false;
      if (activeTab === 'all') return true;
      return (t.category || '').toLowerCase() === activeTab;
    })
    .map(t => {
      const cohort = parseCohortTarget(t.description);
      return {
        id: t.id,
        title: t.title,
        description: t.description,
        category: (t.category || '').toLowerCase(),
        difficulty: (t.difficulty || 'MEDIUM').toUpperCase(),
        questions: t.total_questions || 0,
        mins: t.duration_minutes || 30,
        status: t.is_active ? 'published' : 'draft',
        attempted: 0,
        avgScore: '--',
        highestScore: '--',
        passRate: '--',
        avgSubmissionTime: '--',
        isDb: true,
        cohort
      };
    });

  const filteredTests = formattedDbTests;

  const handleGenerateThreeTests = async () => {
    if (!threeTestTitle.trim()) {
      setThreeTestError('Please provide a title for the test series.');
      return;
    }

    setThreeTestGenerating(true);
    setThreeTestError(null);
    setThreeTestStep('Generating Easy, Medium, and Hard question sets via Gemini AI...');

    try {
      const res = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: threeTestPrompt.trim() || threeTestTitle.trim(),
          count: threeTestCount,
          generateThreeTests: true
        })
      });

      const rawText = await res.text();
      let data: any;
      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error(rawText.slice(0, 150) || 'Server returned invalid response.');
      }

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate questions');
      }

      const { easy, medium, hard } = data.threeTests || {};
      if (!easy?.length && !medium?.length && !hard?.length) {
        throw new Error('AI could not generate questions for 3 levels.');
      }

      setThreeTestStep('Connecting to database...');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated. Please log in.');

      // Ensure profile exists in profiles table
      try {
        await supabase.from('profiles').upsert({
          id: session.user.id,
          role: 'teacher',
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Teacher'
        }, { onConflict: 'id' });
      } catch (profErr) {
        console.warn('Profile sync:', profErr);
      }

      const seriesLevels = [
        { level: 'EASY', label: 'Easy (Level 1)', questions: easy },
        { level: 'MEDIUM', label: 'Medium (Level 2)', questions: medium },
        { level: 'HARD', label: 'Hard (Level 3)', questions: hard }
      ];

      for (let i = 0; i < seriesLevels.length; i++) {
        const item = seriesLevels[i];
        setThreeTestStep(`Saving Test ${i + 1} of 3: ${item.label}...`);

        const testTitle = `${threeTestTitle.trim()} - ${item.label}`;
        const taggedDesc = `[TYPE:mock] ${threeTestTitle.trim()} - ${item.label}`;

        const { data: testRow, error: tErr } = await supabase
          .from('tests')
          .insert({
            title: testTitle,
            description: taggedDesc,
            category: selectedCourse.toLowerCase(),
            difficulty: item.level,
            duration_minutes: threeTestDuration,
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

      setShowThreeTestModal(false);
      setIsCreating(false);
      await fetchDbTests();
      alert(`🎉 Success! Created 3 separate tests:\n1. ${threeTestTitle} - Easy (Level 1)\n2. ${threeTestTitle} - Medium (Level 2)\n3. ${threeTestTitle} - Hard (Level 3)`);
    } catch (err: any) {
      console.error('Three-Test generation error:', err);
      setThreeTestError(err.message || 'Failed to generate 3 tests.');
    } finally {
      setThreeTestGenerating(false);
    }
  };

  const handleDelete = async (test: any) => {
    if (!confirm(`Are you sure you want to delete "${test.title}"?`)) return;

    // 1. Immediately store in persistent localStorage blacklist so it NEVER reappears
    try {
      const stored = localStorage.getItem('testwise_deleted_test_ids');
      const list = stored ? JSON.parse(stored) : [];
      if (!list.includes(test.id)) {
        list.push(test.id);
        localStorage.setItem('testwise_deleted_test_ids', JSON.stringify(list));
      }
    } catch (e) {
      console.error('LocalStorage write error:', e);
    }

    // 2. Immediately remove from React state (instant UI update)
    setDbTests(prev => prev.filter(t => t.id !== test.id));

    // 3. Attempt DB hard delete & soft delete in background
    try {
      await supabase.from('questions').delete().eq('test_id', test.id);
      const { error } = await supabase.from('tests').delete().eq('id', test.id);
      if (error) {
        await supabase.from('tests').update({ 
          is_active: false, 
          description: `[DELETED] ${test.description || ''}` 
        }).eq('id', test.id);
      }
    } catch (err: any) {
      console.error('Delete error:', err);
      try {
        await supabase.from('tests').update({ 
          is_active: false, 
          description: `[DELETED] ${test.description || ''}` 
        }).eq('id', test.id);
      } catch (innerErr) {}
    }
  };

  const handlePublishDirect = async (test: any) => {
    try {
      const { error } = await supabase
        .from('tests')
        .update({ is_active: true })
        .eq('id', test.id);

      if (error) {
        alert('Failed to publish: ' + error.message);
      } else {
        fetchDbTests();
      }
    } catch (err: any) {
      alert('Error publishing test: ' + err.message);
    }
  };

  const handleCopyInvite = (testId: string | number) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://testwise.com';
    navigator.clipboard.writeText(`${origin}/student/take-test/${testId}`);
    alert('Test Invite Link copied to clipboard!');
  };

  const handleStartCreate = () => {
    setIsCreating(true);
    setCreateStep(1);
    setSelectedCourse('');
  };

  const handleCancelCreate = () => {
    setIsCreating(false);
  };

  const tabs = [
    { id: 'all', label: 'All Mocks', icon: Trophy },
    { id: 'aptitude', label: 'Aptitude', icon: Calculator },
    { id: 'reasoning', label: 'Reasoning', icon: BrainCircuit },
    { id: 'verbal', label: 'Verbal', icon: MessageSquare },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {!isCreating ? (
        <>
          {/* Dashboard Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Manage Mock Tests</h1>
              <p className="text-slate-600 mt-1">Create full-length timed mock exams and view detailed candidate performance.</p>
            </div>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartCreate} 
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-md hover:shadow-indigo-500/20"
            >
              <PlusCircle size={20} />
              Create Mock Test
            </motion.button>
          </div>

          {/* Tabs */}
          <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex overflow-x-auto hide-scrollbar snap-x gap-2 relative">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)} 
                  className={`relative flex-1 min-w-[120px] snap-start flex justify-center items-center gap-2 px-6 py-3 rounded-xl font-bold transition-colors z-10 ${isActive ? 'text-indigo-700' : 'text-slate-600 hover:text-indigo-600'}`}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="mock-active-tab"
                      className="absolute inset-0 bg-indigo-50 rounded-xl -z-10"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <tab.icon size={18} className={isActive ? 'text-indigo-600' : ''} /> {tab.label}
                </button>
              );
            })}
          </div>

          {/* Mocks List */}
          <motion.div layout className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredTests.map((test) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ y: -2 }}
                  key={test.id} 
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-400 hover:shadow-indigo-500/10 transition-all p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start sm:items-center group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-50 to-transparent rounded-bl-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white rounded-2xl flex items-center justify-center shrink-0 transition-colors shadow-sm group-hover:shadow-lg group-hover:shadow-indigo-500/30">
                    {test.status === 'published' ? <PlayCircle size={32} /> : <Edit2 size={32} />}
                  </div>
                  
                  <div className="flex-1 w-full">
                    <div className="flex items-center gap-3 mb-2">
                      {test.status === 'published' ? (
                        <>
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-100">Published</span>
                          {test.attempted > 0 && <span className="px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold rounded flex items-center gap-1 border border-slate-200">{test.passRate} Pass</span>}
                        </>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-100">Draft</span>
                          <button 
                            onClick={() => handlePublishDirect(test)} 
                            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-full shadow-sm flex items-center gap-1 transition-all"
                          >
                            <Send size={11} /> Publish Now
                          </button>
                        </div>
                      )}
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                        test.difficulty === 'EASY' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        test.difficulty === 'HARD' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {test.difficulty === 'EASY' ? 'Easy (L1)' : test.difficulty === 'HARD' ? 'Hard (L3)' : 'Medium (L2)'}
                      </span>
                      {test.cohort?.isRestricted ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                          🎯 {test.cohort.stream !== 'All' ? test.cohort.stream : ''} {test.cohort.branch !== 'All' ? test.cohort.branch : ''} {test.cohort.section !== 'All' ? `(Sec ${test.cohort.section})` : ''}
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1">
                          👥 All Enrolled
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{test.title}</h3>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-600 font-medium mb-4">
                      <span className="flex items-center gap-1.5"><Trophy size={16} className="text-indigo-500" /> {test.questions} Questions</span>
                      <span className="flex items-center gap-1.5"><Clock size={16} className="text-slate-400" /> {test.mins} Minutes</span>
                    </div>

                    {/* Analytics Grid */}
                    {test.status === 'published' && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50/80 p-3 rounded-xl border border-slate-100 mt-2">
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1"><Users size={12}/> Attempted</span>
                          <span className="font-bold text-slate-700">{test.attempted}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1"><Activity size={12}/> Avg Score</span>
                          <span className="font-bold text-indigo-600">{test.avgScore}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1"><Clock size={12}/> Sub Time</span>
                          <span className="font-bold text-slate-700">{test.avgSubmissionTime}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1"><Trophy size={12}/> Highest</span>
                          <span className="font-bold text-emerald-600">{test.highestScore}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex sm:flex-col gap-2 relative z-10 w-full sm:w-auto mt-4 sm:mt-0">
                    <motion.button onClick={() => handleCopyInvite(test.id)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1 sm:flex-none flex justify-center items-center gap-2 py-2.5 px-4 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl text-sm font-bold transition-colors shadow-sm">
                      <Send size={16} /> Copy Invite Link
                    </motion.button>
                    <div className="flex gap-2 mt-1">
                      <motion.button onClick={() => alert('Report downloaded!')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} title="Download Report" className="flex-1 flex justify-center items-center py-2.5 px-4 bg-slate-50 text-slate-600 hover:bg-emerald-600 hover:text-white rounded-xl transition-colors shadow-sm">
                        <Download size={18} />
                      </motion.button>
                      <Link href={`/teacher/dashboard/tests/create?edit=${test.id}`} title="Edit" className="flex-1 flex justify-center items-center py-2.5 px-4 bg-slate-50 text-slate-600 hover:bg-slate-800 hover:text-white rounded-xl transition-colors shadow-sm">
                        <Edit3 size={18} />
                      </Link>
                      <motion.button onClick={() => handleDelete(test)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} title="Delete" className="flex-1 flex justify-center items-center py-2.5 px-4 bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white rounded-xl transition-colors shadow-sm">
                        <Trash2 size={18} />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {filteredTests.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="col-span-full bg-white p-12 rounded-2xl border border-slate-200 text-center flex flex-col items-center justify-center"
              >
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-4">
                  <Search size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No mocks found</h3>
                <p className="text-slate-500 max-w-sm">You haven't created any mock tests in this category yet. Click 'Create Mock Test' to get started.</p>
              </motion.div>
            )}
          </motion.div>
        </>
      ) : (
        /* CREATE TEST FLOW */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 animate-in slide-in-from-bottom-4 duration-500">
          
          <button onClick={handleCancelCreate} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold mb-8 transition-colors">
            <ChevronLeft size={20} /> Back to Dashboard
          </button>

          <div className="max-w-3xl mx-auto">
            {/* Step Indicators */}
            <div className="flex items-center justify-between mb-12 relative max-w-md mx-auto">
              <div className="absolute left-0 right-0 top-1/2 h-1 bg-slate-100 -z-10"></div>
              {[1, 2].map((step) => (
                <div key={step} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${createStep >= step ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'bg-slate-200 text-slate-500'}`}>
                  {step}
                </div>
              ))}
            </div>

            {/* STEP 1: Select Course */}
            {createStep === 1 && (
              <div className="animate-in fade-in duration-300">
                <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center">Step 1: Select a Course</h2>
                <p className="text-slate-500 text-center mb-8">Mock tests are full-length exams without sub-topics.</p>
                <div className="flex sm:grid sm:grid-cols-3 gap-4 sm:gap-6 overflow-x-auto snap-x hide-scrollbar pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible sm:pb-0">
                  {[
                    { id: 'aptitude', name: 'Aptitude', icon: <Calculator size={32} /> },
                    { id: 'reasoning', name: 'Reasoning', icon: <BrainCircuit size={32} /> },
                    { id: 'verbal', name: 'Verbal', icon: <MessageSquare size={32} /> }
                  ].map((course) => (
                    <button 
                      key={course.id}
                      onClick={() => { setSelectedCourse(course.id); setCreateStep(2); }}
                      className="min-w-[160px] sm:min-w-0 snap-start flex flex-col items-center justify-center p-6 sm:p-8 bg-slate-50 border-2 border-slate-200 rounded-2xl hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-700 transition-all group"
                    >
                      <div className="mb-4 text-slate-400 group-hover:text-indigo-500 transition-colors group-hover:scale-110 duration-300">
                        {course.icon}
                      </div>
                      <span className="font-bold text-lg text-slate-700 group-hover:text-indigo-700">{course.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2: Configure Duration & Select Method */}
            {createStep === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Step 2: Configure Duration & Add Questions</h2>
                  <p className="text-slate-500">Creating a full-length <span className="font-bold text-indigo-600 capitalize">{selectedCourse}</span> Mock Test</p>
                </div>

                {/* Duration Setting Card */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-8 max-w-xl mx-auto text-left shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <Clock size={16} className="text-indigo-600" /> Test Duration (Minutes)
                    </label>
                    <span className="text-xs font-semibold text-slate-500">Date not required for Mock tests</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-4">
                    Choose standard duration based on questions (recommended 1 to 1.5 mins per question):
                  </p>

                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    {[15, 30, 45, 60, 90, 120].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setMockDuration(mins)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                          mockDuration === mins
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-white text-slate-700 border border-slate-200 hover:border-indigo-400'
                        }`}
                      >
                        {mins} mins
                      </button>
                    ))}
                  </div>

                  <div className="relative">
                    <Clock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="number"
                      min="1"
                      value={mockDuration}
                      onChange={(e) => setMockDuration(Math.max(1, parseInt(e.target.value) || 0))}
                      placeholder="Custom duration in minutes"
                      className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Option 1: Manual */}
                  <Link href={`/teacher/dashboard/tests/create?mode=manual&type=mock&category=${selectedCourse}&duration=${mockDuration}`} className="flex flex-col items-center justify-center p-6 bg-white border-2 border-slate-200 rounded-3xl hover:border-indigo-500 hover:shadow-xl transition-all group text-center">
                    <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm">
                      <Edit2 size={26} />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-1">Manual Entry</h3>
                    <p className="text-slate-500 text-xs">Type single test questions and options one by one.</p>
                  </Link>

                  {/* Option 2: Bulk / PDF */}
                  <Link href={`/teacher/dashboard/tests/create?mode=bulk&type=mock&category=${selectedCourse}&duration=${mockDuration}`} className="flex flex-col items-center justify-center p-6 bg-white border-2 border-slate-200 rounded-3xl hover:border-emerald-500 hover:shadow-xl transition-all group text-center">
                    <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm">
                      <Upload size={26} />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-1">Bulk / AI (Single)</h3>
                    <p className="text-slate-500 text-xs">Upload PDF or generate one specific test level.</p>
                  </Link>

                  {/* Option 3: 3-Test Series Generator */}
                  <button 
                    type="button"
                    onClick={() => {
                      const courseName = selectedCourse.charAt(0).toUpperCase() + selectedCourse.slice(1);
                      setThreeTestTitle(`${courseName} Mock Series`);
                      setThreeTestPrompt(`Comprehensive ${courseName} mock exam covering syllabus fundamentals to advanced problems`);
                      setThreeTestDuration(mockDuration);
                      setShowThreeTestModal(true);
                    }}
                    className="flex flex-col items-center justify-center p-6 bg-gradient-to-b from-indigo-50/80 to-white border-2 border-indigo-400 hover:border-indigo-600 rounded-3xl hover:shadow-xl transition-all group text-center relative overflow-hidden"
                  >
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-600 text-white tracking-wider shadow-sm">
                      3 Tests
                    </span>
                    <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-md shadow-indigo-500/30">
                      <Sparkles size={26} />
                    </div>
                    <h3 className="text-base font-extrabold text-indigo-950 mb-1">Generate 3-Level Series</h3>
                    <p className="text-indigo-900/70 text-xs font-medium">Creates 3 separate tests: Easy, Medium & Hard with 1 click!</p>
                  </button>
                </div>
                
                <div className="mt-8 text-center">
                  <button onClick={() => setCreateStep(1)} className="text-slate-500 font-bold hover:text-slate-900">Back</button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* 3-TEST SERIES GENERATOR MODAL */}
      <AnimatePresence>
        {showThreeTestModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => !threeTestGenerating && setShowThreeTestModal(false)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-lg relative z-10 shadow-2xl"
            >
              {!threeTestGenerating ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
                      <Sparkles size={24} />
                    </div>
                    <button 
                      onClick={() => setShowThreeTestModal(false)}
                      className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <h2 className="text-2xl font-extrabold text-slate-900 mb-1">Generate 3-Level Test Series</h2>
                  <p className="text-slate-500 text-xs sm:text-sm mb-6">
                    AI will create and publish <strong className="text-indigo-600">3 separate tests</strong> in your dashboard: Easy (L1), Medium (L2), and Hard (L3).
                  </p>

                  {threeTestError && (
                    <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                      <AlertCircle size={16} className="shrink-0 text-rose-500" />
                      <span>{threeTestError}</span>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Series Base Title</label>
                      <input 
                        type="text"
                        value={threeTestTitle}
                        onChange={(e) => setThreeTestTitle(e.target.value)}
                        placeholder="e.g. Aptitude Comprehensive Mock"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Topic / Syllabus Focus</label>
                      <textarea 
                        rows={2}
                        value={threeTestPrompt}
                        onChange={(e) => setThreeTestPrompt(e.target.value)}
                        placeholder="e.g. Arithmetic, Profit & Loss, Percentage, Time & Distance, Number Systems"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Questions Per Test</label>
                        <div className="grid grid-cols-4 gap-1">
                          {[5, 10, 15, 20].map((cnt) => (
                            <button
                              key={cnt}
                              type="button"
                              onClick={() => setThreeTestCount(cnt)}
                              className={`py-1.5 text-xs font-bold rounded-lg border text-center transition-all ${
                                threeTestCount === cnt
                                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {cnt} Qs
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Duration Per Test</label>
                        <div className="grid grid-cols-3 gap-1">
                          {[15, 30, 45].map((mins) => (
                            <button
                              key={mins}
                              type="button"
                              onClick={() => setThreeTestDuration(mins)}
                              className={`py-1.5 text-xs font-bold rounded-lg border text-center transition-all ${
                                threeTestDuration === mins
                                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {mins}m
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-3.5 text-indigo-950 text-xs space-y-1">
                      <div className="font-extrabold flex items-center gap-1.5 text-indigo-700">
                        <Sparkles size={14} /> 3 Distinct Tests will be created:
                      </div>
                      <div className="text-slate-600 pl-4 space-y-0.5">
                        <div>1. <strong className="text-slate-800">{threeTestTitle || 'Test'} - Easy (Level 1)</strong> ({threeTestCount} Qs)</div>
                        <div>2. <strong className="text-slate-800">{threeTestTitle || 'Test'} - Medium (Level 2)</strong> ({threeTestCount} Qs)</div>
                        <div>3. <strong className="text-slate-800">{threeTestTitle || 'Test'} - Hard (Level 3)</strong> ({threeTestCount} Qs)</div>
                      </div>
                    </div>

                    <button 
                      onClick={handleGenerateThreeTests}
                      disabled={!threeTestTitle.trim()}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-3.5 rounded-xl disabled:opacity-50 transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 text-sm"
                    >
                      <Sparkles size={18} /> Generate & Save All 3 Tests
                    </button>
                  </div>
                </>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="relative w-20 h-20 mb-6">
                    <div className="absolute inset-0 bg-indigo-100 rounded-full animate-ping"></div>
                    <div className="absolute inset-0 bg-white rounded-full flex items-center justify-center border-4 border-indigo-600">
                      <Sparkles className="text-indigo-600 animate-pulse" size={32} />
                    </div>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-2">Creating 3 Tests...</h3>
                  <p className="text-indigo-600 font-bold text-xs animate-pulse max-w-xs">{threeTestStep}</p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
