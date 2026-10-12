'use client'

import { 
  Users, FileText, Activity, PlusCircle, UploadCloud, 
  Calendar, Clock, TrendingUp, Bell, ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { motion } from 'framer-motion';

export default function TeacherOverviewPage() {
  const [userName, setUserName] = useState('Professor');

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('name').eq('id', user.id).single();
        if (data?.name) {
          setUserName(data.name.split(' ')[0]); // Get first name
        }
      }
    };
    fetchUser();
  }, []);

  const stats = [
    { title: 'Total Enrolled', value: '1,240', trend: '+12%', icon: Users, iconColor: 'text-blue-600', iconBg: 'bg-blue-100', hoverBg: 'bg-blue-50' },
    { title: 'Active Tests', value: '45', trend: '+3', icon: FileText, iconColor: 'text-indigo-600', iconBg: 'bg-indigo-100', hoverBg: 'bg-indigo-50' },
    { title: 'Avg. Score', value: '72%', trend: '+4.5%', icon: Activity, iconColor: 'text-emerald-600', iconBg: 'bg-emerald-100', hoverBg: 'bg-emerald-50' },
  ];

  const upcomingTests = [
    { title: 'TCS NQT Mega Mock', date: 'Today, 2:00 PM', candidates: 450, status: 'Starting Soon' },
    { title: 'Verbal Weekly Test', date: 'Tomorrow, 10:00 AM', candidates: 120, status: 'Scheduled' },
  ];

  const recentActivity = [
    { user: 'Rahul Sharma', avatar: 'R', action: 'scored 95% in', target: 'Aptitude Mastery', time: '10 mins ago', type: 'success' },
    { user: 'System', avatar: 'S', action: 'auto-graded 45 submissions for', target: 'Reasoning Basic', time: '1 hour ago', type: 'system' },
    { user: 'Priya Patel', avatar: 'P', action: 'raised a doubt in', target: 'Verbal Mock 3', time: '2 hours ago', type: 'warning' },
    { user: 'Arun Kumar', avatar: 'A', action: 'completed', target: 'Live Speed Test', time: '3 hours ago', type: 'success' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100 } }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 overflow-x-hidden">
      
      {/* 1. Hero / Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-800 rounded-3xl p-8 md:p-12 overflow-hidden shadow-2xl shadow-indigo-900/20"
      >
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-white/10 rounded-full blur-3xl mix-blend-overlay"></div>
        <div className="absolute bottom-0 right-40 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl mix-blend-overlay"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="text-white lg:w-2/3">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight"
            >
              Welcome back, {userName}!
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-indigo-100 text-lg md:text-xl max-w-2xl leading-relaxed"
            >
              You have <span className="font-bold text-white bg-white/20 px-2 py-0.5 rounded-lg shadow-sm backdrop-blur-sm">3 live tests</span> scheduled for today. 
              Class average has improved by <span className="text-emerald-300 font-bold">4.5%</span> this week. Keep up the great work!
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-3 sm:gap-4 mt-6 sm:mt-8 w-full sm:w-auto"
            >
              <Link href="/teacher/dashboard/tests/live" className="flex justify-center bg-white text-indigo-900 hover:bg-indigo-50 px-1 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-bold text-[10px] sm:text-base transition-transform hover:scale-105 active:scale-95 items-center gap-1 sm:gap-2 shadow-lg shadow-white/10 whitespace-nowrap">
                <PlusCircle size={14} className="sm:w-5 sm:h-5 shrink-0" /> <span className="truncate">Create Live Test</span>
              </Link>
              <Link href="/teacher/dashboard/live-monitoring" className="flex justify-center bg-indigo-700/50 hover:bg-indigo-700 border border-indigo-400/30 text-white px-1 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-bold text-[10px] sm:text-base transition-transform hover:scale-105 active:scale-95 backdrop-blur-sm items-center gap-1 sm:gap-2 whitespace-nowrap">
                <Activity size={14} className="sm:w-5 sm:h-5 shrink-0" /> <span className="truncate">Monitoring</span>
              </Link>
            </motion.div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: 0.5, duration: 0.7, type: "spring" }}
            className="hidden lg:block relative w-64 h-64"
          >
            {/* Rocket Illustration */}
            <motion.img 
              src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Rocket.png" 
              alt="Rocket 3D"
              animate={{ y: [-10, 10, -10] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="w-full h-full object-contain drop-shadow-2xl z-20 relative"
            />
          </motion.div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (Stats & Upcoming) - Takes 8 cols */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-8 space-y-8"
        >
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-6">
            {stats.map((stat, idx) => (
              <motion.div 
                variants={itemVariants}
                whileHover={{ y: -5, scale: 1.02 }}
                key={idx} 
                className="bg-white p-3 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg hover:shadow-indigo-500/5 transition-all group relative overflow-hidden flex flex-col justify-between"
              >
                <div className={`absolute -right-4 -top-4 w-16 h-16 sm:w-24 sm:h-24 ${stat.hoverBg} rounded-full group-hover:scale-[2] transition-transform duration-700 ease-out z-0`}></div>
                <div className="relative z-10 flex flex-col h-full">
                  <motion.div 
                    whileHover={{ rotate: 10 }}
                    className={`w-8 h-8 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl ${stat.iconBg} ${stat.iconColor} flex items-center justify-center mb-2 sm:mb-6 shrink-0`}
                  >
                    <stat.icon size={16} className="sm:w-6 sm:h-6" />
                  </motion.div>
                  <div className="mt-auto">
                    <h3 className="text-lg sm:text-4xl font-extrabold text-slate-900 mb-0.5 sm:mb-1">{stat.value}</h3>
                    <p className="text-slate-500 font-bold text-[10px] sm:text-sm leading-tight mb-1 sm:mb-2 line-clamp-2">{stat.title}</p>
                    <p className="text-emerald-500 font-bold text-[10px] sm:text-sm flex items-center gap-0.5 sm:gap-1 bg-emerald-50 px-1 sm:px-2 py-0.5 sm:py-1 rounded-md w-fit">
                      <TrendingUp size={10} className="sm:w-3.5 sm:h-3.5" /> {stat.trend}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Upcoming Tests / Agenda */}
          <motion.div variants={itemVariants} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 md:p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="text-indigo-500" /> Upcoming Agenda
              </h2>
              <Link href="/teacher/dashboard/tests/mock" className="text-indigo-600 font-bold text-sm hover:underline hover:text-indigo-800 transition-colors">View Tests</Link>
            </div>
            <div className="p-6 md:p-8 space-y-6">
              {upcomingTests.map((test, idx) => (
                <motion.div 
                  whileHover={{ x: 5, scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  key={idx} 
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-100 bg-white hover:border-indigo-200 hover:shadow-md transition-all group cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-bold shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                      <Clock size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">{test.title}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 font-medium">
                        <span className="flex items-center gap-1"><Calendar size={14} /> {test.date}</span>
                        <span className="flex items-center gap-1"><Users size={14} /> {test.candidates} Enrolled</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-2 sm:mt-0">
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                      test.status === 'Starting Soon' ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse' : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}>
                      {test.status}
                    </span>
                    <button className="p-2 text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 rounded-lg transition-colors hidden sm:block">
                      <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

        </motion.div>

        {/* Right Column (Recent Activity & Quick Actions) - Takes 4 cols */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-4 space-y-8"
        >
          
          {/* Quick Upload Action */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -5 }}
            className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-6 text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden group"
          >
            <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-white/20 transition-colors duration-500"></div>
            <motion.div 
              animate={{ y: [0, -5, 0] }} 
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            >
              <UploadCloud size={32} className="mb-4 text-white/90" />
            </motion.div>
            <h3 className="text-xl font-bold mb-2 relative z-10">Upload Material</h3>
            <p className="text-emerald-50 text-sm mb-6 leading-relaxed relative z-10">Share PDFs, notes, and video links with your students instantly.</p>
            <Link href="/teacher/dashboard/materials" className="inline-flex items-center justify-center w-full bg-white text-emerald-700 font-bold py-3 rounded-xl hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all gap-2 group-hover:scale-[1.02] relative z-10">
              Upload Now <ArrowRight size={18} />
            </Link>
          </motion.div>

          {/* Vertical Timeline Activity */}
          <motion.div variants={itemVariants} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Bell className="text-indigo-500" /> Recent Activity
              </h2>
            </div>
            
            <motion.div 
              variants={containerVariants} 
              className="space-y-6"
            >
              {recentActivity.map((activity, idx) => (
                <motion.div 
                  variants={itemVariants}
                  whileHover={{ scale: 1.03, x: 5 }}
                  whileTap={{ scale: 0.95 }}
                  key={idx} 
                  className="flex gap-4 group cursor-pointer relative"
                >
                  <div className="flex flex-col items-center">
                    <motion.div 
                      whileHover={{ scale: 1.2, rotate: 10 }}
                      className={`w-12 h-12 rounded-full font-bold text-sm flex items-center justify-center shrink-0 border-4 border-white shadow-md z-10 transition-all duration-500 ${
                        activity.type === 'success' ? 'bg-emerald-100 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white group-hover:shadow-[0_0_20px_rgba(16,185,129,0.5)]' :
                        activity.type === 'warning' ? 'bg-amber-100 text-amber-600 group-hover:bg-amber-500 group-hover:text-white group-hover:shadow-[0_0_20px_rgba(245,158,11,0.5)]' :
                        'bg-indigo-100 text-indigo-600 group-hover:bg-indigo-500 group-hover:text-white group-hover:shadow-[0_0_20px_rgba(99,102,241,0.5)]'
                      }`}
                    >
                      {activity.avatar}
                    </motion.div>
                    {idx !== recentActivity.length - 1 && (
                      <div className="w-0.5 h-full bg-slate-100 mt-2 group-hover:bg-gradient-to-b group-hover:from-indigo-400 group-hover:to-transparent transition-all duration-500"></div>
                    )}
                  </div>
                  <div className="pb-4 w-full">
                    <div className={`p-5 rounded-2xl border transition-all duration-500 relative overflow-hidden backdrop-blur-sm shadow-sm ${
                      activity.type === 'success' ? 'bg-slate-50 border-slate-100 group-hover:border-emerald-300 group-hover:bg-emerald-500 group-hover:shadow-xl group-hover:shadow-emerald-500/20' :
                      activity.type === 'warning' ? 'bg-slate-50 border-slate-100 group-hover:border-amber-300 group-hover:bg-amber-500 group-hover:shadow-xl group-hover:shadow-amber-500/20' :
                      'bg-slate-50 border-slate-100 group-hover:border-indigo-300 group-hover:bg-indigo-600 group-hover:shadow-xl group-hover:shadow-indigo-600/20'
                    }`}>
                      {/* Glow effect in background */}
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out"></div>
                      
                      <p className="text-sm text-slate-700 leading-snug group-hover:text-white transition-colors duration-300 relative z-10">
                        <strong className="text-slate-900 group-hover:text-white transition-colors text-base drop-shadow-sm">{activity.user}</strong> {activity.action} 
                        <strong className={`px-2 py-0.5 rounded ml-1 transition-colors shadow-sm ${
                          activity.type === 'success' ? 'text-emerald-700 bg-emerald-100 group-hover:text-emerald-900 group-hover:bg-white/90' :
                          activity.type === 'warning' ? 'text-amber-700 bg-amber-100 group-hover:text-amber-900 group-hover:bg-white/90' :
                          'text-indigo-700 bg-indigo-100 group-hover:text-indigo-900 group-hover:bg-white/90'
                        }`}>
                          {activity.target}
                        </strong>
                      </p>
                      <span className="text-xs text-slate-400 font-medium mt-3 flex items-center gap-1 group-hover:text-white/80 transition-colors duration-300 relative z-10">
                        <Clock size={14} className="group-hover:animate-pulse" /> {activity.time}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
            
            <Link
              href="/teacher/dashboard"
              className="block text-center w-full mt-2 py-3 border-2 border-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-100 transition-colors shadow-sm"
            >
              Refresh Logs
            </Link>
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
}

