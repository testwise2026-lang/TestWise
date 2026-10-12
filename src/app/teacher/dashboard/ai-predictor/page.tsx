'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, BrainCircuit, Activity, TrendingDown, 
  Users, ChevronRight, Mail, UserPlus, Target, ShieldAlert,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function AIPredictorPage() {
  const atRiskStudents = [
    {
      id: 1,
      name: 'Rahul Sharma',
      idNumber: 'CS2023-045',
      riskLevel: 'Critical',
      projectedTopic: 'Data Interpretation',
      reason: 'Accuracy dropped from 78% to 42% over last 3 tests. Taking 3x longer on calculation questions.',
      probability: '89%',
      avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Rahul&backgroundColor=fee2e2'
    },
    {
      id: 2,
      name: 'Priya Patel',
      idNumber: 'EC2023-112',
      riskLevel: 'High',
      projectedTopic: 'Quantitative Aptitude',
      reason: 'Skipped 40% of Aptitude questions in recent Mock Exam. Time management is severely unbalanced.',
      probability: '75%',
      avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Priya&backgroundColor=ffedd5'
    },
    {
      id: 3,
      name: 'Arjun Reddy',
      idNumber: 'ME2023-088',
      riskLevel: 'Medium',
      projectedTopic: 'Verbal Reasoning',
      reason: 'Consistently scoring below 50% in Vocabulary section despite good performance in other areas.',
      probability: '62%',
      avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Arjun&backgroundColor=fef3c7'
    }
  ];

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

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <BrainCircuit className="text-indigo-600" size={32} /> 
            AI Early Warning System
          </h1>
          <p className="text-slate-500 font-medium mt-1">Predictive analytics to identify and help struggling students before exams.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => alert('Re-running AI Model...')} className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-50 shadow-sm transition-all">
            <Activity size={18} /> Re-run AI Model
          </button>
          <button onClick={() => alert('Emails have been sent to all at-risk students.')} className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-sm transition-all">
            <Mail size={18} /> Email All At-Risk
          </button>
        </div>
      </div>

      {/* AI Master Insight Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-10 text-white shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-64 h-64 bg-indigo-500 opacity-20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-48 h-48 bg-rose-500 opacity-20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
          
          <div className="flex-1 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
              <Activity size={14} className="animate-pulse" /> Model Status: Active (94% Accuracy)
            </div>
            <h2 className="text-3xl font-bold leading-tight">
              14 Students are currently projected to <span className="text-rose-400 font-extrabold underline decoration-rose-500/50 decoration-4 underline-offset-4">fail</span> the upcoming Campus Placement Mock.
            </h2>
            <p className="text-slate-300 font-medium text-lg max-w-2xl">
              The AI has detected severe drop-offs in Data Interpretation and Time Management across these profiles. Immediate intervention is recommended.
            </p>
          </div>

          <div className="shrink-0 flex gap-4">
            <div className="bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-2xl text-center min-w-[140px]">
              <AlertTriangle size={32} className="text-rose-400 mx-auto mb-2" />
              <p className="text-4xl font-black">3</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Critical Risk</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-2xl text-center min-w-[140px]">
              <TrendingDown size={32} className="text-amber-400 mx-auto mb-2" />
              <p className="text-4xl font-black">11</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">High Risk</p>
            </div>
          </div>
          
        </div>
      </motion.div>

      {/* Actionable Student List */}
      <div className="flex items-center justify-between pt-4">
        <h3 className="font-extrabold text-xl text-slate-900 flex items-center gap-2">
          <Users className="text-indigo-600" /> Action Required ({atRiskStudents.length} Highest Priority)
        </h3>
        <Link href="/teacher/dashboard/analytics" className="flex items-center gap-2 text-sm font-bold text-indigo-600 cursor-pointer hover:text-indigo-800">
          View All 14 Students <ArrowRight size={16} />
        </Link>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-6"
      >
        {atRiskStudents.map((student, idx) => (
          <motion.div key={idx} variants={itemVariants} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group flex flex-col md:flex-row gap-6 md:items-center">
            
            {/* Student Info */}
            <div className="flex items-center gap-4 w-full md:w-64 shrink-0">
              <div className="w-14 h-14 rounded-full border border-slate-200 shadow-sm overflow-hidden bg-slate-50">
                <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">{student.name}</h4>
                <p className="text-xs font-bold text-slate-500">{student.idNumber}</p>
              </div>
            </div>

            {/* AI Diagnosis */}
            <div className="flex-1 bg-slate-50 rounded-2xl p-4 border border-slate-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <BrainCircuit size={60} />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Target size={16} className="text-indigo-500" />
                <span className="text-sm font-bold text-slate-800">Struggling with: <span className="text-indigo-700">{student.projectedTopic}</span></span>
              </div>
              <p className="text-sm text-slate-600 font-medium">
                {student.reason}
              </p>
            </div>

            {/* Risk Level & Actions */}
            <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 w-full md:w-48 shrink-0">
              <div className="text-left md:text-right">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Failure Probability</p>
                <div className="flex items-center gap-2 justify-start md:justify-end">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1 ${
                    student.riskLevel === 'Critical' ? 'bg-rose-100 text-rose-700' :
                    student.riskLevel === 'High' ? 'bg-amber-100 text-amber-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {student.riskLevel === 'Critical' && <ShieldAlert size={12} />}
                    {student.riskLevel}
                  </span>
                  <span className="font-black text-xl text-slate-800">{student.probability}</span>
                </div>
              </div>
              
              <button onClick={() => alert('Remedial Test assigned successfully!')} className="bg-white border-2 border-indigo-100 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 px-4 py-2 rounded-xl text-sm font-bold transition-all w-full md:w-auto">
                Assign Remedial Test
              </button>
            </div>
            
          </motion.div>
        ))}
      </motion.div>

    </div>
  );
}
