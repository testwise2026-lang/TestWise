'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trophy, Clock, CheckCircle, Lock, Calculator, BrainCircuit, MessageSquare } from 'lucide-react';
import { supabase } from '@/utils/supabase';

export default function MockTestsPage() {
  const tabs = [
    { id: 'all', label: 'All Mocks' },
    { id: 'aptitude', label: 'Aptitude' },
    { id: 'reasoning', label: 'Reasoning' },
    { id: 'verbal', label: 'Verbal' },
  ];

  const [activeTab, setActiveTab] = useState('all');
  const [dbMocks, setDbMocks] = useState<any[]>([]);

  useEffect(() => {
    const fetchMocks = async () => {
      try {
        const { data } = await supabase
          .from('tests')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (data) setDbMocks(data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchMocks();
  }, []);

  const themeForCategory = (cat: string) => {
    switch ((cat || '').toLowerCase()) {
      case 'aptitude': return { bg: "bg-orange-500", btn: "bg-orange-600 hover:bg-orange-700", text: "text-orange-500" };
      case 'reasoning': return { bg: "bg-violet-500", btn: "bg-violet-600 hover:bg-violet-700", text: "text-violet-500" };
      case 'verbal': return { bg: "bg-teal-500", btn: "bg-teal-600 hover:bg-teal-700", text: "text-teal-500" };
      default: return { bg: "bg-indigo-500", btn: "bg-indigo-600 hover:bg-indigo-700", text: "text-indigo-500" };
    }
  };

  const formattedDbMocks = dbMocks
    .filter(t => {
      const desc = t.description || '';
      return !desc.includes('[TYPE:practice]') && !desc.includes('[TYPE:live]');
    })
    .map(t => ({
      id: t.id,
      title: t.title,
      category: (t.category || 'aptitude').toLowerCase(),
      questions: t.total_questions || 0,
      mins: t.duration_minutes || 30,
      status: "available",
      theme: themeForCategory(t.category)
    }));

  const filteredMocks = activeTab === 'all' 
    ? formattedDbMocks 
    : formattedDbMocks.filter(m => m.category === activeTab);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      <div className="bg-white p-8 rounded-3xl border border-[#DDE3DD] shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-teal-100 to-transparent rounded-full -mr-20 -mt-20 opacity-50 blur-3xl"></div>
        <h1 className="text-3xl font-bold text-[#17221B] relative z-10">Mock Exams</h1>
        <p className="text-[#68736C] mt-2 max-w-2xl relative z-10 text-lg">
          Take full-length exams that cover all topics within a subject. Test your endurance and time-management.
        </p>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-4 gap-1.5 sm:gap-3 border-b border-[#DDE3DD] pb-4 w-full">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-1 py-2 sm:px-6 sm:py-2.5 rounded-lg sm:rounded-full font-bold text-[10px] sm:text-sm transition-all duration-300 text-center leading-tight ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-600 border border-[#DDE3DD] hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6" key={activeTab}>
        {filteredMocks.map((mock, idx) => (
          <div key={idx} className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-[#DDE3DD] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 relative overflow-hidden group hover:border-violet-300 transition-all animate-in zoom-in-95 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
            
            <div className={`absolute top-0 left-0 w-2 h-full ${mock.theme.bg} opacity-50`}></div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {mock.status === 'completed' && <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-emerald-50 text-emerald-700 text-[10px] sm:text-xs font-bold rounded-full border border-emerald-100 flex items-center gap-1"><CheckCircle size={10} className="sm:w-3 sm:h-3"/> Completed</span>}
                {mock.status === 'locked' && <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-slate-100 text-slate-600 text-[10px] sm:text-xs font-bold rounded-full border border-slate-200 flex items-center gap-1"><Lock size={10} className="sm:w-3 sm:h-3"/> Locked</span>}
              </div>
              <h3 className="text-lg sm:text-2xl font-bold text-[#17221B] leading-tight">{mock.title}</h3>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-2 sm:mt-3 text-xs sm:text-sm text-[#68736C] font-medium">
                <span className="flex items-center gap-1.5"><Trophy size={14} className={`${mock.theme.text} sm:w-4 sm:h-4`} /> {mock.questions} Questions</span>
                <span className="flex items-center gap-1.5"><Clock size={14} className="text-slate-400 sm:w-4 sm:h-4" /> {mock.mins} Minutes</span>
              </div>
            </div>

            <div className="sm:text-right mt-2 sm:mt-0">
              {mock.status === 'available' && (
                <Link href={`/student/take-test/${mock.id || (mock.category === 'reasoning' ? '22222222-2222-2222-2222-222222222222' : '11111111-1111-1111-1111-111111111111')}`} className={`inline-block w-full sm:w-auto px-6 py-2.5 sm:px-8 sm:py-3 ${mock.theme.btn} text-white text-sm sm:text-base font-bold rounded-xl shadow-md transition-transform hover:-translate-y-0.5 text-center`}>
                  START EXAM
                </Link>
              )}
              {mock.status === 'completed' && (
                <div className="flex flex-col gap-2">
                  <div className="text-xl sm:text-2xl font-bold text-emerald-600">{mock.score}</div>
                  <Link href="/student/dashboard/analytics" className="text-xs sm:text-sm font-bold text-[#68736C] hover:text-[#17221B] underline underline-offset-4 transition-colors text-right block">
                    View Results
                  </Link>
                  <button onClick={() => alert('Retake capability is disabled for Mock Tests.')} className="text-xs sm:text-sm font-bold text-violet-600 hover:text-violet-700 underline underline-offset-4 transition-colors">
                    Retake Test
                  </button>
                </div>
              )}
              {mock.status === 'locked' && (
                <button disabled className="w-full sm:w-auto px-6 py-2.5 sm:px-8 sm:py-3 bg-slate-100 text-slate-400 text-sm sm:text-base font-bold rounded-xl cursor-not-allowed">
                  UNLOCK
                </button>
              )}
            </div>
          </div>
        ))}
        {filteredMocks.length === 0 && (
          <div className="col-span-1 lg:col-span-2 text-center py-12 bg-white rounded-3xl border border-[#DDE3DD] shadow-sm">
            <p className="text-slate-500 font-medium">No mock exams available in this category yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

