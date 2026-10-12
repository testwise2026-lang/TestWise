'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/utils/supabase';
import { 
  Flame, 
  Award, 
  Target, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Lightbulb, 
  ArrowRight,
  PlayCircle,
  BookOpen,
  TrendingUp,
  X,
  Star,
  Activity,
  CalendarDays
} from 'lucide-react';

export default function StudentDashboardOverview() {
  const [userName, setUserName] = useState('Student');
  const [selectedBadge, setSelectedBadge] = useState<any>(null);
  
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('name').eq('id', user.id).single();
        if (data?.name) {
          setUserName(data.name.split(' ')[0]);
        }
      }
    };
    fetchUser();
  }, []);

  const badges = [
    { title: "Top 10% Overall", icon: "🏆", desc: "Awarded for staying in the top 10% of your college leaderboard for 3 consecutive weeks.", colorClasses: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100", modalClasses: "bg-amber-100 text-amber-600 bg-amber-50 bg-amber-600 hover:bg-amber-700" },
    { title: "Aptitude Master", icon: "🥇", desc: "You scored above 90% in 5 difficult aptitude practice tests.", colorClasses: "bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100", modalClasses: "bg-violet-100 text-violet-600 bg-violet-50 bg-violet-600 hover:bg-violet-700" },
    { title: "Speed Demon", icon: "🎯", desc: "You finished a Mock Exam 15 minutes before the time ran out with 80%+ accuracy.", colorClasses: "bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100", modalClasses: "bg-teal-100 text-teal-600 bg-teal-50 bg-teal-600 hover:bg-teal-700" }
  ];

  const recentActivities = [
    { title: "Completed Mock Exam: Aptitude", time: "2 hours ago", score: "88%", icon: <CheckCircle2 size={16} className="text-emerald-500" />, bg: "bg-emerald-50" },
    { title: "Read eNote: Percentages Shortcuts", time: "Yesterday", icon: <BookOpen size={16} className="text-blue-500" />, bg: "bg-blue-50" },
    { title: "Earned Badge: Speed Demon", time: "2 days ago", icon: <Award size={16} className="text-amber-500" />, bg: "bg-amber-50" },
    { title: "Practice Test: Blood Relations", time: "3 days ago", score: "75%", icon: <Target size={16} className="text-violet-500" />, bg: "bg-violet-50" }
  ];

  return (
    <>
      <div className="max-w-7xl mx-auto space-y-8 pb-10">
        
        {/* Hero Banner Section */}
        <div className="relative bg-gradient-to-br from-violet-600 via-violet-500 to-fuchsia-500 rounded-3xl p-8 sm:p-10 text-white shadow-xl overflow-hidden animate-in slide-in-from-top-4 fade-in duration-700">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-20 w-40 h-40 bg-teal-300 opacity-20 rounded-full blur-xl"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex-1">
              <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-white/20 shadow-sm">
                Dashboard Overview
              </span>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-3">Welcome back, {userName}! 🚀</h1>
              <p className="text-violet-100 font-medium text-lg max-w-xl leading-relaxed">
                You're doing great! Keep up the momentum. Today is a perfect day to conquer your weak topics and claim your next badge.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Daily Target Card inside Hero */}
              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/20 px-6 py-4 rounded-3xl shadow-lg hover:scale-105 transition-transform cursor-default">
                <div className="bg-teal-400/20 p-3 rounded-2xl">
                  <CalendarDays size={32} className="text-teal-300" />
                </div>
                <div>
                  <p className="text-xs text-violet-100 font-bold uppercase tracking-wider">Daily Goal</p>
                  <p className="font-extrabold text-2xl">2 / 3 Tests</p>
                  <div className="w-full bg-black/20 rounded-full h-1.5 mt-2">
                    <div className="bg-teal-400 h-1.5 rounded-full" style={{ width: '66%' }}></div>
                  </div>
                </div>
              </div>

              {/* Streak Card */}
              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/20 px-6 py-4 rounded-3xl shadow-lg hover:scale-105 transition-transform cursor-default">
                <div className="bg-orange-400/20 p-3 rounded-2xl">
                  <Flame size={32} className="text-orange-300 animate-pulse" />
                </div>
                <div>
                  <p className="text-xs text-violet-100 font-bold uppercase tracking-wider">Current Streak</p>
                  <p className="font-extrabold text-2xl">7 Days</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Badges / Achievements Strip */}
        <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-sm flex flex-wrap items-center gap-2 sm:gap-4 animate-in slide-in-from-bottom-8 fade-in duration-700 delay-100 group">
          <div className="flex-shrink-0 flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-wider w-full sm:w-auto mb-2 sm:mb-0 group-hover:text-violet-500 transition-colors">
            <Award size={18} /> Your Badges
          </div>
          
          {badges.map((badge, idx) => (
            <button 
              key={idx}
              onClick={() => setSelectedBadge(badge)}
              className={`flex items-center gap-1.5 sm:gap-2 ${badge.colorClasses} px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold border hover:scale-105 hover:shadow-md transition-all cursor-pointer whitespace-nowrap flex-1 sm:flex-none justify-center`}
            >
              <span className="text-base sm:text-lg">{badge.icon}</span> <span className="truncate">{badge.title}</span>
            </button>
          ))}
          
          <Link href="/student/dashboard/analytics" className="flex items-center justify-center gap-2 bg-slate-50 text-slate-600 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold border border-slate-200 border-dashed hover:bg-slate-100 hover:text-slate-900 transition-colors whitespace-nowrap flex-1 sm:flex-none">
            + View All
          </Link>
        </div>

        {/* 3-Column Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Quick Stats & Recent Activity (Takes 1 Col) */}
          <div className="lg:col-span-1 space-y-6 sm:space-y-8">
            
            <div className="grid grid-cols-3 lg:grid-cols-1 gap-3 sm:gap-4">
              {[
                { label: "Accuracy", value: "84%", subtitle: "+2% from last week", icon: Target, color: "blue", delay: "delay-100" },
                { label: "Completed", value: "12", subtitle: "2 pending reviews", icon: CheckCircle2, color: "emerald", delay: "delay-200" },
                { label: "Rank", value: "92nd", subtitle: "Top 8% in College", icon: TrendingUp, color: "violet", delay: "delay-300" }
              ].map((stat, i) => (
                <div key={i} className={`bg-white p-3 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-center lg:items-center gap-2 lg:gap-5 text-center lg:text-left hover:border-${stat.color}-300 hover:shadow-md hover:-translate-y-1 transition-all animate-in slide-in-from-bottom-8 fade-in duration-700 ${stat.delay}`}>
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-xl sm:rounded-2xl bg-${stat.color}-50 flex items-center justify-center text-${stat.color}-600 flex-shrink-0`}>
                    <stat.icon className="w-5 h-5 lg:w-7 lg:h-7" />
                  </div>
                  <div className="overflow-hidden w-full">
                    <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 leading-tight">{stat.value}</p>
                    <p className="text-[10px] sm:text-xs font-bold text-slate-700 mt-0.5 lg:mt-1 uppercase tracking-wider truncate">{stat.label}</p>
                    <p className="hidden lg:block text-xs text-slate-500 font-medium mt-1 truncate">{stat.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Activity Timeline */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 animate-in slide-in-from-bottom-8 fade-in duration-700 delay-400">
              <h3 className="font-extrabold text-lg text-slate-900 mb-6 flex items-center gap-2">
                <Activity className="text-blue-500" /> Recent Activity
              </h3>
              <div className="space-y-6">
                {recentActivities.map((activity, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full ${activity.bg} flex items-center justify-center`}>
                      {activity.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-800 text-sm">{activity.title}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-slate-500 font-medium">{activity.time}</span>
                        {activity.score && <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">{activity.score}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/student/dashboard/analytics" className="w-full mt-6 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold rounded-xl text-sm transition-colors border border-slate-200 text-center block">
                View Full History
              </Link>
            </div>

          </div>

          {/* Right Column: Progress, Actions, Suggestions (Takes 2 Cols) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Subject Progress */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 animate-in slide-in-from-bottom-8 fade-in duration-700 delay-400">
              <h3 className="font-extrabold text-lg text-slate-900 mb-8 flex items-center gap-2">
                <Star className="text-yellow-500" /> Syllabus Progress
              </h3>
              
              <div className="space-y-8">
                <div>
                  <div className="flex justify-between items-end mb-3">
                    <div>
                      <span className="font-bold text-slate-800 text-lg">Aptitude</span>
                      <p className="text-xs text-slate-500 font-medium mt-1">24/30 Topics Completed</p>
                    </div>
                    <span className="font-extrabold text-orange-600 text-xl">80%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-4 shadow-inner">
                    <div className="bg-gradient-to-r from-orange-400 to-orange-500 h-4 rounded-full relative" style={{ width: '80%' }}>
                      <div className="absolute inset-0 bg-white/20 rounded-full animate-[shimmer_2s_infinite]"></div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-end mb-3">
                    <div>
                      <span className="font-bold text-slate-800 text-lg">Reasoning</span>
                      <p className="text-xs text-slate-500 font-medium mt-1">13/20 Topics Completed</p>
                    </div>
                    <span className="font-extrabold text-violet-600 text-xl">65%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-4 shadow-inner">
                    <div className="bg-gradient-to-r from-violet-400 to-violet-500 h-4 rounded-full relative" style={{ width: '65%' }}>
                      <div className="absolute inset-0 bg-white/20 rounded-full animate-[shimmer_2s_infinite] delay-75"></div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-end mb-3">
                    <div>
                      <span className="font-bold text-slate-800 text-lg">Verbal</span>
                      <p className="text-xs text-slate-500 font-medium mt-1">8/20 Topics Completed</p>
                    </div>
                    <span className="font-extrabold text-teal-600 text-xl">40%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-4 shadow-inner">
                    <div className="bg-gradient-to-r from-teal-400 to-teal-500 h-4 rounded-full relative" style={{ width: '40%' }}>
                       <div className="absolute inset-0 bg-white/20 rounded-full animate-[shimmer_2s_infinite] delay-150"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Smart Suggestion & Action (Side by Side) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-8 fade-in duration-700 delay-500">
              
              {/* Action Required */}
              <div className="bg-white rounded-3xl border border-red-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-lg hover:border-red-300 transition-all">
                <div className="bg-red-50 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={20} className="text-red-600 animate-pulse" />
                    <h3 className="font-extrabold text-red-800 tracking-wide uppercase text-sm">Live Now</h3>
                  </div>
                </div>
                <div className="p-6 md:p-8 flex-1 flex flex-col justify-center">
                  <h4 className="text-2xl font-bold text-slate-900 group-hover:text-red-700 transition-colors">National Aptitude Challenge</h4>
                  <p className="text-slate-500 font-medium mt-3 flex items-center gap-2">
                    <Clock size={18} className="text-red-400" /> Closes in 45 Mins
                  </p>
                  <Link href="/student/dashboard/tests/live" className="mt-8 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] shadow-md shadow-red-500/20 text-lg">
                    <PlayCircle size={22} /> Join Test
                  </Link>
                </div>
              </div>

              {/* Smart Suggestion */}
              <div className="bg-gradient-to-br from-violet-50 to-teal-50 rounded-3xl border border-violet-200 shadow-sm overflow-hidden flex flex-col relative group hover:shadow-lg transition-all">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none group-hover:scale-110 group-hover:rotate-12 transition-transform duration-700">
                  <Lightbulb size={120} />
                </div>
                
                <div className="px-6 py-4 flex items-center gap-2">
                  <Lightbulb size={20} className="text-violet-600" />
                  <h3 className="font-extrabold text-violet-800 tracking-wide uppercase text-sm">Suggestion</h3>
                </div>
                
                <div className="p-6 md:p-8 flex-1 flex flex-col justify-center relative z-10">
                  <h4 className="text-2xl font-bold text-slate-900 group-hover:text-violet-800 transition-colors">Practice Verbal</h4>
                  <p className="text-slate-600 font-medium mt-3 leading-relaxed">
                    Your verbal progress is at 40%. Read the Synonyms eNote to boost it!
                  </p>
                  
                  <Link href="/student/dashboard/enotes" className="mt-8 w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] shadow-md shadow-violet-500/20 text-lg">
                    Read eNote <ArrowRight size={22} />
                  </Link>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Badge Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 relative text-center p-8">
            <button 
              onClick={() => setSelectedBadge(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 hover:text-red-500 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center text-5xl mb-6 shadow-inner border-4 border-white ${selectedBadge.modalClasses.split(' ')[0]}`}>
              {selectedBadge.icon}
            </div>
            
            <h2 className="text-2xl font-extrabold text-slate-900 mb-2">{selectedBadge.title}</h2>
            <div className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full inline-block mx-auto mb-4 ${selectedBadge.modalClasses.split(' ')[1]} ${selectedBadge.modalClasses.split(' ')[2]}`}>
              Unlocked Achievement
            </div>
            
            <p className="text-slate-600 font-medium leading-relaxed">
              {selectedBadge.desc}
            </p>
            
            <button 
              onClick={() => setSelectedBadge(null)}
              className={`mt-8 w-full text-white font-bold py-3.5 rounded-xl transition-all shadow-md ${selectedBadge.modalClasses.split(' ')[3]} ${selectedBadge.modalClasses.split(' ')[4]}`}
            >
              Awesome!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
