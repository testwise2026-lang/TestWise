'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BrainCircuit, Calculator, MessageSquare, Trophy, Clock, PlayCircle, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '@/utils/supabase';

export default function PracticeTestsPage() {
  const tabs = [
    { id: 'all', label: 'All Practice Modules', icon: Trophy },
    { id: 'aptitude', label: 'Aptitude', icon: Calculator },
    { id: 'reasoning', label: 'Reasoning', icon: BrainCircuit },
    { id: 'verbal', label: 'Verbal', icon: MessageSquare },
  ];

  const [activeTab, setActiveTab] = useState('all');
  const [dbTests, setDbTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPracticeTests = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('tests')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (!error && data) {
          let deletedList: string[] = [];
          try {
            const stored = localStorage.getItem('testwise_deleted_test_ids');
            if (stored) deletedList = JSON.parse(stored);
          } catch (e) {}

          const cleanTests = data.filter((t: any) => {
            if (deletedList.includes(t.id)) return false;
            // Exclude seed/dummy test IDs
            if (/^[123]{8}-[123]{4}-[123]{4}-[123]{4}-[123]{12}$/.test(t.id)) return false;
            const title = (t.title || '').trim().toLowerCase();
            if (title.includes('practice - easy') || title.includes('practice - medium') || title.includes('practice - hard')) return false;
            const desc = t.description || '';
            if (desc.includes('[DELETED]')) return false;
            // Only include practice tests
            return desc.includes('[TYPE:practice]');
          });

          setDbTests(cleanTests);
        }
      } catch (err) {
        console.error('Error fetching practice tests:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPracticeTests();
  }, []);

  const themeForCategory = (cat: string) => {
    switch ((cat || '').toLowerCase()) {
      case 'aptitude': return { bg: "bg-orange-50 border-orange-200 text-orange-600", btn: "bg-orange-600 hover:bg-orange-700", badge: "bg-orange-100 text-orange-700" };
      case 'reasoning': return { bg: "bg-violet-50 border-violet-200 text-violet-600", btn: "bg-violet-600 hover:bg-violet-700", badge: "bg-violet-100 text-violet-700" };
      case 'verbal': return { bg: "bg-teal-50 border-teal-200 text-teal-600", btn: "bg-teal-600 hover:bg-teal-700", badge: "bg-teal-100 text-teal-700" };
      default: return { bg: "bg-indigo-50 border-indigo-200 text-indigo-600", btn: "bg-indigo-600 hover:bg-indigo-700", badge: "bg-indigo-100 text-indigo-700" };
    }
  };

  const filteredTests = activeTab === 'all'
    ? dbTests
    : dbTests.filter(t => (t.category || '').toLowerCase() === activeTab);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-16">
      
      {/* Header */}
      <div className="bg-white p-8 rounded-3xl border border-[#DDE3DD] shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-orange-100 to-transparent rounded-full -mr-20 -mt-20 opacity-50 blur-3xl"></div>
        <h1 className="text-3xl font-bold text-[#17221B] relative z-10">Practice Modules</h1>
        <p className="text-[#68736C] mt-2 max-w-2xl relative z-10 text-lg">
          Master specific topics at your own pace with curated practice modules assigned by your teachers.
        </p>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 border-b border-[#DDE3DD] pb-4 w-full">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-center gap-2 px-3 py-2.5 sm:px-6 sm:py-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white text-slate-600 border border-[#DDE3DD] hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Test Cards List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin mb-3" />
          <p className="text-slate-500 font-medium">Loading practice modules...</p>
        </div>
      ) : filteredTests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTests.map((test) => {
            const theme = themeForCategory(test.category);
            return (
              <div
                key={test.id}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DDE3DD] shadow-sm hover:border-orange-300 hover:shadow-lg transition-all flex flex-col justify-between group relative overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${theme.badge}`}>
                      {test.category || 'General'}
                    </span>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-600">
                      {test.difficulty || 'MEDIUM'}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                    {test.title}
                  </h3>

                  <p className="text-slate-500 text-sm mt-2 line-clamp-2">
                    {(test.description || '').replace(/^\[TYPE:[a-z]+\]\s*/i, '').replace(/\[STATUS:[a-z]+\]/i, '').trim() || 'Topic practice questions.'}
                  </p>

                  <div className="flex items-center gap-4 mt-4 text-xs sm:text-sm font-semibold text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <Trophy size={15} className="text-orange-500" />
                      {test.total_questions || 0} Questions
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={15} className="text-slate-400" />
                      {test.duration_minutes || 20} Mins
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end">
                  <Link
                    href={`/student/take-test/${test.id}`}
                    className={`w-full sm:w-auto px-6 py-2.5 ${theme.btn} text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm`}
                  >
                    <PlayCircle size={16} /> START PRACTICE
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-[#DDE3DD] p-12 text-center max-w-lg mx-auto shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto mb-4">
            <Sparkles size={28} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No Practice Modules Yet</h3>
          <p className="text-slate-500 text-sm leading-relaxed">
            Your teacher has not published any practice tests in this category yet. When they publish one, it will appear here automatically!
          </p>
        </div>
      )}

    </div>
  );
}
