'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Navbar from '@/components/Navbar'
import { supabase } from '@/utils/supabase'

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<'teachers' | 'students'>('teachers')
  const [selectedMobilePlan, setSelectedMobilePlan] = useState<'student' | 'pro' | 'enterprise'>('pro')
  const [avgRating, setAvgRating] = useState('4.8')
  const [totalRatings, setTotalRatings] = useState(0)
  const [recentFeedbacks, setRecentFeedbacks] = useState<any[]>([])

  // Redirect logged in users to their respective dashboards
  useEffect(() => {
    const checkUserAndRedirect = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data } = await supabase.from('profiles').select('role').eq('id', session.user.id).maybeSingle();
        if (data?.role === 'teacher') {
          window.location.href = '/teacher/dashboard';
        } else if (data?.role === 'student') {
          window.location.href = '/student/dashboard';
        }
      }
    };
    checkUserAndRedirect();
  }, []);

  useEffect(() => {
    const handleSwitchTab = (e: any) => {
      if (e.detail?.role) {
        setActiveTab(e.detail.role)
      }
    }
    window.addEventListener('switchHowItWorksTab', handleSwitchTab)
    
    // Fetch average rating & testimonials
    const fetchData = async () => {
      try {
        // Fetch all ratings for average
        const { data: ratingData, error: ratingError } = await supabase.from('feedback').select('rating');
        if (!ratingError && ratingData && ratingData.length > 0) {
          const sum = ratingData.reduce((acc, curr) => acc + curr.rating, 0);
          const avg = (sum / ratingData.length).toFixed(1);
          setAvgRating(avg);
          setTotalRatings(ratingData.length);
        }

        // Fetch recent 3 feedbacks with comments
        const { data: feedbackData, error: feedbackError } = await supabase
          .from('feedback')
          .select('rating, comment, role, created_at')
          .not('comment', 'eq', '')
          .order('created_at', { ascending: false })
          .limit(3);
          
        if (!feedbackError && feedbackData && feedbackData.length > 0) {
          setRecentFeedbacks(feedbackData);
        }
      } catch (err) {
        console.error('Failed to fetch data', err);
      }
    };
    fetchData();

    return () => window.removeEventListener('switchHowItWorksTab', handleSwitchTab)
  }, [])

  const triggerExploreTests = (e: React.MouseEvent) => {
    e.preventDefault()
    window.dispatchEvent(new CustomEvent('openTestsDropdown'))
  }

  const scrollToContact = (e: React.MouseEvent) => {
    e.preventDefault()
    const el = document.getElementById('contact')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  const tickerStats = [
    { 
      label: 'Total Users', 
      value: '10K+', 
      color: 'text-violet-600', 
      bg: 'bg-violet-50 text-violet-600 border-violet-100', 
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) 
    },
    { 
      label: 'Total Students', 
      value: '8K+', 
      color: 'text-sky-600', 
      bg: 'bg-sky-50 text-sky-600 border-sky-100', 
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
        </svg>
      ) 
    },
    { 
      label: 'Total Teachers', 
      value: '500+', 
      color: 'text-teal-600', 
      bg: 'bg-teal-50 text-teal-600 border-teal-100', 
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ) 
    },
    { 
      label: 'Live Tests Taken', 
      value: '25K+', 
      color: 'text-rose-600', 
      bg: 'bg-rose-50 text-rose-600 border-rose-100', 
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ) 
    },
    { 
      label: 'Platform Rating', 
      value: `${avgRating} / 5`, 
      sub: totalRatings > 0 ? `(${totalRatings} reviews)` : '4.8 ★',
      color: 'text-amber-500', 
      bg: 'bg-amber-50 text-amber-500 border-amber-100', 
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ) 
    }
  ]

  const workflowSteps = [
    { num: '01', title: 'Trainer Creates an Exam', desc: 'Define assessment duration, marks, and rules.', color: 'text-violet-500', bgGlow: 'group-hover/card:bg-violet-50', border: 'hover:border-violet-500/50', glow: 'rgba(139, 92, 246, 0.15)', icon: 'M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { num: '02', title: 'Trainer Adds Questions', desc: 'Build your question bank and add questions.', color: 'text-sky-500', bgGlow: 'group-hover/card:bg-sky-50', border: 'hover:border-sky-500/50', glow: 'rgba(14, 165, 233, 0.15)', icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { num: '03', title: 'Trainer Gives Student Permission', desc: 'Approve access so selected students can start.', color: 'text-teal-500', bgGlow: 'group-hover/card:bg-teal-50', border: 'hover:border-teal-500/50', glow: 'rgba(20, 184, 166, 0.15)', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { num: '04', title: 'Student Logs In', desc: 'Register or log in to your TestWise account.', color: 'text-emerald-500', bgGlow: 'group-hover/card:bg-emerald-50', border: 'hover:border-emerald-500/50', glow: 'rgba(16, 185, 129, 0.15)', icon: 'M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1' },
    { num: '05', title: 'Student Takes the Exam', desc: 'Read the instructions and begin your test.', color: 'text-amber-500', bgGlow: 'group-hover/card:bg-amber-50', border: 'hover:border-amber-500/50', glow: 'rgba(245, 158, 11, 0.15)', icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z' },
    { num: '06', title: 'Anti-Cheat Monitoring', desc: 'Follow rules while browser activity is monitored.', color: 'text-orange-500', bgGlow: 'group-hover/card:bg-orange-50', border: 'hover:border-orange-500/50', glow: 'rgba(249, 115, 22, 0.15)', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' },
    { num: '07', title: 'Exam is Submitted', desc: 'Complete it or have it automatically submitted.', color: 'text-rose-500', bgGlow: 'group-hover/card:bg-rose-50', border: 'hover:border-rose-500/50', glow: 'rgba(244, 63, 94, 0.15)', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { num: '08', title: 'Results are Generated', desc: 'View scores, accuracy, and performance insights.', color: 'text-fuchsia-500', bgGlow: 'group-hover/card:bg-fuchsia-50', border: 'hover:border-fuchsia-500/50', glow: 'rgba(217, 70, 239, 0.15)', icon: 'M13 10V3L4 14h7v7l9-11h-7z' }
  ]

  return (
    <div className="min-h-screen bg-[#F8F7F2] font-sans text-slate-900 selection:bg-violet-200 selection:text-violet-900 overflow-x-hidden">
      <Navbar />

      {/* ==================================================
          2. HERO SECTION
      ================================================== */}
      <section className="relative pt-24 pb-5 sm:pt-36 sm:pb-20 lg:pt-36 lg:pb-20 overflow-hidden border-b border-slate-200">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full z-0 pointer-events-none">
          {/* Vibrant glowing background blobs */}
          <div className="absolute top-[-20%] left-1/4 w-[500px] h-[500px] bg-violet-400/20 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-sky-400/20 rounded-full blur-[120px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="text-left">
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-white border border-slate-200 shadow-sm mb-3 sm:mb-6 backdrop-blur-md">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-violet-500 animate-pulse"></div>
                <span className="text-[10px] sm:text-xs font-bold text-violet-600 tracking-widest uppercase">Smart Online Assessments</span>
              </div>
              
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight mb-2.5 sm:mb-6 leading-tight sm:leading-[1.15]">
                Test Smarter.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-sky-500">Perform Better.</span>
              </h1>
              
              <p className="mt-2 sm:mt-4 text-xs sm:text-lg lg:text-xl text-slate-600 mb-4 sm:mb-8 leading-relaxed max-w-lg font-light line-clamp-2 sm:line-clamp-none">
                A modern assessment platform connecting trainers and students through practice, mock tests and secure live assessments.
              </p>
              
              <div className="flex flex-row gap-2.5 sm:gap-4 mb-2 sm:mb-0">
                <Link href="/register" className="px-5 py-2.5 sm:px-8 sm:py-4 bg-violet-600 text-white font-bold rounded-xl shadow-[0_4px_15px_rgba(124,58,237,0.3)] hover:bg-violet-700 transition-all transform hover:-translate-y-0.5 text-xs sm:text-lg text-center">
                  Get Started
                </Link>
                <button onClick={triggerExploreTests} className="px-5 py-2.5 sm:px-8 sm:py-4 bg-white text-slate-900 font-bold rounded-xl border border-slate-200 hover:bg-slate-50 shadow-sm transition-all text-xs sm:text-lg text-center backdrop-blur-md">
                  Explore Tests
                </button>
              </div>
            </div>

            {/* Right Visual - High-End SaaS Product Showcase */}
            <div className="relative mt-2 sm:mt-8 lg:mt-0 lg:pl-6">
              <div className="relative rounded-xl sm:rounded-3xl border border-slate-200 bg-white shadow-lg sm:shadow-2xl p-1.5 sm:p-2 z-10 transform lg:rotate-1 hover:rotate-0 transition-transform duration-500 overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/10 to-sky-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20 pointer-events-none rounded-xl sm:rounded-3xl" />
                <img 
                  src="/hero-vibrant.jpg" 
                  alt="TestWise Assessment Platform Dashboard" 
                  className="w-full max-h-48 sm:max-h-80 lg:max-h-none rounded-lg sm:rounded-2xl shadow-sm object-cover relative z-10"
                />
                
                {/* Floating Elements (Hidden on mobile to preserve cohesive screen fit) */}
                <div className="hidden sm:flex absolute -bottom-4 -left-4 sm:-bottom-5 sm:-left-5 bg-white border border-slate-200 p-3 sm:p-4 rounded-xl shadow-xl items-center gap-3.5 animate-bounce z-30" style={{animationDuration: '4s'}}>
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs text-slate-500 font-medium">Exam Submitted</p>
                    <p className="text-xs sm:text-sm font-bold text-slate-900">Alex M. finished</p>
                  </div>
                </div>

                <div className="hidden sm:flex absolute -top-4 -right-4 sm:-top-5 sm:-right-5 bg-white border border-slate-200 p-2.5 sm:p-3 rounded-xl shadow-xl items-center gap-2.5 sm:gap-3 animate-pulse z-30">
                  <div className="w-2 h-2 rounded-full bg-violet-500"></div>
                  <p className="text-[11px] sm:text-xs font-bold text-slate-900">AI Monitor Active</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          3. HERO STATISTICS STRIP (MOVING ANIMATED TICKER)
      ================================================== */}
      <section className="bg-white/95 backdrop-blur-md border-b border-slate-200 py-4 sm:py-5 z-20 shadow-sm relative overflow-hidden group">
        {/* Soft edge gradient fades */}
        <div className="pointer-events-none absolute left-0 top-0 h-full w-12 sm:w-24 bg-gradient-to-r from-white via-white/80 to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 h-full w-12 sm:w-24 bg-gradient-to-l from-white via-white/80 to-transparent z-10" />

        <div className="flex overflow-hidden select-none">
          <div className="animate-ticker-marquee flex shrink-0 items-center">
            {/* Cycle 1: Starts cleanly with Total Users -> Ends at Partner Institutes */}
            <div className="flex items-center gap-4 sm:gap-6 shrink-0">
              {tickerStats.map((item, idx) => (
                <div
                  key={`c1-${idx}`}
                  className="flex items-center gap-3 px-4 py-2 sm:px-5 sm:py-2.5 bg-[#F8F7F2] hover:bg-white rounded-2xl border border-slate-200 shadow-[0_1px_4px_rgba(0,0,0,0.03)] hover:shadow-md transition-all shrink-0 hover:scale-[1.03] cursor-default"
                >
                  <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl border flex items-center justify-center shrink-0 ${item.bg}`}>
                    {item.icon}
                  </div>
                  <div className="text-left">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">{item.value}</span>
                      {item.sub && <span className="text-[10px] sm:text-xs font-semibold text-slate-400">{item.sub}</span>}
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block whitespace-nowrap">{item.label}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Generous 15-20 Second Gap between end of loop 1 and start of loop 2 */}
            <div className="flex items-center gap-4 px-12 sm:px-24 min-w-[700px] sm:min-w-[950px] justify-center shrink-0 select-none">
              <span className="w-14 sm:w-24 h-[1.5px] bg-slate-300"></span>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                TestWise Real-Time Platform Stats
              </span>
              <span className="w-14 sm:w-24 h-[1.5px] bg-slate-300"></span>
            </div>

            {/* Cycle 2: Exact duplicate for smooth infinite loop starting with Total Users */}
            <div className="flex items-center gap-4 sm:gap-6 shrink-0">
              {tickerStats.map((item, idx) => (
                <div
                  key={`c2-${idx}`}
                  className="flex items-center gap-3 px-4 py-2 sm:px-5 sm:py-2.5 bg-[#F8F7F2] hover:bg-white rounded-2xl border border-slate-200 shadow-[0_1px_4px_rgba(0,0,0,0.03)] hover:shadow-md transition-all shrink-0 hover:scale-[1.03] cursor-default"
                >
                  <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl border flex items-center justify-center shrink-0 ${item.bg}`}>
                    {item.icon}
                  </div>
                  <div className="text-left">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">{item.value}</span>
                      {item.sub && <span className="text-[10px] sm:text-xs font-semibold text-slate-400">{item.sub}</span>}
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block whitespace-nowrap">{item.label}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Generous 15-20 Second Gap between end of loop 2 and start of loop 1 */}
            <div className="flex items-center gap-4 px-12 sm:px-24 min-w-[700px] sm:min-w-[950px] justify-center shrink-0 select-none">
              <span className="w-14 sm:w-24 h-[1.5px] bg-slate-300"></span>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                TestWise Real-Time Platform Stats
              </span>
              <span className="w-14 sm:w-24 h-[1.5px] bg-slate-300"></span>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          4. HOW TESTWISE WORKS
      ================================================== */}
      <section id="how-it-works" className="py-12 sm:py-24 bg-[#F8F7F2] relative overflow-hidden border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center mb-6 sm:mb-10 transition-all duration-500">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-[#17221B] mb-2 sm:mb-6 tracking-tight">
              How TestWise Works
            </h2>
            <p className="text-xs sm:text-lg text-[#68736C] max-w-2xl mx-auto">
              A seamless assessment workflow tailored to your role.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-6 sm:mb-16">
            <div className="inline-flex bg-white rounded-full p-1 border border-[#DDE3DD] shadow-sm">
              <button 
                onClick={() => setActiveTab('teachers')}
                className={`px-5 py-2 sm:px-8 sm:py-3 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 ${
                  activeTab === 'teachers' 
                    ? 'bg-teal-500 text-white shadow-md' 
                    : 'text-[#68736C] hover:text-[#17221B] hover:bg-slate-50'
                }`}
              >
                For Teachers
              </button>
              <button 
                onClick={() => setActiveTab('students')}
                className={`px-5 py-2 sm:px-8 sm:py-3 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 ${
                  activeTab === 'students' 
                    ? 'bg-violet-500 text-white shadow-md' 
                    : 'text-[#68736C] hover:text-[#17221B] hover:bg-slate-50'
                }`}
              >
                For Students
              </button>
            </div>
          </div>

          {/* Timeline Wrapper - 2x2 Grid on Mobile, 4 Columns on Desktop */}
          <div className="relative max-w-6xl mx-auto animate-fade-in-up">
            
            {/* Horizontal Connecting SVG Path (Desktop only) */}
            <div className="hidden lg:block absolute top-[5.5rem] left-[12.5%] right-[12.5%] z-0 opacity-30 pointer-events-none">
              <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-[#68736C] to-transparent"></div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8 group/timeline">
              {(activeTab === 'teachers' 
                ? [workflowSteps[0], workflowSteps[1], workflowSteps[2], { ...workflowSteps[7], num: '04' }] 
                : [{ ...workflowSteps[3], num: '01' }, { ...workflowSteps[4], num: '02' }, { ...workflowSteps[5], num: '03' }, { ...workflowSteps[6], num: '04' }]
              ).map((step, idx) => {
                return (
                  <div key={idx} 
                    className={`group/card relative z-10 bg-white p-3.5 sm:p-6 rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:!opacity-100 hover:-translate-y-2 hover:scale-[1.03] ${step.border} cursor-default flex flex-col items-start overflow-hidden`}
                    style={{ '--hover-shadow': `0 20px 40px -10px ${step.glow}` } as React.CSSProperties}
                    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = e.currentTarget.style.getPropertyValue('--hover-shadow') }}
                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow)' }}
                  >
                    <div className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 ease-out pointer-events-none" style={{ background: `radial-gradient(circle at top right, ${step.glow}, transparent 70%)` }}></div>
                    
                    <div className={`w-full flex items-center justify-between mb-2.5 sm:mb-5 relative z-10`}>
                      <div className={`w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-slate-50 flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover/card:scale-110 group-hover/card:-translate-y-1 ${step.color} ${step.bgGlow}`}>
                        <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={step.icon}></path>
                        </svg>
                      </div>
                      <span className={`text-xl sm:text-3xl font-black ${step.color} opacity-25 sm:opacity-20 transition-all duration-300 group-hover/card:opacity-100 group-hover/card:scale-110`}>{step.num}</span>
                    </div>
                    
                    <div className="relative z-10 transform transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover/card:translate-x-1 w-full">
                      <h3 className="text-xs sm:text-lg font-bold text-slate-900 opacity-90 group-hover/card:opacity-100 transition-all duration-300 leading-tight mb-1 sm:mb-2">{step.title}</h3>
                      <p className="text-[10px] sm:text-sm text-slate-600 opacity-80 group-hover/card:opacity-100 transition-all duration-300 leading-snug sm:leading-relaxed line-clamp-2 sm:line-clamp-none">{step.desc}</p>
                    </div>

                    <div className={`absolute bottom-6 right-6 opacity-0 -translate-x-2 transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover/card:opacity-100 group-hover/card:translate-x-0 ${step.color} hidden lg:block`}>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          5. ASSESSMENT TYPES
      ================================================== */}
      <section className="py-12 sm:py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 mb-2 sm:mb-4 tracking-tight">Choose Your Test</h2>
            <p className="text-xs sm:text-lg text-slate-600 max-w-xl mx-auto">TestWise offers flexible assessment formats tailored for practice, preparation, and professional evaluation.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-8">
            {/* Practice Test - Violet */}
            <div className="group relative bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:border-violet-500 transition-all duration-300 hover:scale-[1.02] md:hover:scale-[1.04] overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-violet-100 rounded-bl-full transition-transform duration-300 group-hover:scale-150"></div>
              <div className="flex flex-row md:flex-col items-center md:items-start gap-4 md:gap-0 relative z-10">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-50 text-slate-500 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 md:mb-8 group-hover:bg-violet-600 group-hover:text-white transition-colors duration-300">
                  <svg className="w-6 h-6 md:w-8 md:h-8 transform transition-transform duration-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                </div>
                <div className="flex-1 md:w-full">
                  <h3 className="text-base sm:text-2xl font-bold mb-0.5 md:mb-3 text-slate-900 group-hover:text-violet-600 transition-colors">Practice Test</h3>
                  <p className="text-xs sm:text-base text-slate-600 mb-1.5 md:mb-8 leading-snug md:leading-relaxed line-clamp-1 md:line-clamp-none">Build skills through flexible practice. Learn at your own pace.</p>
                  <button onClick={triggerExploreTests} className="inline-flex items-center text-xs sm:text-sm font-bold text-violet-600 hover:text-violet-700 group-hover:translate-x-1 transition-transform">
                    Start Practice <svg className="w-3.5 h-3.5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Mock Test - Sky */}
            <div className="group relative bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:border-sky-500 transition-all duration-300 hover:scale-[1.02] md:hover:scale-[1.04] overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-sky-100 rounded-bl-full transition-transform duration-300 group-hover:scale-150"></div>
              <div className="flex flex-row md:flex-col items-center md:items-start gap-4 md:gap-0 relative z-10">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-50 text-slate-500 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 md:mb-8 group-hover:bg-sky-500 group-hover:text-white transition-colors duration-300">
                  <svg className="w-6 h-6 md:w-8 md:h-8 transform transition-transform duration-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <div className="flex-1 md:w-full">
                  <h3 className="text-base sm:text-2xl font-bold mb-0.5 md:mb-3 text-slate-900 group-hover:text-sky-500 transition-colors">Mock Test</h3>
                  <p className="text-xs sm:text-base text-slate-600 mb-1.5 md:mb-8 leading-snug md:leading-relaxed line-clamp-1 md:line-clamp-none">Experience full exam-style assessments to gauge your real readiness.</p>
                  <button onClick={triggerExploreTests} className="inline-flex items-center text-xs sm:text-sm font-bold text-sky-500 hover:text-sky-600 group-hover:translate-x-1 transition-transform">
                    Take Mock Test <svg className="w-3.5 h-3.5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Live Test - Teal */}
            <div className="group relative bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:border-teal-500 transition-all duration-300 hover:scale-[1.02] md:hover:scale-[1.04] overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-teal-100 rounded-bl-full transition-transform duration-300 group-hover:scale-150"></div>
              <div className="flex flex-row md:flex-col items-center md:items-start gap-4 md:gap-0 relative z-10">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-50 text-slate-500 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 md:mb-8 group-hover:bg-teal-500 group-hover:text-white transition-colors duration-300">
                  <svg className="w-6 h-6 md:w-8 md:h-8 transform transition-transform duration-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <div className="flex-1 md:w-full">
                  <h3 className="text-base sm:text-2xl font-bold mb-0.5 md:mb-3 text-slate-900 group-hover:text-teal-500 transition-colors">Live Test</h3>
                  <p className="text-xs sm:text-base text-slate-600 mb-1.5 md:mb-8 leading-snug md:leading-relaxed line-clamp-1 md:line-clamp-none">Take part in real-time proctored exams scheduled by your trainer.</p>
                  <button onClick={triggerExploreTests} className="inline-flex items-center text-xs sm:text-sm font-bold text-teal-500 hover:text-teal-600 group-hover:translate-x-1 transition-transform">
                    Join Live Test <svg className="w-3.5 h-3.5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          6. STUDENT EXPERIENCE
      ================================================== */}
      <section id="student-exp" className="py-12 sm:py-24 bg-[#F8F7F2] text-slate-900 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-3 sm:gap-8 lg:gap-16 items-center">
            
            {/* Left Content (Text & Bullets) */}
            <div className="order-1">
              <h2 className="text-xl sm:text-3xl lg:text-5xl font-extrabold tracking-tight mb-2 sm:mb-6 text-slate-900">Built for Students</h2>
              <p className="text-xs sm:text-base lg:text-lg text-slate-600 mb-3 sm:mb-8 leading-snug sm:leading-relaxed line-clamp-3 sm:line-clamp-none">
                Experience a clean, focused exam environment. Practice anytime, take assigned tests securely, and track your performance trends.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-4">
                {['Practice anytime', 'Take assigned tests', 'Track performance', 'View detailed results'].map((item, i) => (
                  <div key={i} className="flex items-center gap-1.5 sm:gap-3">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center shrink-0">
                      <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <span className="text-[10px] sm:text-base text-slate-900 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Visual (Side-by-side on mobile & desktop) */}
            <div className="order-2 relative">
              <div className="absolute inset-0 bg-violet-200 rounded-2xl sm:rounded-3xl transform -rotate-2 scale-105"></div>
              <div className="relative bg-white rounded-xl sm:rounded-2xl shadow-md sm:shadow-xl border border-slate-200 overflow-hidden p-2 sm:p-6">
                <div className="bg-slate-50 p-2 sm:p-4 rounded-lg flex items-center justify-between border-b border-slate-200 mb-2 sm:mb-4">
                  <div className="text-slate-900 font-bold text-xs sm:text-sm flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-violet-500"></div> Student Dashboard</div>
                  <div className="text-[10px] sm:text-xs text-slate-500">Alex M.</div>
                </div>
                <div className="space-y-2 sm:space-y-4">
                  <div className="p-2 sm:p-4 bg-slate-50 rounded-lg sm:rounded-xl border border-slate-200">
                    <p className="text-[8px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider">Live Exam</p>
                    <p className="font-bold text-xs sm:text-base text-slate-900 truncate">Advanced Aptitude</p>
                    <p className="text-[9px] sm:text-xs text-violet-600 font-bold mt-0.5">Today 2:00 PM</p>
                  </div>
                  <div className="p-2 sm:p-4 bg-violet-50/60 rounded-lg sm:rounded-xl border border-violet-100 flex justify-between items-center">
                    <span className="text-[9px] sm:text-xs font-bold text-slate-700">Mock Score</span>
                    <span className="text-xs sm:text-xl font-black text-violet-600">845 / 900</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ==================================================
          7. TRAINER EXPERIENCE
      ================================================== */}
      <section id="trainer-exp" className="py-12 sm:py-24 bg-white text-slate-900 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-3 sm:gap-8 lg:gap-16 items-center">
            
            {/* Left Content */}
            <div>
              <h2 className="text-xl sm:text-3xl lg:text-5xl font-extrabold tracking-tight mb-2 sm:mb-6">Tools for Trainers</h2>
              <p className="text-xs sm:text-base lg:text-lg text-slate-600 mb-3 sm:mb-10 leading-snug sm:leading-relaxed line-clamp-3 sm:line-clamp-none">
                Take complete control. Manage question banks, schedule batches, and securely monitor student attempts in real time.
              </p>
              
              <div className="hidden sm:flex flex-wrap items-center gap-3 mb-8">
                <span className="font-black text-slate-900 tracking-wider text-xs">CREATE</span>
                <svg className="w-3.5 h-3.5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                <span className="font-black text-slate-900 tracking-wider text-xs">ASSIGN</span>
                <svg className="w-3.5 h-3.5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                <span className="font-black text-teal-600 tracking-wider text-xs">ANALYZE</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 sm:gap-y-3 gap-x-4">
                {['Create exams', 'Add questions', 'Manage batches', 'Monitor attempts'].map((item, i) => (
                  <div key={i} className="flex items-center gap-1.5 sm:gap-3 text-slate-900 font-medium text-[10px] sm:text-base">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0"></div>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Visual (Mockup Card side-by-side) */}
            <div className="relative">
              <div className="absolute inset-0 bg-teal-200 rounded-2xl sm:rounded-3xl transform rotate-2 scale-105"></div>
              <div className="relative bg-white rounded-xl sm:rounded-2xl shadow-md sm:shadow-xl border border-slate-200 p-2.5 sm:p-6 overflow-hidden">
                <div className="flex justify-between items-center mb-2.5 sm:mb-6 border-b border-slate-100 pb-2 sm:pb-4">
                  <h4 className="font-bold flex items-center gap-1.5 text-slate-900 text-xs sm:text-base">
                    <svg className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg> 
                    Control Center
                  </h4>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div className="p-2 sm:p-4 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl">
                    <p className="text-[8px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider">Students</p>
                    <p className="text-base sm:text-2xl font-black text-slate-900">145</p>
                  </div>
                  <div className="p-2 sm:p-4 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl">
                    <p className="text-[8px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active</p>
                    <p className="text-base sm:text-2xl font-black text-teal-600">3 Tests</p>
                  </div>
                  <div className="p-2 sm:p-4 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl">
                    <p className="text-[8px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider">Questions</p>
                    <p className="text-base sm:text-2xl font-black text-slate-900">1,250</p>
                  </div>
                  <div className="p-2 sm:p-4 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl">
                    <p className="text-[8px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider">Approved</p>
                    <p className="text-base sm:text-2xl font-black text-sky-500">100%</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ==================================================
          8. SECURE ASSESSMENTS
      ================================================== */}
      <section className="py-12 sm:py-24 bg-[#F8F7F2] text-slate-900 relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-rose-400/20 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 gap-3 sm:gap-8 lg:gap-16 items-center">
            
            {/* Left Content (Text) */}
            <div className="order-1">
              <h2 className="text-xl sm:text-3xl lg:text-5xl font-extrabold tracking-tight mb-2 sm:mb-6 text-slate-900">Fair Assessments</h2>
              <p className="text-xs sm:text-base lg:text-lg text-slate-600 mb-3 sm:mb-10 leading-snug sm:leading-relaxed line-clamp-3 sm:line-clamp-none">
                TestWise monitors browser activity during assessments and auto-submits exams on cheating detection.
              </p>
              
              <ul className="space-y-1.5 sm:space-y-4">
                {[
                  'Timer Synchronization',
                  'Tab Switch Detection',
                  'Window Focus Guard',
                  'Auto-Submit Rules'
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-1.5 sm:gap-4">
                    <div className="w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0 border border-slate-200">
                      <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <span className="text-[10px] sm:text-base font-medium text-slate-900">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right Visual (Mockup Card side-by-side) */}
            <div className="order-2 relative">
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-md sm:shadow-xl border border-slate-200 p-2.5 sm:p-6 relative overflow-hidden">
                <div className="bg-rose-50/90 border border-rose-200 rounded-lg sm:rounded-xl p-3 sm:p-6 text-center">
                  <div className="w-8 h-8 sm:w-16 sm:h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-4 text-rose-500">
                    <svg className="w-4 h-4 sm:w-8 sm:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  </div>
                  <h4 className="text-xs sm:text-xl font-bold text-slate-900 mb-1">Tab Switched</h4>
                  <p className="text-slate-600 text-[9px] sm:text-sm max-w-sm mx-auto mb-2 sm:mb-4">Recorded browser exit.</p>
                  <span className="inline-block px-3 py-1 bg-rose-500 text-white font-bold rounded-md text-[9px] sm:text-sm">Secure Active</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ==================================================
          9. LEARNING MATERIALS
      ================================================== */}
      <section className="py-10 sm:py-24 bg-white text-slate-900 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2 sm:mb-4">Learn Before You Test</h2>
            <p className="text-xs sm:text-lg text-slate-600 max-w-2xl mx-auto">Access curated resources to prepare effectively for your assessments.</p>
          </div>

          {/* 2x2 grid on mobile, 4 columns on desktop - NO horizontal scroll */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {[
              { title: 'Notes', desc: 'Comprehensive study materials', color: 'from-violet-500 to-fuchsia-500', bg: 'bg-violet-50/50 border-violet-100', shadow: 'hover:shadow-violet-500/25', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
              { title: 'Formulas', desc: 'Quick cheat sheets', color: 'from-sky-500 to-blue-600', bg: 'bg-sky-50/50 border-sky-100', shadow: 'hover:shadow-sky-500/25', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
              { title: 'Videos', desc: 'Expert video tutorials', color: 'from-teal-400 to-emerald-500', bg: 'bg-teal-50/50 border-teal-100', shadow: 'hover:shadow-teal-500/25', icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z' },
              { title: 'Shortcuts', desc: 'Time-saving techniques', color: 'from-amber-400 to-orange-500', bg: 'bg-amber-50/50 border-amber-100', shadow: 'hover:shadow-amber-500/25', icon: 'M13 10V3L4 14h7v7l9-11h-7z' }
            ].map((item, i) => (
              <div key={i} className={`group relative ${item.bg} p-3.5 sm:p-8 rounded-2xl sm:rounded-3xl border shadow-sm transition-all duration-300 hover:shadow-xl ${item.shadow} hover:-translate-y-1.5 cursor-pointer flex flex-col items-center text-center overflow-hidden`}>
                <div className={`absolute top-0 left-0 w-full h-1.5 sm:h-2 bg-gradient-to-r ${item.color} opacity-80 group-hover:opacity-100 transition-opacity`}></div>
                <div className={`absolute -inset-2 bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300 blur-xl pointer-events-none`}></div>
                
                <div className={`w-10 h-10 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center mb-2.5 sm:mb-6 shadow-md transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                  <svg className="w-5 h-5 sm:w-8 sm:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}></path></svg>
                </div>
                <h4 className={`font-extrabold text-sm sm:text-xl text-slate-900 mb-1 sm:mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-slate-900 group-hover:to-slate-700 transition-all`}>{item.title}</h4>
                <p className="text-[11px] sm:text-sm text-slate-600 font-medium leading-tight sm:leading-normal line-clamp-2 sm:line-clamp-none">{item.desc}</p>
                
                <div className="mt-2.5 sm:mt-6 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transform sm:translate-y-2 sm:group-hover:translate-y-0 transition-all duration-300">
                   <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r ${item.color}`}>Explore →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================================================
          10. TESTIMONIALS (SOCIAL PROOF)
      ================================================== */}
      <section className="py-10 sm:py-24 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-16">
            <h2 className="text-2xl sm:text-5xl font-extrabold tracking-tight mb-2 sm:mb-4 text-slate-900">Loved by Institutes & Students</h2>
            <p className="text-xs sm:text-lg text-slate-600 max-w-2xl mx-auto">See how TestWise is transforming online assessments across the country.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-8">
            {[
              ...recentFeedbacks,
              ...[
                { role: 'teacher', comment: "TestWise's AI proctoring is a game-changer. It caught 3 cheating attempts during our mid-terms without any manual supervision required. Highly reliable.", name: 'Srinivas Rao', sub: 'HOD, Engineering College' },
                { role: 'student', comment: "The UI is so clean! Taking mock tests feels exactly like the real competitive exams. The detailed analytics at the end helps me know my weak spots.", name: 'Ananya K.', sub: 'UPSC Aspirant' },
                { role: 'teacher', comment: "Creating question banks and assigning tests used to take hours. With TestWise, I can schedule a batch exam in 5 minutes. The auto-grading saves my weekends.", name: 'Manoj Varma', sub: 'Aptitude Trainer' }
              ]
            ].slice(0, 3).map((fb, idx) => {
              const isTeacher = fb.role === 'teacher';
              const isStudent = fb.role === 'student';
              // Determine colors based on index or role
              const colorClass = idx === 0 ? 'text-violet-500' : idx === 1 ? 'text-sky-500' : 'text-teal-500';
              const bgClass = idx === 0 ? 'bg-violet-200 text-violet-700' : idx === 1 ? 'bg-sky-200 text-sky-700' : 'bg-teal-200 text-teal-700';
              
              // Mock name for dynamically fetched feedback
              const displayName = fb.name || (isTeacher ? 'Institute Trainer' : 'TestWise Student');
              const displaySub = fb.sub || (isTeacher ? 'Verified Educator' : 'Active Learner');
              const initials = displayName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();

              return (
                <div key={idx} className="p-4 sm:p-8 bg-slate-50 rounded-2xl sm:rounded-3xl border border-slate-200 relative flex flex-col justify-between">
                  <div className={`${colorClass} mb-2 sm:mb-4`}>
                    <svg className="w-5 h-5 sm:w-8 sm:h-8 opacity-50" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>
                  </div>
                  <p className="text-xs sm:text-base text-slate-700 italic mb-3 sm:mb-6 flex-1 line-clamp-3 sm:line-clamp-none">"{fb.comment}"</p>
                  <div className="flex items-center gap-2.5 sm:gap-4">
                    <div className={`w-8 h-8 sm:w-12 sm:h-12 ${bgClass} rounded-full flex items-center justify-center font-bold text-xs sm:text-base shrink-0`}>
                      {initials}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-base text-slate-900 leading-tight">{displayName}</h4>
                      <p className="text-[10px] sm:text-xs text-slate-500">{displaySub}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==================================================
          11. PRICING
      ================================================== */}
      <section id="pricing" className="py-10 sm:py-24 bg-[#F8F7F2] border-t border-slate-200 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-16">
            <h2 className="text-2xl sm:text-5xl font-extrabold tracking-tight mb-2 sm:mb-4 text-slate-900">Simple, Transparent Pricing</h2>
            <p className="text-xs sm:text-lg text-slate-600 max-w-2xl mx-auto">Choose the plan that fits your needs. No hidden fees.</p>
          </div>

          {/* Mobile Segmented Switcher (Visible on mobile only - all 3 plans visible without right scroll) */}
          <div className="md:hidden flex items-center p-1 bg-slate-200/90 rounded-2xl mb-4 max-w-sm mx-auto shadow-inner">
            <button
              type="button"
              onClick={() => setSelectedMobilePlan('student')}
              className={`flex-1 py-2 px-1 text-xs font-bold rounded-xl transition-all ${
                selectedMobilePlan === 'student'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🎓 Student
            </button>
            <button
              type="button"
              onClick={() => setSelectedMobilePlan('pro')}
              className={`flex-1 py-2 px-1 text-xs font-bold rounded-xl transition-all relative ${
                selectedMobilePlan === 'pro'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ★ Pro
            </button>
            <button
              type="button"
              onClick={() => setSelectedMobilePlan('enterprise')}
              className={`flex-1 py-2 px-1 text-xs font-bold rounded-xl transition-all ${
                selectedMobilePlan === 'enterprise'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🏢 Enterprise
            </button>
          </div>

          {/* Mobile Active Plan Card (Visible on mobile only) */}
          <div className="md:hidden max-w-sm mx-auto">
            {selectedMobilePlan === 'student' && (
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-slate-900">Student Basic</h3>
                  <span className="text-2xl font-black text-slate-900">Free</span>
                </div>
                <p className="text-slate-500 text-xs mb-4">Perfect for self-preparation and mock tests.</p>
                <ul className="space-y-2 mb-5 text-xs text-slate-700">
                  <li className="flex items-center gap-2"><svg className="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg> Unlimited Practice Tests</li>
                  <li className="flex items-center gap-2"><svg className="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg> Basic Analytics & Review</li>
                  <li className="flex items-center gap-2"><svg className="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg> Take Assigned Live Exams</li>
                </ul>
                <Link href="/register?role=student" className="block text-center w-full py-2.5 bg-slate-100 text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors text-xs">
                  Sign Up Free
                </Link>
              </div>
            )}

            {selectedMobilePlan === 'pro' && (
              <div className="bg-violet-600 p-5 rounded-2xl border border-violet-500 shadow-xl flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-bl-lg">MOST POPULAR</div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-white">Pro Trainer</h3>
                  <div><span className="text-2xl font-black text-white">₹999</span><span className="text-violet-200 text-xs">/mo</span></div>
                </div>
                <p className="text-violet-200 text-xs mb-4">For tutors and small institutes.</p>
                <ul className="space-y-2 mb-5 text-xs text-white">
                  <li className="flex items-center gap-2"><svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg> Create Unlimited Exams</li>
                  <li className="flex items-center gap-2"><svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg> AI Proctoring Included</li>
                  <li className="flex items-center gap-2"><svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg> Up to 500 Students</li>
                  <li className="flex items-center gap-2"><svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg> Advanced Analytics Dashboard</li>
                </ul>
                <Link href="/register?role=teacher" className="block text-center w-full py-2.5 bg-white text-violet-600 font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm text-xs">
                  Start 14-Day Trial
                </Link>
              </div>
            )}

            {selectedMobilePlan === 'enterprise' && (
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-slate-900">Enterprise</h3>
                  <span className="text-2xl font-black text-slate-900">Custom</span>
                </div>
                <p className="text-slate-500 text-xs mb-4">For large colleges & universities.</p>
                <ul className="space-y-2 mb-5 text-xs text-slate-700">
                  <li className="flex items-center gap-2"><svg className="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg> Unlimited Students</li>
                  <li className="flex items-center gap-2"><svg className="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg> Custom Domain & Branding</li>
                  <li className="flex items-center gap-2"><svg className="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg> Dedicated Account Manager</li>
                </ul>
                <Link href="/contact" className="block text-center w-full py-2.5 bg-slate-100 text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors text-xs">
                  Contact Sales
                </Link>
              </div>
            )}
          </div>

          {/* Desktop 3-Card Grid (Hidden on Mobile) */}
          <div className="hidden md:grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Student Plan */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Student Basic</h3>
              <p className="text-slate-500 text-sm mb-6">Perfect for self-preparation.</p>
              <div className="mb-6"><span className="text-4xl font-black text-slate-900">Free</span></div>
              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-center gap-2 text-sm text-slate-700"><svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg> Unlimited Practice Tests</li>
                <li className="flex items-center gap-2 text-sm text-slate-700"><svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg> Basic Analytics</li>
                <li className="flex items-center gap-2 text-sm text-slate-700"><svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg> Take Assigned Live Exams</li>
              </ul>
              <Link href="/register?role=student" className="block text-center w-full py-3 bg-slate-100 text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors">Sign Up Free</Link>
            </div>
            
            {/* Pro Plan */}
            <div className="bg-violet-600 p-8 rounded-3xl border border-violet-500 shadow-xl transform md:-translate-y-4 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">MOST POPULAR</div>
              <h3 className="text-xl font-bold text-white mb-2">Pro Trainer</h3>
              <p className="text-violet-200 text-sm mb-6">For tutors and small institutes.</p>
              <div className="mb-6">
                <span className="text-4xl font-black text-white">₹999</span><span className="text-violet-200">/mo</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-center gap-2 text-sm text-white"><svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg> Create Unlimited Exams</li>
                <li className="flex items-center gap-2 text-sm text-white"><svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg> AI Proctoring Included</li>
                <li className="flex items-center gap-2 text-sm text-white"><svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg> Up to 500 Students</li>
                <li className="flex items-center gap-2 text-sm text-white"><svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg> Advanced Analytics Dashboard</li>
              </ul>
              <Link href="/register?role=teacher" className="block text-center w-full py-3 bg-white text-violet-600 font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm">Start 14-Day Trial</Link>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Enterprise</h3>
              <p className="text-slate-500 text-sm mb-6">For large colleges & universities.</p>
              <div className="mb-6"><span className="text-4xl font-black text-slate-900">Custom</span></div>
              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-center gap-2 text-sm text-slate-700"><svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg> Unlimited Students</li>
                <li className="flex items-center gap-2 text-sm text-slate-700"><svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg> Custom Domain & Branding</li>
                <li className="flex items-center gap-2 text-sm text-slate-700"><svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg> API Access</li>
                <li className="flex items-center gap-2 text-sm text-slate-700"><svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg> Dedicated Account Manager</li>
              </ul>
              <Link href="/contact" className="block text-center w-full py-3 bg-slate-100 text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors">Contact Sales</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          12. CLASSY FOOTER (ABOUT TESTWISE & CONTACT DETAILS)
      ================================================== */}
      <footer id="about" className="bg-slate-950 text-slate-300 pt-10 pb-8 sm:pt-20 sm:pb-12 border-t border-slate-800 relative overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Main Footer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 sm:gap-12 pb-8 sm:pb-16 border-b border-slate-800/80">
            
            {/* Column 1: About TestWise (5 cols) */}
            <div className="lg:col-span-5 space-y-4 sm:space-y-6">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg shadow-violet-500/20">
                  T
                </div>
                <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-white">TestWise</span>
              </div>
              
              <div>
                <h3 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-violet-400 mb-1.5 sm:mb-2">About TestWise</h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  TestWise was founded on the belief that assessments shouldn't just be about grading—they should be a core part of the learning journey. By connecting trainers and students through an intuitive, secure, and AI-enabled ecosystem, we make it effortless to practice, evaluate, and conquer competitive exams.
                </p>
              </div>

              {/* Trust Badges - 3 Column compact grid */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="bg-slate-900 border border-slate-800 px-2 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl text-center">
                  <div className="text-base sm:text-lg font-extrabold text-white">10k+</div>
                  <div className="text-[10px] sm:text-xs text-slate-400 font-medium">Students</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 px-2 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl text-center">
                  <div className="text-base sm:text-lg font-extrabold text-teal-400">500+</div>
                  <div className="text-[10px] sm:text-xs text-slate-400 font-medium">Trainers</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 px-2 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl text-center">
                  <div className="text-base sm:text-lg font-extrabold text-violet-400">99.8%</div>
                  <div className="text-[10px] sm:text-xs text-slate-400 font-medium">Accuracy</div>
                </div>
              </div>
            </div>

            {/* Column 2: Quick Platform Navigation (3 cols) - 2 columns on mobile */}
            <div className="lg:col-span-3 space-y-3 sm:space-y-4">
              <h3 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-200">Quick Navigation</h3>
              <ul className="grid grid-cols-2 gap-2 text-xs sm:text-sm sm:flex sm:flex-col sm:gap-0 sm:space-y-3">
                <li><Link href="/" className="hover:text-violet-400 transition-colors">Home</Link></li>
                <li><Link href="/register" className="hover:text-violet-400 transition-colors">Practice Tests</Link></li>
                <li><Link href="/register" className="hover:text-violet-400 transition-colors">Mock Assessments</Link></li>
                <li><Link href="/register" className="hover:text-violet-400 transition-colors">Live Proctored Exams</Link></li>
                <li><Link href="/materials" className="hover:text-violet-400 transition-colors">Study Materials</Link></li>
                <li><Link href="/login" className="hover:text-violet-400 transition-colors">Portal Login</Link></li>
                <li><Link href="/register" className="hover:text-violet-400 transition-colors">Sign Up for Free</Link></li>
              </ul>
            </div>

            {/* Column 3: Contact Details & Sales (4 cols) */}
            <div id="contact" className="lg:col-span-4 space-y-3 sm:space-y-4 scroll-mt-28">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                Contact & Support
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-white">Get in Touch with Us</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Have questions about enterprise plans, sales onboarding, or need student support? Write to us directly:
              </p>

              {/* Contact Information Card */}
              <div className="p-3.5 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-violet-500/50 transition-all shadow-inner space-y-2.5 sm:space-y-3">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center shrink-0 border border-violet-500/30">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">Official Support Email</p>
                    <a 
                      href="mailto:support@gmail.com" 
                      className="text-sm sm:text-base font-extrabold text-white hover:text-violet-400 transition-colors flex items-center gap-1.5"
                    >
                      support@gmail.com
                      <span className="text-[10px] sm:text-xs bg-emerald-500/20 text-emerald-400 font-bold px-1.5 py-0.5 rounded-full border border-emerald-500/30">Online</span>
                    </a>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex flex-col gap-1 text-[11px] sm:text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>Support Hours: Mon – Sat (9:00 AM – 6:00 PM IST)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400"></span>
                    <span>Average Response: Under 2 hours</span>
                  </div>
                </div>
              </div>

              <a 
                href="mailto:support@gmail.com?subject=Inquiry%20regarding%20TestWise%20Platform" 
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 sm:py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Send Direct Email
              </a>
            </div>

          </div>

          {/* Bottom Copyright Bar */}
          <div className="pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] sm:text-xs text-slate-500">
            <p>© {new Date().getFullYear()} TestWise Platform. All rights reserved.</p>
            <div className="flex items-center gap-4 sm:gap-6">
              <span className="hover:text-slate-300 transition-colors cursor-pointer">Privacy Policy</span>
              <span className="hover:text-slate-300 transition-colors cursor-pointer">Terms of Service</span>
              <span className="hover:text-slate-300 transition-colors cursor-pointer">Security Compliance</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
