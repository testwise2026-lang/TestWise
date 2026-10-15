'use client';

import { useState, useEffect } from 'react';
import { Radio, Calendar, Users, History, PlayCircle, Loader2, Clock, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/utils/supabase';

export default function LiveTestsPage() {
  const [liveTests, setLiveTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLiveTests = async () => {
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
            const desc = t.description || '';
            if (desc.includes('[DELETED]')) return false;
            // Only include live tests
            return desc.includes('[TYPE:live]');
          });

          setLiveTests(cleanTests);
        }
      } catch (err) {
        console.error('Error fetching live tests:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLiveTests();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-16">
      
      {/* Header */}
      <div className="bg-white p-8 rounded-3xl border border-[#DDE3DD] shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative z-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-rose-100 to-transparent rounded-full -mr-20 -mt-20 opacity-50 blur-3xl -z-10"></div>
          <h1 className="text-3xl font-bold text-[#17221B] flex items-center gap-3">
            Live Examinations <span className="relative flex h-4 w-4"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span><span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500"></span></span>
          </h1>
          <p className="text-[#68736C] mt-2 max-w-2xl text-lg">
            Real-time proctored examinations scheduled by your teachers and institution.
          </p>
        </div>
      </div>

      {/* Tests Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-[#17221B] flex items-center gap-2">
          <Radio className="text-rose-500" /> Active & Upcoming Exams
        </h2>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-rose-500 animate-spin mb-3" />
            <p className="text-slate-500 font-medium">Checking for active live tests...</p>
          </div>
        ) : liveTests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {liveTests.map((test) => (
              <div 
                key={test.id} 
                className="bg-gradient-to-br from-rose-50/60 to-white rounded-3xl p-8 border border-rose-100 shadow-sm relative overflow-hidden group flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <span className="px-3 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded-full flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span> LIVE NOW
                    </span>
                    <span className="text-xs font-bold text-slate-500 bg-white/80 px-2.5 py-1 rounded-md border border-slate-200">
                      {test.category || 'General'}
                    </span>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-rose-950 mb-2 relative z-10">
                    {test.title}
                  </h3>

                  <p className="text-slate-600 text-sm mb-6 relative z-10 line-clamp-2">
                    {(test.description || '').replace(/^\[TYPE:[a-z]+\]\s*/i, '').replace(/\[STATUS:[a-z]+\]/i, '').trim() || 'Proctored real-time assessment.'}
                  </p>

                  <div className="flex items-center gap-4 text-xs sm:text-sm font-semibold text-rose-900/80 mb-6">
                    <span className="flex items-center gap-1.5">
                      <Clock size={16} className="text-rose-500" />
                      {test.duration_minutes || 60} Minutes
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users size={16} className="text-rose-500" />
                      {test.total_questions || 0} Questions
                    </span>
                  </div>
                </div>
                
                <Link 
                  href={`/student/take-test/${test.id}?mode=live`} 
                  className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md shadow-rose-200 transition-transform hover:-translate-y-0.5 flex items-center justify-center gap-2 relative z-10 text-center"
                >
                  <PlayCircle size={20} /> ENTER EXAM NOW
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-[#DDE3DD] p-12 text-center max-w-lg mx-auto shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <Sparkles size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Live Exams Right Now</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              There are no scheduled live examinations at this moment. When your teacher schedules or starts a live assessment, it will show up here immediately.
            </p>
          </div>
        )}
      </div>

      {/* Historical Note */}
      <div className="space-y-4 pt-6">
        <h2 className="text-xl font-bold text-[#17221B] flex items-center gap-2">
          <History className="text-slate-400" /> Past Examinations
        </h2>
        <div className="bg-white rounded-2xl border border-[#DDE3DD] p-6 text-slate-500 text-sm">
          No past live test submissions recorded yet. All completed test reports will be viewable in your <Link href="/student/dashboard/analytics" className="text-indigo-600 font-bold underline">Analytics</Link> page.
        </div>
      </div>

    </div>
  );
}
