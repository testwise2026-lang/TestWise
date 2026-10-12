'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { supabase } from '@/utils/supabase'

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<'teachers' | 'students'>('teachers')
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
    <div className="min-h-screen bg-[#F8F7F2] font-sans text-slate-900 selection:bg-violet-200 selection:text-violet-900">
      <Navbar />

      {/* ==================================================
          2. HERO SECTION
      ================================================== */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden border-b border-slate-200">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full z-0 pointer-events-none">
          {/* Vibrant glowing background blobs */}
          <div className="absolute top-[-20%] left-1/4 w-[500px] h-[500px] bg-violet-400/20 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-sky-400/20 rounded-full blur-[120px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm mb-8 backdrop-blur-md">
                <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse"></div>
                <span className="text-xs font-bold text-violet-600 tracking-widest uppercase">Smart Online Assessments</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight mb-6 leading-[1.1]">
                Test Smarter.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-sky-500">Perform Better.</span>
              </h1>
              
              <p className="mt-6 text-xl text-slate-600 mb-10 leading-relaxed max-w-lg font-light">
                A modern assessment platform connecting trainers and students through practice, mock tests and secure live assessments.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register" className="px-8 py-4 bg-violet-600 text-white font-bold rounded-xl shadow-[0_4px_15px_rgba(124,58,237,0.3)] hover:bg-violet-700 transition-all transform hover:-translate-y-0.5 text-lg text-center">
                  Get Started
                </Link>
                <button onClick={triggerExploreTests} className="px-8 py-4 bg-white text-slate-900 font-bold rounded-xl border border-slate-200 hover:bg-slate-50 shadow-sm transition-all text-lg text-center backdrop-blur-md">
                  Explore Tests
                </button>
              </div>
            </div>

            {/* Right Visual - High-End SaaS Product Showcase */}
            <div className="relative mt-12 lg:mt-0 lg:pl-10">
              <div className="relative rounded-3xl border border-slate-200 bg-white shadow-2xl p-2 z-10 transform lg:rotate-1 hover:rotate-0 transition-transform duration-500 overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/10 to-sky-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20 pointer-events-none rounded-3xl" />
                <img 
                  src="/hero-vibrant.jpg" 
                  alt="TestWise Assessment Platform Dashboard" 
                  className="w-full h-auto rounded-2xl shadow-sm object-cover relative z-10"
                />
                
                {/* Floating Elements for extra SaaS feel */}
                <div className="absolute -bottom-6 -left-6 bg-white border border-slate-200 p-4 rounded-xl shadow-xl flex items-center gap-4 animate-bounce z-30" style={{animationDuration: '4s'}}>
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Exam Submitted</p>
                    <p className="text-sm font-bold text-slate-900">Alex M. finished</p>
                  </div>
                </div>

                <div className="absolute -top-6 -right-6 bg-white border border-slate-200 p-3 rounded-xl shadow-xl flex items-center gap-3 animate-pulse z-30">
                  <div className="w-2 h-2 rounded-full bg-violet-500"></div>
                  <p className="text-xs font-bold text-slate-900">AI Monitor Active</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          3. HERO STATISTICS STRIP
      ================================================== */}
      <section className="bg-white border-b border-slate-200 py-8 z-20 shadow-sm relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-row overflow-x-auto md:grid md:grid-cols-5 gap-8 md:divide-x md:divide-slate-200 text-center pb-4 md:pb-0 scrollbar-hide">
            <div className="min-w-[120px] px-4">
              <div className="flex justify-center mb-2"><svg className="w-5 h-5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg></div>
              <p className="text-3xl font-black text-slate-900 mb-1">10K+</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Users</p>
            </div>
            <div className="min-w-[120px] px-4">
              <div className="flex justify-center mb-2"><svg className="w-5 h-5 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z"></path></svg></div>
              <p className="text-3xl font-black text-slate-900 mb-1">8K+</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Students</p>
            </div>
            <div className="min-w-[120px] px-4">
              <div className="flex justify-center mb-2"><svg className="w-5 h-5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg></div>
              <p className="text-3xl font-black text-slate-900 mb-1">500+</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Teachers</p>
            </div>
            <div className="min-w-[120px] px-4">
              <div className="flex justify-center mb-2"><svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div>
              <p className="text-3xl font-black text-slate-900 mb-1">25K+</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Live Tests</p>
            </div>
            <div className="min-w-[120px] px-4">
              <div className="flex justify-center mb-2"><svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg></div>
              <p className="text-3xl font-black text-slate-900 mb-1">{avgRating} <span className="text-slate-500 text-lg">/ 5</span></p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                User Rating {totalRatings > 0 && <span className="lowercase normal-case opacity-70">({totalRatings} reviews)</span>}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          4. HOW TESTWISE WORKS
      ================================================== */}
      <section id="how-it-works" className="py-24 bg-[#F8F7F2] relative overflow-hidden border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center mb-10 transition-all duration-500">
            <h2 className="text-3xl md:text-5xl font-extrabold text-[#17221B] mb-6 tracking-tight">
              How TestWise Works
            </h2>
            <p className="text-lg text-[#68736C] max-w-2xl mx-auto">
              A seamless assessment workflow tailored to your role.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-16">
            <div className="inline-flex bg-white rounded-full p-1 border border-[#DDE3DD] shadow-sm">
              <button 
                onClick={() => setActiveTab('teachers')}
                className={`px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 ${
                  activeTab === 'teachers' 
                    ? 'bg-teal-500 text-white shadow-md' 
                    : 'text-[#68736C] hover:text-[#17221B] hover:bg-slate-50'
                }`}
              >
                For Teachers
              </button>
              <button 
                onClick={() => setActiveTab('students')}
                className={`px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 ${
                  activeTab === 'students' 
                    ? 'bg-violet-500 text-white shadow-md' 
                    : 'text-[#68736C] hover:text-[#17221B] hover:bg-slate-50'
                }`}
              >
                For Students
              </button>
            </div>
          </div>

          {/* Timeline Wrapper */}
          <div className="relative max-w-6xl mx-auto animate-fade-in-up">
            
            {/* Horizontal Connecting SVG Path (Desktop) */}
            <div className="hidden lg:block absolute top-[5.5rem] left-[12.5%] right-[12.5%] z-0 opacity-30 pointer-events-none">
              <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-[#68736C] to-transparent"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 group/timeline">
              {(activeTab === 'teachers' 
                ? [workflowSteps[0], workflowSteps[1], workflowSteps[2], { ...workflowSteps[7], num: '04' }] 
                : [{ ...workflowSteps[3], num: '01' }, { ...workflowSteps[4], num: '02' }, { ...workflowSteps[5], num: '03' }, { ...workflowSteps[6], num: '04' }]
              ).map((step, idx) => {
                return (
                  <div key={idx} 
                    className={`group/card relative z-10 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:!opacity-100 hover:-translate-y-2 hover:scale-[1.05] ${step.border} cursor-default flex flex-col items-start overflow-hidden`}
                    style={{ '--hover-shadow': `0 20px 40px -10px ${step.glow}` } as React.CSSProperties}
                    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = e.currentTarget.style.getPropertyValue('--hover-shadow') }}
                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow)' }}
                  >
                    <div className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 ease-out pointer-events-none" style={{ background: `radial-gradient(circle at top right, ${step.glow}, transparent 70%)` }}></div>
                    
                    <div className={`w-full flex items-center justify-between mb-5 relative z-10`}>
                      <div className={`w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover/card:scale-110 group-hover/card:-translate-y-1 ${step.color} ${step.bgGlow}`}>
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={step.icon}></path>
                        </svg>
                      </div>
                      <span className={`text-3xl font-black ${step.color} opacity-20 transition-all duration-300 group-hover/card:opacity-100 group-hover/card:scale-110`}>{step.num}</span>
                    </div>
                    
                    <div className="relative z-10 transform transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover/card:translate-x-1 w-full">
                      <h3 className="text-lg font-bold text-slate-900 opacity-80 group-hover/card:opacity-100 transition-all duration-300 leading-tight mb-2">{step.title}</h3>
                      <p className="text-sm text-slate-600 opacity-80 group-hover/card:opacity-100 transition-all duration-300 leading-relaxed">{step.desc}</p>
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
      <section className="py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">Choose Your Test</h2>
            <p className="text-lg text-slate-600 max-w-xl mx-auto">TestWise offers flexible assessment formats tailored for practice, preparation, and professional evaluation.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Practice Test - Violet */}
            <div className="group relative bg-white rounded-3xl p-8 border border-slate-200 shadow-md hover:shadow-xl hover:border-violet-500 transition-all duration-300 hover:scale-[1.04] overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-violet-100 rounded-bl-full transition-transform duration-300 group-hover:scale-150"></div>
              <div className="w-16 h-16 bg-slate-50 text-slate-500 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-violet-600 group-hover:text-white transition-colors duration-300 relative z-10">
                <svg className="w-8 h-8 transform transition-transform duration-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-slate-900 group-hover:text-violet-600 transition-colors">Practice Test</h3>
              <p className="text-slate-600 mb-8 relative z-10 leading-relaxed">Build your skills through flexible practice. Learn and improve at your own pace.</p>
              <button onClick={triggerExploreTests} className="inline-flex items-center text-sm font-bold text-violet-600 hover:text-violet-700 group-hover:translate-x-1 transition-transform">
                Start Practice <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </button>
            </div>

            {/* Mock Test - Sky */}
            <div className="group relative bg-white rounded-3xl p-8 border border-slate-200 shadow-md hover:shadow-xl hover:border-sky-500 transition-all duration-300 hover:scale-[1.04] overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-sky-100 rounded-bl-full transition-transform duration-300 group-hover:scale-150"></div>
              <div className="w-16 h-16 bg-slate-50 text-slate-500 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-sky-500 group-hover:text-white transition-colors duration-300 relative z-10">
                <svg className="w-8 h-8 transform transition-transform duration-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-slate-900 group-hover:text-sky-500 transition-colors">Mock Test</h3>
              <p className="text-slate-600 mb-8 relative z-10 leading-relaxed">Experience a complete exam-style assessment to measure your real readiness.</p>
              <button onClick={triggerExploreTests} className="inline-flex items-center text-sm font-bold text-sky-500 hover:text-sky-600 group-hover:translate-x-1 transition-transform">
                Take Mock Test <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </button>
            </div>

            {/* Live Test - Teal */}
            <div className="group relative bg-white rounded-3xl p-8 border border-slate-200 shadow-md hover:shadow-xl hover:border-teal-500 transition-all duration-300 hover:scale-[1.04] overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-100 rounded-bl-full transition-transform duration-300 group-hover:scale-150"></div>
              <div className="w-16 h-16 bg-slate-50 text-slate-500 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-teal-500 group-hover:text-white transition-colors duration-300 relative z-10">
                <svg className="w-8 h-8 transform transition-transform duration-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-slate-900 group-hover:text-teal-500 transition-colors">Live Test</h3>
              <p className="text-slate-600 mb-8 relative z-10 leading-relaxed">Take part in real-time, trainer-conducted assessments in a secure environment.</p>
              <button onClick={triggerExploreTests} className="inline-flex items-center text-sm font-bold text-teal-500 hover:text-teal-600 group-hover:translate-x-1 transition-transform">
                Join Live Test <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          6. STUDENT EXPERIENCE
      ================================================== */}
      <section id="student-exp" className="py-24 bg-[#F8F7F2] text-slate-900 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            <div className="order-2 lg:order-1 relative">
              <div className="absolute inset-0 bg-violet-200 rounded-3xl transform -rotate-3 scale-105"></div>
              <div className="relative bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 p-4 flex items-center justify-between border-b border-slate-200">
                  <div className="text-slate-900 font-bold flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-violet-500"></div> Student Dashboard</div>
                  <div className="text-xs text-slate-500">Alex M.</div>
                </div>
                <div className="p-6">
                  <div className="flex gap-4 mb-6">
                    <div className="flex-1 p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Upcoming Live Test</p>
                      <p className="font-bold text-slate-900">Advanced Aptitude</p>
                      <p className="text-xs text-violet-600 font-bold mt-1">Today, 2:00 PM</p>
                    </div>
                    <div className="flex-1 p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Overall Score</p>
                      <p className="text-2xl font-black text-violet-600">845</p>
                    </div>
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-slate-900 mb-3">Recent Results</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-3 border border-slate-200 rounded-lg">
                        <span className="text-sm font-medium">Logical Reasoning (Mock)</span>
                        <span className="text-sm font-bold text-violet-600">92%</span>
                      </div>
                      <div className="flex justify-between items-center p-3 border border-slate-200 rounded-lg">
                        <span className="text-sm font-medium">Quantitative (Practice)</span>
                        <span className="text-sm font-bold text-violet-600">88%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-slate-900">Built for Students</h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Experience a clean, focused exam environment. Practice anytime, take assigned live tests securely, and track your performance trends effortlessly.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {['Practice anytime', 'Take assigned tests', 'Track performance', 'View detailed results'].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <span className="text-slate-900 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          7. TRAINER EXPERIENCE
      ================================================== */}
      <section id="trainer-exp" className="py-24 bg-white text-slate-900 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            <div>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6">Powerful Tools for Trainers</h2>
              <p className="text-lg text-slate-600 mb-10 leading-relaxed">
                Take complete control. TestWise provides trainers with an advanced control center to manage question banks, schedule exams, and securely monitor student attempts.
              </p>
              
              <div className="flex flex-wrap items-center gap-3 mb-10">
                <span className="font-black text-slate-900 tracking-wider">CREATE</span>
                <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                <span className="font-black text-slate-900 tracking-wider">ASSIGN</span>
                <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                <span className="font-black text-slate-900 tracking-wider">CONDUCT</span>
                <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                <span className="font-black text-teal-600 tracking-wider">ANALYZE</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4">
                {['Create exams', 'Add questions', 'Manage question bank', 'Give student permission', 'Conduct live tests', 'View results'].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-slate-900 font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0"></div>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-teal-200 rounded-3xl transform rotate-2 scale-105"></div>
              <div className="relative bg-white rounded-2xl shadow-xl border border-slate-200 p-6 overflow-hidden">
                <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                  <h4 className="font-bold flex items-center gap-2 text-slate-900">
                    <svg className="w-5 h-5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg> 
                    Trainer Control Center
                  </h4>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Students</p>
                    <p className="text-2xl font-black text-slate-900">145</p>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Active Tests</p>
                    <p className="text-2xl font-black text-teal-600">3</p>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Question Bank</p>
                    <p className="text-2xl font-black text-slate-900">1,250</p>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Pending Permissions</p>
                    <p className="text-2xl font-black text-sky-500">12</p>
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
      <section className="py-24 bg-[#F8F7F2] text-slate-900 relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-rose-400/20 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            <div className="order-2 lg:order-1 relative">
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 relative">
                <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 text-center border border-rose-500/30 z-20">
                  <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2">Warning: Tab Switched</h4>
                  <p className="text-slate-600 text-sm max-w-sm mb-6">You have navigated away from the exam window. This event has been recorded.</p>
                  <button className="px-6 py-2 bg-rose-500 text-white font-bold rounded-lg hover:bg-rose-600 transition-colors shadow-sm">Return to Exam</button>
                </div>
                <div className="opacity-40">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-6">
                    <div className="font-bold text-sm bg-rose-50 text-rose-600 px-3 py-1.5 rounded-full border border-rose-200">SECURE MODE</div>
                    <div className="font-mono text-xl text-slate-900">24:59</div>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                    <div className="h-4 bg-slate-200 rounded w-full mb-4"></div>
                    <div className="space-y-3">
                      <div className="h-10 border border-slate-200 rounded-lg"></div>
                      <div className="h-10 border border-slate-200 rounded-lg"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-slate-900">Built for Fair Assessments</h2>
              <p className="text-lg text-slate-600 leading-relaxed mb-10">
                TestWise monitors important browser activity during assessments and can automatically submit an exam when a student leaves the exam environment, according to the exam rules.
              </p>
              
              <ul className="space-y-4">
                {[
                  'Exam Timer Synchronization',
                  'Tab Switch Detection',
                  'Window Focus Monitoring',
                  'Auto-Submit Protocols',
                  'Strict Attempt Tracking'
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-4">
                    <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0 border border-slate-200">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <span className="font-medium text-slate-900">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          9. LEARNING MATERIALS
      ================================================== */}
      <section className="py-24 bg-white text-slate-900 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">Learn Before You Test</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">Access curated resources to prepare effectively for your assessments.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Notes', desc: 'Comprehensive study materials', color: 'from-violet-500 to-fuchsia-500', bg: 'bg-violet-50/50 border-violet-100', shadow: 'hover:shadow-violet-500/25', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
              { title: 'Formulas', desc: 'Quick cheat sheets', color: 'from-sky-500 to-blue-600', bg: 'bg-sky-50/50 border-sky-100', shadow: 'hover:shadow-sky-500/25', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
              { title: 'Videos', desc: 'Expert video tutorials', color: 'from-teal-400 to-emerald-500', bg: 'bg-teal-50/50 border-teal-100', shadow: 'hover:shadow-teal-500/25', icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z' },
              { title: 'Shortcuts', desc: 'Time-saving techniques', color: 'from-amber-400 to-orange-500', bg: 'bg-amber-50/50 border-amber-100', shadow: 'hover:shadow-amber-500/25', icon: 'M13 10V3L4 14h7v7l9-11h-7z' }
            ].map((item, i) => (
              <div key={i} className={`group relative ${item.bg} p-8 rounded-3xl border shadow-sm transition-all duration-300 hover:shadow-xl ${item.shadow} hover:-translate-y-2 cursor-pointer flex flex-col items-center text-center overflow-hidden`}>
                <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${item.color} opacity-80 group-hover:opacity-100 transition-opacity`}></div>
                <div className={`absolute -inset-2 bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300 blur-xl pointer-events-none`}></div>
                
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center mb-6 shadow-md transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}></path></svg>
                </div>
                <h4 className={`font-extrabold text-xl text-slate-900 mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-slate-900 group-hover:to-slate-700 transition-all`}>{item.title}</h4>
                <p className="text-sm text-slate-600 font-medium">{item.desc}</p>
                
                <div className="mt-6 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                   <span className={`text-xs font-bold uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r ${item.color}`}>Explore →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================================================
          10. TESTIMONIALS (SOCIAL PROOF)
      ================================================== */}
      <section className="py-24 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-slate-900">Loved by Institutes & Students</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">See how TestWise is transforming online assessments across the country.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                <div key={idx} className="p-8 bg-slate-50 rounded-3xl border border-slate-200 relative flex flex-col">
                  <div className={`${colorClass} mb-4`}>
                    <svg className="w-8 h-8 opacity-50" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>
                  </div>
                  <p className="text-slate-700 italic mb-6 flex-1">"{fb.comment}"</p>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 ${bgClass} rounded-full flex items-center justify-center font-bold`}>
                      {initials}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{displayName}</h4>
                      <p className="text-xs text-slate-500">{displaySub}</p>
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
      <section className="py-24 bg-[#F8F7F2] border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-slate-900">Simple, Transparent Pricing</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">Choose the plan that fits your needs. No hidden fees.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
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
              <button className="w-full py-3 bg-slate-100 text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors">Sign Up Free</button>
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
              <button className="w-full py-3 bg-white text-violet-600 font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm">Start 14-Day Trial</button>
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
              <button className="w-full py-3 bg-slate-100 text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors">Contact Sales</button>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          12. ABOUT SECTION
      ================================================== */}
      <section id="about" className="py-24 bg-[#F8F7F2] border-t border-[#DDE3DD] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-block px-4 py-1.5 rounded-full bg-violet-100 border border-violet-500/20 text-violet-600 font-bold text-sm mb-6">
                About TestWise
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-[#17221B] leading-tight">
                Empowering the Next Generation of Learners
              </h2>
              <p className="text-lg text-[#68736C] mb-8 leading-relaxed">
                TestWise was founded on the belief that assessments shouldn't just be about grading—they should be a core part of the learning journey. By connecting trainers and students through an intuitive, secure, and smart ecosystem, we make it easier to practice, evaluate, and grow.
              </p>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-[#DDE3DD] flex items-center justify-center shrink-0 text-[#167D5A]">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-[#17221B]">Secure & Reliable</h4>
                    <p className="text-[#68736C] text-sm mt-1">Enterprise-grade security ensuring integrity for all live assessments.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-[#DDE3DD] flex items-center justify-center shrink-0 text-[#D98B5F]">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-[#17221B]">Actionable Analytics</h4>
                    <p className="text-[#68736C] text-sm mt-1">Detailed performance tracking to identify strengths and areas for improvement.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-violet-500/10 to-teal-500/10 blur-2xl rounded-full"></div>
              <div className="relative bg-white p-8 rounded-3xl border border-[#DDE3DD] shadow-xl">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#F8F7F2] p-6 rounded-2xl text-center border border-[#DDE3DD]">
                    <div className="text-4xl font-extrabold text-violet-600 mb-2">10k+</div>
                    <div className="text-sm font-semibold text-[#68736C]">Active Students</div>
                  </div>
                  <div className="bg-[#F8F7F2] p-6 rounded-2xl text-center border border-[#DDE3DD]">
                    <div className="text-4xl font-extrabold text-teal-600 mb-2">500+</div>
                    <div className="text-sm font-semibold text-[#68736C]">Expert Trainers</div>
                  </div>
                  <div className="bg-[#F8F7F2] p-6 rounded-2xl text-center border border-[#DDE3DD]">
                    <div className="text-4xl font-extrabold text-[#D98B5F] mb-2">50k+</div>
                    <div className="text-sm font-semibold text-[#68736C]">Tests Taken</div>
                  </div>
                  <div className="bg-[#F8F7F2] p-6 rounded-2xl text-center border border-[#DDE3DD]">
                    <div className="text-4xl font-extrabold text-sky-500 mb-2">99%</div>
                    <div className="text-sm font-semibold text-[#68736C]">Satisfaction Rate</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          10. FOOTER
      ================================================== */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet-100 border border-violet-500/20 flex items-center justify-center text-violet-600">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
            </div>
            <span className="font-bold text-xl text-slate-900 tracking-tight">TestWise</span>
          </div>
          <p className="text-sm text-slate-500">© {new Date().getFullYear()} TestWise Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
