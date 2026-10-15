'use client'

import { useState, useEffect } from 'react';
import { PlusCircle, Edit3, Trash2, Send, Search, Calculator, BrainCircuit, MessageSquare, ChevronLeft, Upload, Edit2, Trophy, Clock, PlayCircle, Users, Activity, Download, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { supabase } from '@/utils/supabase';

export default function TeacherMockTestsPage() {
  const [activeTab, setActiveTab] = useState('aptitude');
  const [isCreating, setIsCreating] = useState(false);
  const [createStep, setCreateStep] = useState(1);
  const [selectedCourse, setSelectedCourse] = useState('');
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
    { id: 1, title: 'Full Aptitude Mastery Mock', category: 'aptitude', questions: 50, mins: 60, status: 'published', attempted: 280, avgScore: '68%', highestScore: '96%', passRate: '60%', avgSubmissionTime: '52m 10s' },
    { id: 2, title: 'Aptitude Speed Test 1', category: 'aptitude', questions: 30, mins: 20, status: 'draft', attempted: 0, avgScore: '--', highestScore: '--', passRate: '--', avgSubmissionTime: '--' },
    { id: 3, title: 'Logical Reasoning Grand Test', category: 'reasoning', questions: 40, mins: 45, status: 'published', attempted: 155, avgScore: '74%', highestScore: '100%', passRate: '75%', avgSubmissionTime: '41m 20s' },
    { id: 4, title: 'Verbal Ability Comprehensive', category: 'verbal', questions: 50, mins: 45, status: 'published', attempted: 190, avgScore: '71%', highestScore: '94%', passRate: '68%', avgSubmissionTime: '38m 45s' },
    { id: 5, title: 'Verbal Quick Grammar Mock', category: 'verbal', questions: 25, mins: 15, status: 'draft', attempted: 0, avgScore: '--', highestScore: '--', passRate: '--', avgSubmissionTime: '--' },
  ];

  // Convert real Supabase tests into mock cards
  const formattedDbTests = dbTests
    .filter(t => {
      const desc = t.description || '';
      if (desc.includes('[TYPE:practice]') || desc.includes('[TYPE:live]')) return false;
      return (t.category || '').toLowerCase() === activeTab;
    })
    .map(t => ({
      id: t.id,
      title: t.title,
      category: (t.category || '').toLowerCase(),
      questions: t.total_questions || 0,
      mins: t.duration_minutes || 30,
      status: t.is_active ? 'published' : 'draft',
      attempted: 0,
      avgScore: '--',
      highestScore: '--',
      passRate: '--',
      avgSubmissionTime: '--',
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
      alert('Demo tests cannot be deleted from database.');
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
                        <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-100">Draft</span>
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
                      <Link href={`/teacher/dashboard/tests/create?type=mock&category=${test.category}`} title="Edit" className="flex-1 flex justify-center items-center py-2.5 px-4 bg-slate-50 text-slate-600 hover:bg-slate-800 hover:text-white rounded-xl transition-colors shadow-sm">
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

            {/* STEP 2: Select Method */}
            {createStep === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300 text-center">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Step 2: Add Questions</h2>
                <p className="text-slate-500 mb-8">Creating a full-length <span className="font-bold text-indigo-600 capitalize">{selectedCourse}</span> Mock Test</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Link href={`/teacher/dashboard/tests/create?mode=manual&type=mock&category=${selectedCourse}`} className="flex flex-col items-center justify-center p-10 bg-white border-2 border-slate-200 rounded-3xl hover:border-indigo-500 hover:shadow-xl transition-all group">
                    <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Edit2 size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Manual Entry</h3>
                    <p className="text-slate-500 text-sm">Type questions and options one by one.</p>
                  </Link>

                  <Link href={`/teacher/dashboard/tests/create?mode=bulk&type=mock&category=${selectedCourse}`} className="flex flex-col items-center justify-center p-10 bg-white border-2 border-slate-200 rounded-3xl hover:border-emerald-500 hover:shadow-xl transition-all group">
                    <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Upload size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Bulk Upload</h3>
                    <p className="text-slate-500 text-sm">Upload questions via PDF, Links, or Excel.</p>
                  </Link>
                </div>
                
                <div className="mt-8">
                  <button onClick={() => setCreateStep(1)} className="text-slate-500 font-bold hover:text-slate-900">Back</button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
