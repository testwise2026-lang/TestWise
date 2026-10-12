'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  BrainCircuit, TrendingUp, Target, Clock, 
  BookOpen, ChevronRight, Zap, ArrowUpRight, ArrowDownRight,
  Activity, BarChart3, Crosshair, ShieldAlert, Award, AlertTriangle, History, Sparkles
} from 'lucide-react';
import { supabase } from '@/utils/supabase';

export default function StudentAnalytics() {
  const [activeSubject, setActiveSubject] = useState('All');
  const [testType, setTestType] = useState('All'); // 'All', 'Mock', 'Live'
  const [testHistory, setTestHistory] = useState<any[]>([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [aiReport, setAiReport] = useState('');

  useEffect(() => {
    async function fetchHistory() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('test_attempts')
        .select('*, tests(title, category)')
        .eq('student_id', user.id)
        .order('completed_at', { ascending: false });
        
      if (data) {
        // Only include Mock and Live tests for AI Analytics
        const filtered = data.filter(run => {
          const title = (run.tests?.title || '').toLowerCase();
          return title.includes('mock') || title.includes('live');
        });
        setTestHistory(filtered);
      }
    }
    fetchHistory();
  }, []);

  const weaknesses = [
    {
      topic: 'Time & Distance',
      subject: 'Aptitude',
      accuracy: '42%',
      avgTime: '1m 20s',
      status: 'Critical',
      insight: 'You are taking 40% more time than average on these problems.',
      eNote: 'Speed & Distance Shortcuts',
    },
    {
      topic: 'Data Interpretation',
      subject: 'Reasoning',
      accuracy: '55%',
      avgTime: '2m 10s',
      status: 'Needs Work',
      insight: 'Accuracy is dropping on pie chart related questions.',
      eNote: 'Mastering Pie Charts',
    },
    {
      topic: 'Synonyms & Antonyms',
      subject: 'Verbal',
      accuracy: '60%',
      avgTime: '30s',
      status: 'Needs Work',
      insight: 'Speed is good, but vocabulary needs expansion.',
      eNote: 'Top 500 Frequent Words',
    }
  ];

  const strengths = [
    { topic: 'Profit & Loss', accuracy: '92%', speed: 'Top 5%' },
    { topic: 'Blood Relations', accuracy: '88%', speed: 'Top 10%' },
    { topic: 'Reading Comprehension', accuracy: '85%', speed: 'Top 15%' },
  ];

  const timeManagement = {
    correct: '45s',
    incorrect: '1m 15s',
    skipped: '15s',
    suggestion: 'You are spending too much time on questions you eventually get wrong. Learn to skip earlier.'
  };

  const containerVariants: any = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: any = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  const displayHistory = testHistory.filter(run => {
    if (testType === 'All') return true;
    const title = (run.tests?.title || '').toLowerCase();
    if (testType === 'Mock') return title.includes('mock');
    if (testType === 'Live') return title.includes('live');
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">AI Analytics Engine</h1>
          <p className="text-slate-500 font-medium mt-1">Deep insights into your performance and weakness areas.</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={testType}
            onChange={(e) => setTestType(e.target.value)}
            className="px-4 py-2 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-xl font-bold cursor-pointer outline-none focus:ring-2 ring-indigo-200 shadow-sm"
          >
            <option value="All">Total (Mock + Live)</option>
            <option value="Mock">Mock Tests Only</option>
            <option value="Live">Live Tests Only</option>
          </select>
          <div className="hidden sm:flex bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl font-bold items-center gap-2 border border-emerald-100 shadow-sm">
            <Activity size={18} /> Live
          </div>
        </div>
      </div>

      {/* AI Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl relative"
          >
            <button onClick={() => setShowReportModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-900">
              ✖
            </button>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4 flex items-center gap-2">
              <Sparkles className="text-indigo-600" /> AI Performance Report
            </h2>
            <div className="prose prose-slate max-w-none whitespace-pre-wrap">
              {aiReport}
            </div>
          </motion.div>
        </div>
      )}

      {/* AI Master Insight Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md shrink-0">
            <BrainCircuit size={40} className="text-white drop-shadow-md" />
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-200 mb-2 flex items-center gap-2">
              <Zap size={16} className="text-yellow-400" /> AI Weekly Summary
            </h2>
            <p className="text-xl sm:text-2xl font-semibold leading-relaxed drop-shadow-sm">
              "Your overall accuracy improved by <span className="text-emerald-300 font-extrabold flex items-center inline-flex"><ArrowUpRight size={24} />5%</span> this week! However, you are losing significant marks in <span className="font-extrabold text-rose-200 underline decoration-rose-400 decoration-2 underline-offset-4">Time & Distance</span>. I highly recommend focusing your practice there."
            </p>
          </div>
          <button 
            onClick={async () => {
              try {
                const btn = document.getElementById('ai-report-btn');
                if (btn) btn.innerText = 'Generating...';
                const res = await fetch('/api/predict-performance', {
                  method: 'POST',
                  body: JSON.stringify({ testHistory })
                });
                const data = await res.json();
                if (data.report) {
                  setAiReport(data.report);
                  setShowReportModal(true);
                }
              } catch (e) {
                console.error(e);
              } finally {
                const btn = document.getElementById('ai-report-btn');
                if (btn) btn.innerText = 'Generate Full Report';
              }
            }}
            id="ai-report-btn"
            className="shrink-0 bg-white text-indigo-700 hover:bg-indigo-50 font-extrabold px-6 py-3 rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95"
          >
            Generate Full Report
          </button>
        </div>
      </motion.div>

      {/* Recent Test Results from DB */}
      {testHistory.length > 0 && (
        <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-extrabold text-xl text-slate-900 flex items-center gap-2">
              <History className="text-indigo-500" /> Recent Test Attempts
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-sm font-bold text-slate-500 uppercase">
                  <th className="pb-4 pl-4">Test Name</th>
                  <th className="pb-4">Score</th>
                  <th className="pb-4">Correct</th>
                  <th className="pb-4">AI Warnings</th>
                  <th className="pb-4">Date</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {displayHistory.map((run, i) => (
                  <tr key={run.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-4 pl-4 font-bold text-slate-800">{run.tests?.title || 'Unknown Test'}</td>
                    <td className="py-4 font-black text-indigo-600">{run.score}</td>
                    <td className="py-4 text-emerald-600 font-bold">{run.score} Correct</td>
                    <td className="py-4">
                      {run.warnings_issued > 0 ? (
                        <span className="bg-rose-100 text-rose-700 px-2 py-1 rounded font-bold text-xs">{run.warnings_issued} Warnings</span>
                      ) : (
                        <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded font-bold text-xs">Clean</span>
                      )}
                    </td>
                    <td className="py-4 text-slate-500 font-medium">{run.completed_at ? new Date(run.completed_at).toLocaleDateString() : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* Left Column: Weaknesses & Remediation (Takes 2 Columns) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Action Plan Section */}
          <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <ShieldAlert size={120} />
            </div>
            
            <div className="flex items-center justify-between mb-8 relative z-10">
              <h3 className="font-extrabold text-2xl text-slate-900 flex items-center gap-3">
                <Target className="text-rose-500" /> Targeted Remediation Plan
              </h3>
            </div>

            <div className="space-y-5 relative z-10">
              {weaknesses.map((weakness, idx) => (
                <div key={idx} className="group border border-slate-100 hover:border-rose-200 bg-slate-50 hover:bg-rose-50/30 rounded-2xl p-5 transition-all duration-300 shadow-sm hover:shadow-md">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1 ${
                          weakness.status === 'Critical' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {weakness.status === 'Critical' ? <ShieldAlert size={12} /> : <AlertTriangle size={12} />} 
                          {weakness.status}
                        </span>
                        <span className="text-xs font-bold text-slate-500">{weakness.subject}</span>
                      </div>
                      <h4 className="font-extrabold text-lg text-slate-900 group-hover:text-rose-700 transition-colors">{weakness.topic}</h4>
                      <p className="text-sm text-slate-600 mt-2 font-medium flex items-center gap-1.5">
                        <BrainCircuit size={16} className="text-indigo-400" /> {weakness.insight}
                      </p>
                    </div>

                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 shrink-0">
                      <div className="flex gap-4 sm:gap-6 text-center">
                        <div>
                          <p className="text-[10px] font-bold uppercase text-slate-400">Accuracy</p>
                          <p className="font-extrabold text-slate-800 text-lg flex items-center gap-1 justify-center">
                            <ArrowDownRight size={16} className="text-rose-500" /> {weakness.accuracy}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase text-slate-400">Avg Time</p>
                          <p className="font-extrabold text-slate-800 text-lg flex items-center gap-1 justify-center">
                            <Clock size={16} className="text-amber-500" /> {weakness.avgTime}
                          </p>
                        </div>
                      </div>
                      
                      <Link href="/student/dashboard/enotes" className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md shadow-indigo-500/20 transition-all hover:scale-105">
                        <BookOpen size={16} /> Read eNote
                      </Link>
                    </div>
                    
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Time Management Analysis */}
          <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1 space-y-4">
              <h3 className="font-extrabold text-xl text-slate-900 flex items-center gap-2">
                <Clock className="text-blue-500" /> Time Management
              </h3>
              <p className="text-slate-600 font-medium">
                {timeManagement.suggestion}
              </p>
              <div className="flex gap-6 pt-4">
                <div>
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Correct Ans</p>
                  <p className="text-2xl font-extrabold text-slate-900">{timeManagement.correct}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-rose-600 uppercase tracking-wider">Incorrect Ans</p>
                  <p className="text-2xl font-extrabold text-slate-900">{timeManagement.incorrect}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Skipped</p>
                  <p className="text-2xl font-extrabold text-slate-900">{timeManagement.skipped}</p>
                </div>
              </div>
            </div>
            
            {/* Visual Donut Chart Representation */}
            <div className="w-48 h-48 relative shrink-0">
              {/* This is a simple CSS visual representation of a chart */}
              <div className="absolute inset-0 rounded-full border-[16px] border-emerald-100" style={{ clipPath: 'polygon(50% 50%, 50% 0, 100% 0, 100% 100%, 0 100%, 0 0)' }}></div>
              <div className="absolute inset-0 rounded-full border-[16px] border-rose-200" style={{ clipPath: 'polygon(50% 50%, 0 0, 0 50%)' }}></div>
              <div className="absolute inset-0 rounded-full border-[16px] border-slate-200" style={{ clipPath: 'polygon(50% 50%, 0 50%, 50% 0)' }}></div>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white m-[16px] rounded-full shadow-inner">
                <span className="text-sm font-bold text-slate-400 uppercase">Avg Time</span>
                <span className="text-2xl font-extrabold text-slate-900">45s</span>
              </div>
            </div>
          </motion.div>

        </div>

        {/* Right Column: Strengths & Leaderboard (Takes 1 Column) */}
        <div className="space-y-8">
          
          {/* Top Strengths */}
          <motion.div variants={itemVariants} className="bg-gradient-to-b from-white to-emerald-50/50 rounded-3xl p-6 border border-emerald-100 shadow-sm">
            <h3 className="font-extrabold text-xl text-slate-900 flex items-center gap-2 mb-6">
              <TrendingUp className="text-emerald-500" /> Your Strengths
            </h3>
            
            <div className="space-y-4">
              {strengths.map((strength, idx) => (
                <div key={idx} className="bg-white border border-emerald-100/50 rounded-2xl p-4 shadow-sm flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-800">{strength.topic}</h4>
                    <p className="text-xs font-bold text-emerald-600 mt-1">{strength.speed} in Speed</p>
                  </div>
                  <div className="bg-emerald-100 text-emerald-700 w-12 h-12 rounded-full flex items-center justify-center font-extrabold">
                    {strength.accuracy.replace('%', '')}
                  </div>
                </div>
              ))}
            </div>
            
            <Link href="/student/dashboard/tests/practice" className="block w-full mt-6 py-3 text-sm text-center font-bold text-emerald-700 bg-emerald-100/50 hover:bg-emerald-100 rounded-xl transition-colors">
              Take Practice Tests to Build Strengths
            </Link>
          </motion.div>

          {/* Gamification / Ranking Status */}
          <motion.div variants={itemVariants} className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <Award size={100} />
            </div>
            
            <h3 className="font-extrabold text-xl flex items-center gap-2 text-amber-400 mb-2">
              <Crosshair /> Campus Leaderboard
            </h3>
            
            <div className="mt-6 mb-4">
              <span className="text-6xl font-black drop-shadow-md">92<span className="text-2xl text-slate-400 ml-1">nd</span></span>
              <p className="text-slate-300 font-medium mt-2">Out of 1,240 students</p>
            </div>
            
            <div className="w-full bg-slate-800 rounded-full h-2.5 mt-6 mb-3">
              <div className="bg-gradient-to-r from-amber-400 to-orange-500 h-2.5 rounded-full" style={{ width: '85%' }}></div>
            </div>
            <p className="text-xs font-bold text-slate-400 tracking-wider uppercase flex justify-between">
              <span>Top 10%</span>
              <span className="text-amber-400">Just 15 points away!</span>
            </p>

          </motion.div>

        </div>
      </motion.div>
    </div>
  );
}
