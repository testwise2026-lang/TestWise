'use client';

import { Radio, Calendar, Users, History, PlayCircle } from 'lucide-react';
import Link from 'next/link';

export default function LiveTestsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      <div className="bg-white p-8 rounded-3xl border border-[#DDE3DD] shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative z-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-rose-100 to-transparent rounded-full -mr-20 -mt-20 opacity-50 blur-3xl -z-10"></div>
          <h1 className="text-3xl font-bold text-[#17221B] flex items-center gap-3">
            Live Tests <span className="relative flex h-4 w-4"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span><span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500"></span></span>
          </h1>
          <p className="text-[#68736C] mt-2 max-w-2xl text-lg">
            Compete with hundreds of students in real-time. Don't miss out on scheduled challenges.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-bold text-[#17221B] flex items-center gap-2">
          <Radio className="text-rose-500" /> Active & Upcoming
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-rose-50 to-orange-50 rounded-3xl p-8 border border-rose-100 shadow-sm relative overflow-hidden group">
            <div className="flex justify-between items-start mb-6 relative z-10">
              <span className="px-3 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> LIVE NOW
              </span>
              <span className="text-sm font-bold text-rose-700 flex items-center gap-1"><Users size={16}/> 1,204 Joined</span>
            </div>
            
            <h3 className="text-2xl font-bold text-rose-950 mb-2 relative z-10">Mega Aptitude Challenge</h3>
            <p className="text-rose-800/80 mb-8 relative z-10 font-medium flex items-center gap-2">
              <Calendar size={16} /> Ends in 45 Minutes
            </p>
            
            <Link href="/student/take-test/11111111-1111-1111-1111-111111111111?mode=live" className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md shadow-rose-200 transition-transform hover:-translate-y-0.5 flex items-center justify-center gap-2 relative z-10">
              <PlayCircle size={20} /> ENTER EXAM
            </Link>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-[#DDE3DD] shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">
                UPCOMING
              </span>
            </div>
            
            <h3 className="text-2xl font-bold text-[#17221B] mb-2">Weekly Reasoning Test</h3>
            <p className="text-[#68736C] mb-8 font-medium flex items-center gap-2">
              <Calendar size={16} /> Tomorrow, 10:00 AM
            </p>
            
            <button onClick={() => alert('Reminder set! We will notify you 30 mins before the test.')} className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-[#17221B] font-bold rounded-xl transition-colors">
              Set Reminder
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-6 pt-8">
        <h2 className="text-xl font-bold text-[#17221B] flex items-center gap-2">
          <History className="text-slate-400" /> Past Live Tests
        </h2>
        
        <div className="bg-white rounded-2xl border border-[#DDE3DD] overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h4 className="font-bold text-[#17221B] text-lg">Tech Mahindra Pattern Test</h4>
              <p className="text-sm text-[#68736C] mt-1">Conducted on Oct 5, 2026</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-xs text-[#68736C] uppercase font-bold">Your Rank</p>
                <p className="text-lg font-bold text-violet-600">42 / 800</p>
              </div>
              <Link href="/student/dashboard/analytics" className="text-sm font-bold text-violet-600 hover:text-violet-800 underline underline-offset-4">
                View Analysis
              </Link>
            </div>
          </div>
          
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h4 className="font-bold text-[#17221B] text-lg">Verbal Ability Marathon</h4>
              <p className="text-sm text-[#68736C] mt-1">Conducted on Oct 1, 2026</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-xs text-[#68736C] uppercase font-bold">Your Rank</p>
                <p className="text-lg font-bold text-slate-400">Did not attend</p>
              </div>
              <Link href="/student/dashboard/tests/practice" className="text-sm font-bold text-violet-600 hover:text-violet-800 underline underline-offset-4">
                Take as Practice
              </Link>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

