'use client'

import { useState, useEffect } from 'react';
import { PlusCircle, Edit3, Trash2, Send, Search, Calculator, BrainCircuit, MessageSquare, ChevronLeft, Upload, Edit2, FileText, Download, Users, Activity, Trophy, Clock, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { supabase } from '@/utils/supabase';

export default function TeacherPracticeTestsPage() {
  const [activeTab, setActiveTab] = useState('aptitude');
  const [isCreating, setIsCreating] = useState(false);
  const [createStep, setCreateStep] = useState(1);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [dbTests, setDbTests] = useState<any[]>([]);
  const [loadingDb, setLoadingDb] = useState(true);

  const fetchDbTests = async () => {
    try {
      setLoadingDb(true);
      const { data, error } = await supabase
        .from('tests')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setDbTests(data);
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

  const tests = [
    { id: 1, title: 'Time & Distance - Basics', category: 'aptitude', questions: 15, level: 'Easy', attempted: 145, avgScore: '82%', highestScore: '100%', passRate: '88%', avgTime: '12m 30s' },
    { id: 2, title: 'Profit & Loss - Advanced', category: 'aptitude', questions: 20, level: 'Hard', attempted: 98, avgScore: '65%', highestScore: '92%', passRate: '54%', avgTime: '24m 15s' },
    { id: 3, title: 'Blood Relations', category: 'reasoning', questions: 10, level: 'Medium', attempted: 210, avgScore: '76%', highestScore: '100%', passRate: '79%', avgTime: '8m 45s' },
    { id: 4, title: 'Syllogisms Mastery', category: 'reasoning', questions: 25, level: 'Hard', attempted: 112, avgScore: '68%', highestScore: '96%', passRate: '61%', avgTime: '28m 10s' },
    { id: 5, title: 'Reading Comprehension 1', category: 'verbal', questions: 15, level: 'Medium', attempted: 175, avgScore: '74%', highestScore: '98%', passRate: '72%', avgTime: '16m 20s' },
  ];

  // Convert real Supabase tests into practice cards
  const formattedDbTests = dbTests
    .filter(t => {
      const desc = t.description || '';
      if (desc.includes('[TYPE:live]') || desc.includes('[TYPE:mock]')) return false;
      return (t.category || '').toLowerCase() === activeTab;
    })
    .map(t => ({
      id: t.id,
      title: t.title,
      category: (t.category || '').toLowerCase(),
      questions: t.total_questions || 0,
      level: t.difficulty ? t.difficulty.charAt(0) + t.difficulty.slice(1).toLowerCase() : 'Medium',
      attempted: 0,
      avgScore: '--',
      highestScore: '--',
      passRate: '--',
      avgTime: `${t.duration_minutes || 20}m`,
      status: t.is_active ? 'published' : 'draft',
      isDb: true
    }));

  const demoTests = tests.filter(t => t.category === activeTab);
  const filteredTests = [...formattedDbTests, ...demoTests];

  const handleDelete = async (test: any) => {
    if (test.isDb) {
      if (confirm(`Are you sure you want to delete "${test.title}"?`)) {
        await supabase.from('questions').delete().eq('test_id', test.id);
        const { error } = await supabase.from('tests').delete().eq('id', test.id);
        if (error) {
          alert('Failed to delete test: ' + error.message);
        } else {
          fetchDbTests();
        }
      }
    } else {
      alert('Demo test cannot be deleted from database.');
    }
  };

  const topics: Record<string, string[]> = {
    aptitude: ['Time & Distance', 'Percentages', 'Profit & Loss', 'Simple & Compound Interest'],
    reasoning: ['Blood Relations', 'Syllogisms', 'Coding Decoding', 'Seating Arrangement'],
    verbal: ['Reading Comprehension', 'Synonyms & Antonyms', 'Error Spotting']
  };

  const handleStartCreate = () => {
    setIsCreating(true);
    setCreateStep(1);
    setSelectedCourse('');
    setSelectedTopic('');
  };

  const handleCancelCreate = () => {
    setIsCreating(false);
  };

  const tabs = [
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
              <h1 className="text-3xl font-bold text-slate-900">Manage Practice Tests</h1>
              <p className="text-slate-600 mt-1">Create and assign topic-by-topic practice modules with detailed analytics.</p>
            </div>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartCreate} 
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-md hover:shadow-indigo-500/20"
            >
              <PlusCircle size={20} />
              Create New Test
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
                      layoutId="practice-active-tab"
                      className="absolute inset-0 bg-indigo-50 rounded-xl -z-10"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <tab.icon size={18} className={isActive ? 'text-indigo-600' : ''} /> {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tests Grid */}
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredTests.map((test) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  key={test.id} 
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-indigo-300 transition-colors overflow-hidden group flex flex-col h-full cursor-pointer"
                >
                  <div className="p-6 flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${test.level === 'Easy' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : test.level === 'Medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                          {test.level}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg flex items-center gap-1 border border-slate-200">
                           {test.passRate} Pass
                        </span>
                      </div>
                      <span className="text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
                        {test.questions} Qs
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-4">{test.title}</h3>
                    
                    {/* Analytics Grid */}
                    <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1"><Users size={12}/> Attempted</span>
                        <span className="font-bold text-slate-700">{test.attempted}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1"><Activity size={12}/> Avg Score</span>
                        <span className="font-bold text-indigo-600">{test.avgScore}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1"><Clock size={12}/> Avg Time</span>
                        <span className="font-bold text-slate-700">{test.avgTime}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1"><Trophy size={12}/> Highest</span>
                        <span className="font-bold text-emerald-600">{test.highestScore}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-slate-100 p-3 flex items-center justify-between bg-slate-50/50">
                    <motion.button onClick={() => {
                      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://testwise.com';
                      navigator.clipboard.writeText(`${origin}/student/take-test/${test.id}`);
                      alert('Practice Test link copied to clipboard!');
                    }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center justify-center gap-2 flex-1 py-2 text-sm font-bold text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors">
                      <Send size={16} /> Assign
                    </motion.button>
                    <div className="w-px h-6 bg-slate-200 mx-1"></div>
                    <motion.button onClick={() => alert('Report downloaded!')} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} title="Download Report" className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"><Download size={18} /></motion.button>
                    <Link href={`/teacher/dashboard/tests/create?type=practice&category=${test.category}`} title="Edit" className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Edit3 size={18} /></Link>
                    <motion.button onClick={() => handleDelete(test)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} title="Delete" className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={18} /></motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
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
            <div className="flex items-center justify-between mb-12 relative">
              <div className="absolute left-0 right-0 top-1/2 h-1 bg-slate-100 -z-10"></div>
              {[1, 2, 3].map((step) => (
                <div key={step} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${createStep >= step ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'bg-slate-200 text-slate-500'}`}>
                  {step}
                </div>
              ))}
            </div>

            {/* STEP 1: Select Course */}
            {createStep === 1 && (
              <div className="animate-in fade-in duration-300">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Step 1: Select a Course</h2>
                <div className="flex sm:grid sm:grid-cols-3 gap-4 sm:gap-6 overflow-x-auto snap-x hide-scrollbar pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible sm:pb-0">
                  {[
                    { id: 'aptitude', name: 'Aptitude', icon: <Calculator size={32} />, color: 'orange' },
                    { id: 'reasoning', name: 'Reasoning', icon: <BrainCircuit size={32} />, color: 'violet' },
                    { id: 'verbal', name: 'Verbal', icon: <MessageSquare size={32} />, color: 'teal' }
                  ].map((course) => (
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      key={course.id}
                      onClick={() => { setSelectedCourse(course.id); setCreateStep(2); }}
                      className="min-w-[160px] sm:min-w-0 snap-start flex flex-col items-center justify-center p-6 sm:p-8 bg-slate-50 border-2 border-slate-200 rounded-2xl hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-700 hover:shadow-lg hover:shadow-indigo-500/20 transition-all group"
                    >
                      <div className="mb-4 text-slate-400 group-hover:text-indigo-500 transition-colors group-hover:scale-110 duration-300">
                        {course.icon}
                      </div>
                      <span className="font-bold text-lg text-slate-700 group-hover:text-indigo-700">{course.name}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2: Select Topic */}
            {createStep === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center">Step 2: Select a Topic</h2>
                <p className="text-slate-500 text-center mb-8">Course: <span className="font-bold text-indigo-600 capitalize">{selectedCourse}</span></p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {topics[selectedCourse]?.map((topic, idx) => (
                    <motion.button 
                      whileHover={{ scale: 1.03, x: 5 }}
                      whileTap={{ scale: 0.97 }}
                      key={idx}
                      onClick={() => { setSelectedTopic(topic); setCreateStep(3); }}
                      className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-left hover:border-indigo-500 hover:bg-white hover:shadow-md transition-all group"
                    >
                      <span className="font-bold text-lg text-slate-700 group-hover:text-indigo-700">{topic}</span>
                    </motion.button>
                  ))}
                </div>
                <div className="mt-8 text-center">
                  <button onClick={() => setCreateStep(1)} className="text-slate-500 font-bold hover:text-slate-900">Back</button>
                </div>
              </div>
            )}

            {/* STEP 3: Select Method */}
            {createStep === 3 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300 text-center">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Step 3: How do you want to add questions?</h2>
                <p className="text-slate-500 mb-8">Creating test for <span className="font-bold text-indigo-600">{selectedTopic}</span></p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Link href={`/teacher/dashboard/tests/create?mode=manual&type=practice&category=${selectedCourse}&topic=${encodeURIComponent(selectedTopic)}`}
                    className="flex flex-col items-center justify-center p-10 bg-white border-2 border-slate-200 rounded-3xl hover:border-indigo-500 hover:shadow-xl transition-all group"
                  >
                      <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Edit2 size={32} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">Manual Entry</h3>
                      <p className="text-slate-500 text-sm">Type questions and options one by one.</p>
                  </Link>

                  <Link href={`/teacher/dashboard/tests/create?mode=bulk&type=practice&category=${selectedCourse}&topic=${encodeURIComponent(selectedTopic)}`}
                    className="flex flex-col items-center justify-center p-10 bg-white border-2 border-slate-200 rounded-3xl hover:border-emerald-500 hover:shadow-xl transition-all group"
                  >
                    <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Upload size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Bulk Upload</h3>
                    <p className="text-slate-500 text-sm">Upload questions via PDF, Links, or Excel.</p>
                  </Link>
                </div>
                
                <div className="mt-8">
                  <button onClick={() => setCreateStep(2)} className="text-slate-500 font-bold hover:text-slate-900">Back to Topics</button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
