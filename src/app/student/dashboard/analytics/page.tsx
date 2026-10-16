'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  BrainCircuit, TrendingUp, Target, Clock, 
  BookOpen, ChevronRight, Zap, ArrowUpRight, ArrowDownRight,
  Activity, BarChart3, Crosshair, ShieldAlert, Award, AlertTriangle, 
  History, Sparkles, CheckCircle2, XCircle, PlayCircle, RefreshCw
} from 'lucide-react';
import { supabase } from '@/utils/supabase';

interface SubjectSkill {
  name: 'Aptitude' | 'Reasoning' | 'Verbal' | 'Technical';
  attempts: number;
  correct: number;
  totalQuestions: number;
  accuracy: number;
  fails: number;
  status: 'Mastered' | 'Proficient' | 'Average' | 'Critical';
}

export default function StudentAnalytics() {
  const [testType, setTestType] = useState('All'); // 'All', 'Practice', 'Mock', 'Live'
  const [testHistory, setTestHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);
  const [aiReport, setAiReport] = useState('');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('test_attempts')
        .select('*, tests(id, title, category, total_questions, duration_minutes, description)')
        .eq('student_id', user.id)
        .order('completed_at', { ascending: false });
        
      if (data) {
        setTestHistory(data);
      }
    } catch (e) {
      console.error('Error fetching test attempts:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Compute Real Subject Breakdown from actual test attempts
  const subjectSkills = useMemo(() => {
    const categories: Record<'Aptitude' | 'Reasoning' | 'Verbal' | 'Technical', { attempts: number; correct: number; totalQ: number; fails: number }> = {
      Aptitude: { attempts: 0, correct: 0, totalQ: 0, fails: 0 },
      Reasoning: { attempts: 0, correct: 0, totalQ: 0, fails: 0 },
      Verbal: { attempts: 0, correct: 0, totalQ: 0, fails: 0 },
      Technical: { attempts: 0, correct: 0, totalQ: 0, fails: 0 },
    };

    testHistory.forEach((run) => {
      const rawCat = (run.tests?.category || '').toLowerCase();
      let catKey: 'Aptitude' | 'Reasoning' | 'Verbal' | 'Technical' = 'Aptitude';
      if (rawCat.includes('reason')) catKey = 'Reasoning';
      else if (rawCat.includes('verb') || rawCat.includes('eng')) catKey = 'Verbal';
      else if (rawCat.includes('tech') || rawCat.includes('core')) catKey = 'Technical';

      const maxQ = run.tests?.total_questions || (run.score > 10 ? run.score : 20);
      const score = run.score || 0;
      const isFail = (score / maxQ) < 0.5;

      categories[catKey].attempts += 1;
      categories[catKey].correct += score;
      categories[catKey].totalQ += maxQ;
      if (isFail) categories[catKey].fails += 1;
    });

    return (Object.keys(categories) as Array<'Aptitude' | 'Reasoning' | 'Verbal' | 'Technical'>).map((cat) => {
      const stat = categories[cat];
      const accuracy = stat.totalQ > 0 ? Math.round((stat.correct / stat.totalQ) * 100) : 0;
      
      let status: 'Mastered' | 'Proficient' | 'Average' | 'Critical' = 'Average';
      if (stat.attempts === 0) status = 'Average';
      else if (accuracy >= 80 && stat.fails === 0) status = 'Mastered';
      else if (accuracy >= 65) status = 'Proficient';
      else if (accuracy < 50 || stat.fails > 0) status = 'Critical';

      return {
        name: cat,
        attempts: stat.attempts,
        correct: stat.correct,
        totalQuestions: stat.totalQ,
        accuracy,
        fails: stat.fails,
        status
      };
    });
  }, [testHistory]);

  // Overall Real Metrics
  const summaryMetrics = useMemo(() => {
    const total = testHistory.length;
    if (total === 0) {
      return { total: 0, passed: 0, failed: 0, avgScore: 0, readinessScore: 0, warnings: 0 };
    }

    let earned = 0;
    let maxTotal = 0;
    let fails = 0;
    let warnings = 0;

    testHistory.forEach((run) => {
      const maxQ = run.tests?.total_questions || 20;
      const score = run.score || 0;
      earned += score;
      maxTotal += maxQ;
      if ((score / maxQ) < 0.5) fails += 1;
      warnings += run.warnings_issued || 0;
    });

    const avgScore = maxTotal > 0 ? Math.round((earned / maxTotal) * 100) : 0;
    const passed = total - fails;
    
    // Readiness: Base on average score, penalize for fails and cheat warnings
    const readinessScore = Math.max(0, Math.min(100, Math.round(avgScore * 0.9 - (fails * 5) - (warnings * 2))));

    return {
      total,
      passed,
      failed: fails,
      avgScore,
      readinessScore,
      warnings
    };
  }, [testHistory]);

  // Weakest Subject & Strongest Subject
  const weakestSubject = useMemo(() => {
    const attemptedSubs = subjectSkills.filter(s => s.attempts > 0);
    if (attemptedSubs.length === 0) return null;
    return [...attemptedSubs].sort((a, b) => a.accuracy - b.accuracy)[0];
  }, [subjectSkills]);

  const strongestSubject = useMemo(() => {
    const attemptedSubs = subjectSkills.filter(s => s.attempts > 0);
    if (attemptedSubs.length === 0) return null;
    return [...attemptedSubs].sort((a, b) => b.accuracy - a.accuracy)[0];
  }, [subjectSkills]);

  // Filtered History
  const displayHistory = useMemo(() => {
    return testHistory.filter(run => {
      if (testType === 'All') return true;
      const desc = run.tests?.description || '';
      const title = (run.tests?.title || '').toLowerCase();
      if (testType === 'Mock') return desc.includes('[TYPE:mock]') || title.includes('mock');
      if (testType === 'Live') return desc.includes('[TYPE:live]') || title.includes('live');
      if (testType === 'Practice') return (!desc.includes('[TYPE:mock]') && !desc.includes('[TYPE:live]'));
      return true;
    });
  }, [testHistory, testType]);

  const handleGenerateAIReport = async () => {
    try {
      setIsGeneratingReport(true);
      const res = await fetch('/api/predict-performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          testHistory,
          subjectSkills,
          summaryMetrics
        })
      });
      const data = await res.json();
      if (data.report) {
        setAiReport(data.report);
        setShowReportModal(true);
      } else {
        setAiReport(`### Placement & Skill Readiness Report\n\n- **Overall Average**: ${summaryMetrics.avgScore}%\n- **Tests Completed**: ${summaryMetrics.total} Tests\n- **Tests Passed**: ${summaryMetrics.passed} Passed, ${summaryMetrics.failed} Failed\n- **Key Weakness**: ${weakestSubject ? `${weakestSubject.name} (${weakestSubject.accuracy}%)` : 'None detected'}\n\n**Recommendation**: Dedicate 30 minutes daily to practice tests in your lower accuracy subjects.`);
        setShowReportModal(true);
      }
    } catch (e) {
      console.error('Error generating report:', e);
      setAiReport(`### Placement & Skill Readiness Report\n\n- **Overall Average**: ${summaryMetrics.avgScore}%\n- **Tests Completed**: ${summaryMetrics.total} Tests\n- **Tests Passed**: ${summaryMetrics.passed} Passed, ${summaryMetrics.failed} Failed\n- **Key Weakness**: ${weakestSubject ? `${weakestSubject.name} (${weakestSubject.accuracy}%)` : 'None detected'}\n\n**Recommendation**: Dedicate 30 minutes daily to practice tests in your lower accuracy subjects.`);
      setShowReportModal(true);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16 animate-in fade-in duration-500">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 bg-violet-50 border border-violet-200 text-violet-700 text-xs font-bold rounded-full flex items-center gap-1.5">
              <BrainCircuit size={14} className="text-violet-600 animate-pulse" /> Personal AI Learning Diagnosis
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">AI Skill Radar & Analytics</h1>
          <p className="text-slate-500 font-medium mt-1">
            Real performance diagnosis, subject weakness tracking, and campus placement readiness.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select 
            value={testType}
            onChange={(e) => setTestType(e.target.value)}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer outline-none focus:ring-2 ring-indigo-200 shadow-xs text-sm"
          >
            <option value="All">All Types (Practice + Mock + Live)</option>
            <option value="Practice">Practice Tests Only</option>
            <option value="Mock">Mock Tests Only</option>
            <option value="Live">Live Exams Only</option>
          </select>

          <button 
            onClick={fetchHistory}
            className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-bold transition-all shadow-xs"
            title="Refresh analytics data"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin text-indigo-600' : ''} />
          </button>
        </div>
      </div>

      {/* AI Master Insight Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-violet-700 via-indigo-700 to-blue-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-white/20 p-3 rounded-2xl backdrop-blur-md shrink-0 flex items-center justify-center border border-white/25 shadow-inner">
              <BrainCircuit size={32} className="text-white" />
            </div>

            <div className="space-y-1.5 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-200">
                <Zap size={14} className="text-yellow-300" /> AI Skill Diagnosis
              </div>

              {summaryMetrics.total > 0 ? (
                <p className="text-lg sm:text-xl font-semibold leading-relaxed">
                  {weakestSubject && weakestSubject.accuracy < 60 ? (
                    <>
                      "Your overall score is <strong>{summaryMetrics.avgScore}%</strong>, but you are currently losing marks in <span className="font-extrabold text-rose-200 underline decoration-rose-300 decoration-2 underline-offset-4">{weakestSubject.name} ({weakestSubject.accuracy}%)</span>. We recommend focused practice before your next live test."
                    </>
                  ) : (
                    <>
                      "Outstanding consistency! You are scoring an average of <strong className="text-emerald-300 font-extrabold">{summaryMetrics.avgScore}%</strong> with {summaryMetrics.passed} tests passed. Keep up this momentum for campus placement drives!"
                    </>
                  )}
                </p>
              ) : (
                <p className="text-lg font-semibold leading-relaxed text-indigo-100">
                  "You haven't completed any assessments yet! Start your first test below to unlock your personalized AI Skill Radar and Placement Readiness score."
                </p>
              )}
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-3 w-full sm:w-auto">
            {summaryMetrics.total > 0 ? (
              <button 
                onClick={handleGenerateAIReport}
                disabled={isGeneratingReport}
                className="w-full sm:w-auto bg-white text-indigo-700 hover:bg-indigo-50 font-extrabold px-6 py-3 rounded-xl shadow-md transition-all text-sm flex items-center justify-center gap-2"
              >
                <Sparkles size={16} className={isGeneratingReport ? 'animate-spin' : ''} />
                {isGeneratingReport ? 'Analyzing...' : 'Generate Full AI Report'}
              </button>
            ) : (
              <Link 
                href="/student/dashboard/tests/practice"
                className="w-full sm:w-auto bg-white text-indigo-700 hover:bg-indigo-50 font-extrabold px-6 py-3 rounded-xl shadow-md transition-all text-sm flex items-center justify-center gap-2"
              >
                <PlayCircle size={16} /> Start Practice Test
              </Link>
            )}
          </div>
        </div>
      </motion.div>

      {/* 4 Real Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Assessments</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <BookOpen size={16} />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{summaryMetrics.total}</span>
          <span className="text-xs text-slate-500 block mt-1 font-medium">
            {summaryMetrics.passed} Passed • {summaryMetrics.failed} Failed
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Average Score</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Target size={16} />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600">{summaryMetrics.avgScore}%</span>
          <span className="text-xs text-emerald-600 block mt-1 font-medium">
            Across all completed tests
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Placement Readiness</span>
            <div className="p-2 bg-violet-50 text-violet-600 rounded-xl">
              <Crosshair size={16} />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-violet-700">{summaryMetrics.readinessScore}/100</span>
          <span className="text-xs text-violet-600 block mt-1 font-bold">
            {summaryMetrics.readinessScore >= 75 ? '🎯 Tier-1 Placement Ready' : summaryMetrics.readinessScore >= 50 ? '⚖️ Average Preparedness' : '⚠️ Practice Required'}
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Proctoring Status</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <ShieldAlert size={16} />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{summaryMetrics.warnings}</span>
          <span className="text-xs text-slate-500 block mt-1 font-medium">
            {summaryMetrics.warnings === 0 ? 'Verified Clean & Honest 🎉' : 'AI Cheat Warnings'}
          </span>
        </div>
      </div>

      {/* 4 Subject-wise Skill Radar Breakdown */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <BarChart3 size={20} className="text-indigo-600" /> Subject-wise Performance Radar
          </h2>
          <span className="text-xs text-slate-500 font-medium">Real accuracy calculated from your completed tests</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {subjectSkills.map((sub) => (
            <div 
              key={sub.name}
              className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-extrabold text-slate-900 text-base">{sub.name}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    sub.status === 'Mastered' ? 'bg-emerald-100 text-emerald-800' :
                    sub.status === 'Proficient' ? 'bg-indigo-100 text-indigo-800' :
                    sub.status === 'Average' ? 'bg-amber-100 text-amber-800' :
                    'bg-rose-100 text-rose-800'
                  }`}>
                    {sub.status === 'Critical' ? '🚨 Weak Area' : sub.status}
                  </span>
                </div>

                <div className="flex items-baseline justify-between">
                  <span className={`text-3xl font-extrabold ${
                    sub.accuracy >= 75 ? 'text-emerald-600' :
                    sub.accuracy >= 50 ? 'text-indigo-600' :
                    'text-rose-600'
                  }`}>
                    {sub.attempts > 0 ? `${sub.accuracy}%` : 'N/A'}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {sub.attempts} Test{sub.attempts !== 1 ? 's' : ''} Taken
                  </span>
                </div>

                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-3">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      sub.accuracy >= 75 ? 'bg-emerald-500' :
                      sub.accuracy >= 50 ? 'bg-indigo-500' :
                      'bg-rose-500'
                    }`}
                    style={{ width: `${sub.attempts > 0 ? sub.accuracy : 0}%` }}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  {sub.fails > 0 ? (
                    <span className="text-rose-600 font-bold">{sub.fails} Failed</span>
                  ) : (
                    <span>0 Failures</span>
                  )}
                </span>

                <Link
                  href={`/student/dashboard/tests/practice?category=${sub.name.toLowerCase()}`}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  Practice <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weakest Subject Immediate Remediation Box */}
      {weakestSubject && (
        <div className="bg-gradient-to-r from-rose-50 via-white to-rose-50 border border-rose-200 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center font-extrabold text-xl shrink-0 shadow-md shadow-rose-200">
              <AlertTriangle size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-extrabold uppercase tracking-wider text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                  Targeted Weakness Remediation
                </span>
                <span className="text-xs font-bold text-slate-500">
                  Current Accuracy: <strong className="text-rose-700">{weakestSubject.accuracy}%</strong>
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">
                Focus on improving {weakestSubject.name}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
                Our AI model detected that {weakestSubject.name} is currently your lowest-scoring area. Practicing targeted questions will increase your overall batch percentile.
              </p>
            </div>
          </div>

          <Link
            href={`/student/dashboard/tests/practice?category=${weakestSubject.name.toLowerCase()}`}
            className="w-full sm:w-auto px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md shadow-rose-200 text-sm flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5 shrink-0"
          >
            <PlayCircle size={18} /> Practice {weakestSubject.name} Now
          </Link>
        </div>
      )}

      {/* Real Test Attempt History from Database */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <History size={20} className="text-indigo-600" /> Recent Assessment Submissions
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Live database records of your completed tests, scores, and proctoring warnings.
            </p>
          </div>
          
          <span className="text-xs font-bold text-slate-500">
            {displayHistory.length} Test{displayHistory.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="overflow-x-auto">
          {displayHistory.length > 0 ? (
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                  <th className="py-4 pl-6">Assessment Title</th>
                  <th className="py-4 px-4">Subject</th>
                  <th className="py-4 px-4 text-center">Score</th>
                  <th className="py-4 px-4 text-center">Result</th>
                  <th className="py-4 px-4 text-center">AI Proctoring</th>
                  <th className="py-4 pr-6 text-right">Date Completed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {displayHistory.map((run) => {
                  const maxQ = run.tests?.total_questions || (run.score > 10 ? run.score : 20);
                  const pct = Math.round((run.score / maxQ) * 100);
                  const isPassed = pct >= 50;

                  return (
                    <tr key={run.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 pl-6 font-extrabold text-slate-900">
                        {run.tests?.title || 'Comprehensive Assessment'}
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold text-xs capitalize">
                          {run.tests?.category || 'General'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center font-bold">
                        <span className="text-indigo-600 font-extrabold">{run.score}</span> / {maxQ} ({pct}%)
                      </td>
                      <td className="py-4 px-4 text-center">
                        {isPassed ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-100/70 px-2.5 py-0.5 rounded-full text-xs">
                            <CheckCircle2 size={12} /> Passed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-700 font-bold bg-rose-100/70 px-2.5 py-0.5 rounded-full text-xs">
                            <XCircle size={12} /> Failed
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {run.warnings_issued > 0 ? (
                          <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold text-xs">
                            {run.warnings_issued} Warning{run.warnings_issued > 1 ? 's' : ''}
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-bold text-xs bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            Clean
                          </span>
                        )}
                      </td>
                      <td className="py-4 pr-6 text-right text-slate-500 font-mono text-xs">
                        {run.completed_at ? new Date(run.completed_at).toLocaleDateString() : 'Recent'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <BookOpen size={28} />
              </div>
              <h4 className="font-extrabold text-slate-900 text-base">No Completed Tests Yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Take practice tests or live exams to see your attempt history and activate real AI weakness insights.
              </p>
              <Link 
                href="/student/dashboard/tests/practice"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-xs shadow-sm hover:bg-indigo-700 transition-colors mt-2"
              >
                Start Practice Assessment
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* AI Performance Report Modal */}
      <AnimatePresence>
        {showReportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl relative border border-slate-200"
            >
              <button 
                onClick={() => setShowReportModal(false)} 
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition-colors"
              >
                ✕
              </button>
              
              <div className="flex items-center gap-2.5 text-indigo-700 mb-4">
                <Sparkles size={24} />
                <h2 className="text-2xl font-extrabold text-slate-900">Personal AI Diagnostic Report</h2>
              </div>
              
              <div className="prose prose-slate max-w-none whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                {aiReport}
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100 text-right">
                <button
                  onClick={() => setShowReportModal(false)}
                  className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
                >
                  Close Report
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
