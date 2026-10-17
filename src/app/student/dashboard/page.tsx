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
  CalendarDays,
  GraduationCap,
  Loader2,
  Check
} from 'lucide-react';

const STREAM_BRANCH_OPTIONS: Record<string, string[]> = {
  'B.Tech': ['CSE', 'ECE', 'AI & DS', 'IT', 'EEE', 'MECH', 'CIVIL'],
  'MBA': ['Finance', 'HR', 'Marketing', 'Business Analytics', 'Operations'],
  'MCA': ['Software Dev', 'Data Science', 'Cloud Systems'],
  'M.Tech': ['Computer Science', 'VLSI Design', 'Power Systems']
};

export default function StudentDashboardOverview() {
  const [userName, setUserName] = useState('Student');
  const [selectedBadge, setSelectedBadge] = useState<any>(null);
  
  // Mandatory Academic Profile Modal State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileForm, setProfileForm] = useState({
    name: '',
    rollNumber: '',
    stream: 'B.Tech',
    branch: 'CSE',
    year: '1st Year',
    section: 'A'
  });
  
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser(user);
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        const userMeta = user.user_metadata || {};
        const name = profile?.name || userMeta.full_name || user.email?.split('@')[0] || '';
        const rollNumber = profile?.roll_number || userMeta.roll_number || '';
        const stream = profile?.stream || userMeta.stream || 'B.Tech';
        const branch = profile?.branch || userMeta.branch || 'CSE';
        const year = profile?.year || userMeta.year || '1st Year';
        const section = profile?.section || userMeta.section || 'A';

        if (name) {
          setUserName(name.split(' ')[0]);
        }

        setProfileForm({
          name,
          rollNumber,
          stream,
          branch,
          year,
          section
        });

        // If roll number or other required academic info is missing, show mandatory modal
        if (!rollNumber || !profile?.stream || !profile?.branch || !profile?.section) {
          setShowProfileModal(true);
        }
      }
    };
    fetchUser();
  }, []);

  const handleStreamChange = (newStream: string) => {
    const availableBranches = STREAM_BRANCH_OPTIONS[newStream] || ['General'];
    const availableYears = newStream === 'B.Tech' 
      ? ['1st Year', '2nd Year', '3rd Year', '4th Year'] 
      : ['1st Year', '2nd Year'];

    setProfileForm(prev => ({
      ...prev,
      stream: newStream,
      branch: availableBranches[0] || 'CSE',
      year: availableYears.includes(prev.year) ? prev.year : '1st Year'
    }));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.rollNumber.trim()) {
      setProfileError('Please enter your University / College Roll Number.');
      return;
    }
    if (!profileForm.name.trim()) {
      setProfileError('Please enter your Full Name.');
      return;
    }

    setProfileSaving(true);
    setProfileError('');

    try {
      const cleanRoll = profileForm.rollNumber.trim().toUpperCase();
      const cleanName = profileForm.name.trim();

      // 1. Update profiles table
      const { error: profError } = await supabase
        .from('profiles')
        .upsert({
          id: currentUser.id,
          name: cleanName,
          email: currentUser.email,
          role: 'student',
          roll_number: cleanRoll,
          stream: profileForm.stream,
          branch: profileForm.branch,
          year: profileForm.year,
          section: profileForm.section
        });

      if (profError) throw profError;

      // 2. Update auth user metadata for instantaneous local access
      await supabase.auth.updateUser({
        data: {
          full_name: cleanName,
          roll_number: cleanRoll,
          stream: profileForm.stream,
          branch: profileForm.branch,
          year: profileForm.year,
          section: profileForm.section
        }
      });

      setUserName(cleanName.split(' ')[0]);
      setShowProfileModal(false);
    } catch (err: any) {
      console.error('Failed to save profile:', err);
      setProfileError(err.message || 'Failed to update academic profile. Please try again.');
    } finally {
      setProfileSaving(false);
    }
  };

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

      {/* Mandatory Academic Profile Setup Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-[120] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300 relative my-8">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 p-6 sm:p-7 text-white text-center relative">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-3 border border-white/30 shadow-inner">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider mb-2 border border-white/20">
                🎓 Mandatory Student Onboarding
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold">Complete Your Academic Profile</h2>
              <p className="text-indigo-100 text-xs sm:text-sm mt-1 max-w-md mx-auto leading-relaxed">
                Please enter your academic details. Your faculty will assign tests and monitor attendance based on your stream and section.
              </p>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProfile} className="p-6 sm:p-8 space-y-4">
              {profileError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{profileError}</span>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 tracking-wider mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Sai Teja"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                />
              </div>

              {/* Roll Number */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 tracking-wider mb-1.5">
                  College / University Roll Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.rollNumber}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, rollNumber: e.target.value.toUpperCase() }))}
                  placeholder="e.g., 23A91A0501"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-800 placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all uppercase"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  This will be used by your faculty to identify your test submissions and grade sheets.
                </span>
              </div>

              {/* Stream & Branch Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 tracking-wider mb-1.5">
                    Stream <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={profileForm.stream}
                    onChange={(e) => handleStreamChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  >
                    <option value="B.Tech">B.Tech</option>
                    <option value="MBA">MBA</option>
                    <option value="MCA">MCA</option>
                    <option value="M.Tech">M.Tech</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 tracking-wider mb-1.5">
                    Branch / Discipline <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={profileForm.branch}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, branch: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  >
                    {(STREAM_BRANCH_OPTIONS[profileForm.stream] || ['CSE']).map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Year & Section Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 tracking-wider mb-1.5">
                    Academic Year <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={profileForm.year}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, year: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    {profileForm.stream === 'B.Tech' && (
                      <>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 tracking-wider mb-1.5">
                    Section <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={profileForm.section}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, section: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                    <option value="D">Section D</option>
                    <option value="E">Section E</option>
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  {profileSaving ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <>
                      <Check size={18} />
                      <span>Save & Access Dashboard</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
