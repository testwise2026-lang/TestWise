'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<'howItWorks' | 'tests' | 'materials' | null>(null)
  const [hoveredNav, setHoveredNav] = useState<string | null>(null)
  
  // Auth states
  const [user, setUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<string | null>(null)

  // Mobile states
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  const pathname = usePathname()
  const router = useRouter()
  const navbarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        const { data } = await supabase.from('profiles').select('role').eq('id', session.user.id).single()
        if (data) {
          setUserRole(data.role)
        }
      }
    }
    
    fetchUser()
    
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user)
        const { data } = await supabase.from('profiles').select('role').eq('id', session.user.id).single()
        if (data) setUserRole(data.role)
      } else {
        setUser(null)
        setUserRole(null)
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target as Node)) {
        setActiveDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Listen for custom event to open Tests dropdown from other components
  useEffect(() => {
    const handleOpenTests = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      setActiveDropdown('tests')
    }
    window.addEventListener('openTestsDropdown', handleOpenTests)
    return () => window.removeEventListener('openTestsDropdown', handleOpenTests)
  }, [])

  const toggleDropdown = (dropdown: 'howItWorks' | 'tests' | 'materials') => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown)
  }

  const closeMenu = () => {
    setActiveDropdown(null)
    setIsMobileMenuOpen(false)
  }

  const triggerHowItWorks = (role: 'teachers' | 'students') => {
    if (pathname !== '/') {
      router.push(`/?role=${role}#how-it-works`)
    } else {
      window.dispatchEvent(new CustomEvent('switchHowItWorksTab', { detail: { role } }))
      const el = document.getElementById('how-it-works')
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
    closeMenu()
  }

  const scrollToAbout = (e: React.MouseEvent) => {
    if (pathname === '/') {
      e.preventDefault()
      const el = document.getElementById('about')
      if (el) el.scrollIntoView({ behavior: 'smooth' })
      closeMenu()
    }
  }

  return (
    <nav ref={navbarRef} className={`fixed w-full top-0 z-50 transition-all duration-300 ${scrolled || activeDropdown || isMobileMenuOpen ? 'bg-white/95 backdrop-blur-xl border-b border-[#DDE3DD] shadow-sm' : 'bg-transparent border-b border-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer z-50">
            <Link href="/" onClick={closeMenu} className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-10 h-10 bg-[#EDE9FE] rounded-xl border border-[#7C3AED]/20 text-[#7C3AED] shadow-sm">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                </svg>
              </div>
              <span className={`font-bold text-2xl tracking-tight ${scrolled || pathname !== '/' ? 'text-[#17221B]' : 'text-[#17221B]'}`}>TestWise</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-2">
            <Link 
              href="/" 
              onMouseEnter={() => setHoveredNav('home')}
              onMouseLeave={() => setHoveredNav(null)}
              className={`px-4 py-2.5 rounded-xl font-medium transition-all duration-300 hover:scale-[1.05] hover:-translate-y-0.5 hover:!bg-[#F5F3FF] hover:!text-[#7C3AED] hover:!shadow-sm ${
                pathname === '/' 
                  ? (hoveredNav && hoveredNav !== 'home' ? 'text-[#68736C] bg-transparent shadow-none' : 'text-[#7C3AED] bg-[#F5F3FF] shadow-sm')
                  : 'text-[#68736C] hover:text-[#7C3AED]'
              }`}
            >
              Home
            </Link>
            
            {/* How It Works Dropdown (Click to Open) */}
            <div className="relative">
              <button 
                onClick={() => toggleDropdown('howItWorks')}
                onMouseEnter={() => setHoveredNav('howItWorks')}
                onMouseLeave={() => setHoveredNav(null)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-medium transition-all duration-300 hover:scale-[1.05] hover:-translate-y-0.5 hover:bg-[#F5F3FF] hover:shadow-sm ${activeDropdown === 'howItWorks' ? 'text-[#7C3AED] bg-[#F5F3FF] shadow-sm' : 'text-[#68736C] hover:text-[#7C3AED]'}`}
              >
                How It Works
                <svg className={`w-4 h-4 transition-transform duration-300 ${activeDropdown === 'howItWorks' ? 'rotate-180 text-[#7C3AED]' : 'text-[#68736C]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              
              <div className={`absolute top-full mt-4 left-1/2 -translate-x-1/2 w-[600px] bg-white rounded-2xl shadow-xl border border-[#DDE3DD] transition-all duration-300 transform origin-top ${activeDropdown === 'howItWorks' ? 'opacity-100 visible translate-y-0 scale-100' : 'opacity-0 invisible translate-y-4 scale-95'} p-4`}>
                <div className="grid grid-cols-2 gap-2">
                  
                  {/* For Teachers Card */}
                  <button onClick={() => triggerHowItWorks('teachers')} className="group flex flex-col items-start p-5 rounded-xl border border-transparent hover:bg-[#F8F7F2] hover:border-[#DDE3DD] transition-all duration-300 text-left">
                    <div className="w-12 h-12 bg-[#F1F3EE] rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#EDE9FE] group-hover:text-[#7C3AED] group-hover:scale-110 transition-all duration-300 text-[#68736C]">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                    </div>
                    <h4 className="text-base font-bold text-[#17221B] group-hover:text-[#7C3AED] flex items-center justify-between w-full transition-colors mb-1">
                      For Teachers
                      <svg className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-[#7C3AED]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </h4>
                    <p className="text-sm text-[#68736C] transition-colors leading-relaxed">Create, manage and conduct assessments.</p>
                  </button>

                  {/* For Students Card */}
                  <button onClick={() => triggerHowItWorks('students')} className="group flex flex-col items-start p-5 rounded-xl border border-transparent hover:bg-[#F8F7F2] hover:border-[#DDE3DD] transition-all duration-300 text-left">
                    <div className="w-12 h-12 bg-[#F1F3EE] rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#EDE9FE] group-hover:text-[#7C3AED] group-hover:scale-110 transition-all duration-300 text-[#68736C]">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z"></path></svg>
                    </div>
                    <h4 className="text-base font-bold text-[#17221B] group-hover:text-[#7C3AED] flex items-center justify-between w-full transition-colors mb-1">
                      For Students
                      <svg className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-[#7C3AED]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </h4>
                    <p className="text-sm text-[#68736C] transition-colors leading-relaxed">Practice, take assessments and track your progress.</p>
                  </button>

                </div>
              </div>
            </div>

            {/* Tests Dropdown (Click to Open) */}
            <div className="relative">
              <button 
                onClick={() => toggleDropdown('tests')}
                onMouseEnter={() => setHoveredNav('tests')}
                onMouseLeave={() => setHoveredNav(null)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-medium transition-all duration-300 hover:scale-[1.05] hover:-translate-y-0.5 hover:bg-[#F5F3FF] hover:shadow-sm ${activeDropdown === 'tests' ? 'text-[#7C3AED] bg-[#F5F3FF] shadow-sm' : 'text-[#68736C] hover:text-[#7C3AED]'}`}
              >
                Tests
                <svg className={`w-4 h-4 transition-transform duration-300 ${activeDropdown === 'tests' ? 'rotate-180 text-[#7C3AED]' : 'text-[#68736C]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              
              <div className={`absolute top-full mt-4 left-1/2 -translate-x-1/2 w-[340px] bg-white rounded-2xl shadow-xl border border-[#DDE3DD] transition-all duration-300 transform origin-top ${activeDropdown === 'tests' ? 'opacity-100 visible translate-y-0 scale-100' : 'opacity-0 invisible translate-y-4 scale-95'} p-3 space-y-1`}>
                
                {/* Practice Test */}
                <Link href="/register" onClick={closeMenu} className="group flex items-start gap-4 p-4 hover:bg-[#F8F7F2] rounded-xl transition-all duration-300 hover:scale-[1.02] border border-transparent hover:border-[#DDE3DD]">
                  <div className="p-2.5 bg-[#F1F3EE] rounded-lg group-hover:bg-[#EDE9FE] group-hover:text-[#7C3AED] group-hover:scale-110 transition-all duration-300 text-[#68736C]">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#17221B] group-hover:text-[#7C3AED] transition-colors">Practice Test</p>
                    <p className="text-xs text-[#68736C] mt-1 transition-colors leading-relaxed">Improve your skills at your own pace.</p>
                  </div>
                </Link>

                {/* Mock Test */}
                <Link href="/register" onClick={closeMenu} className="group flex items-start gap-4 p-4 hover:bg-[#F8F7F2] rounded-xl transition-all duration-300 hover:scale-[1.02] border border-transparent hover:border-[#DDE3DD]">
                  <div className="p-2.5 bg-[#F1F3EE] rounded-lg group-hover:bg-[#D98B5F]/10 group-hover:text-[#D98B5F] group-hover:scale-110 transition-all duration-300 text-[#68736C]">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#17221B] group-hover:text-[#D98B5F] transition-colors">Mock Test</p>
                    <p className="text-xs text-[#68736C] mt-1 transition-colors leading-relaxed">Experience a complete exam-style assessment.</p>
                  </div>
                </Link>

                {/* Live Test */}
                <Link href="/register" onClick={closeMenu} className="group flex items-start gap-4 p-4 hover:bg-[#F8F7F2] rounded-xl transition-all duration-300 hover:scale-[1.02] border border-transparent hover:border-[#DDE3DD]">
                  <div className="p-2.5 bg-[#F1F3EE] rounded-lg group-hover:bg-[#6D28D9]/10 group-hover:text-[#6D28D9] group-hover:scale-110 transition-all duration-300 text-[#68736C]">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#17221B] group-hover:text-[#6D28D9] transition-colors">Live Test</p>
                    <p className="text-xs text-[#68736C] mt-1 transition-colors leading-relaxed">Participate in trainer-conducted assessments.</p>
                  </div>
                </Link>

              </div>
            </div>

            {/* Materials Dropdown (Zoom-in / Zoom-out) */}
            <div className="relative">
              <button 
                onClick={() => toggleDropdown('materials')}
                onMouseEnter={() => setHoveredNav('materials')}
                onMouseLeave={() => setHoveredNav(null)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-medium transition-all duration-300 hover:scale-[1.05] hover:-translate-y-0.5 hover:bg-[#F5F3FF] hover:shadow-sm ${activeDropdown === 'materials' ? 'text-[#7C3AED] bg-[#F5F3FF] shadow-sm' : 'text-[#68736C] hover:text-[#7C3AED]'}`}
              >
                Materials
                <svg className={`w-4 h-4 transition-transform duration-300 ${activeDropdown === 'materials' ? 'rotate-180 text-[#7C3AED]' : 'text-[#68736C]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              
              <div className={`absolute top-full mt-4 left-1/2 -translate-x-1/2 w-[340px] bg-white rounded-2xl shadow-xl border border-[#DDE3DD] transition-all duration-300 transform origin-top ${activeDropdown === 'materials' ? 'opacity-100 visible translate-y-0 scale-100' : 'opacity-0 invisible translate-y-3 scale-90 pointer-events-none'} p-3 space-y-1`}>
                
                {/* Aptitude */}
                <Link href="/materials?category=Aptitude" onClick={closeMenu} className="group flex items-start gap-4 p-3.5 hover:bg-[#F8F7F2] rounded-xl transition-all duration-300 hover:scale-[1.03] border border-transparent hover:border-[#DDE3DD]">
                  <div className="p-2.5 bg-orange-50 text-orange-600 rounded-lg group-hover:scale-110 transition-all duration-300">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#17221B] group-hover:text-orange-600 transition-colors">Aptitude</p>
                    <p className="text-xs text-[#68736C] mt-0.5 leading-relaxed">Formulas, shortcuts, quantitative eNotes.</p>
                  </div>
                </Link>

                {/* Reasoning */}
                <Link href="/materials?category=Reasoning" onClick={closeMenu} className="group flex items-start gap-4 p-3.5 hover:bg-[#F8F7F2] rounded-xl transition-all duration-300 hover:scale-[1.03] border border-transparent hover:border-[#DDE3DD]">
                  <div className="p-2.5 bg-violet-50 text-violet-600 rounded-lg group-hover:scale-110 transition-all duration-300">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#17221B] group-hover:text-violet-600 transition-colors">Reasoning</p>
                    <p className="text-xs text-[#68736C] mt-0.5 leading-relaxed">Logical puzzles, series, analytical guides.</p>
                  </div>
                </Link>

                {/* Verbal */}
                <Link href="/materials?category=Verbal" onClick={closeMenu} className="group flex items-start gap-4 p-3.5 hover:bg-[#F8F7F2] rounded-xl transition-all duration-300 hover:scale-[1.03] border border-transparent hover:border-[#DDE3DD]">
                  <div className="p-2.5 bg-teal-50 text-teal-600 rounded-lg group-hover:scale-110 transition-all duration-300">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#17221B] group-hover:text-teal-600 transition-colors">Verbal Ability</p>
                    <p className="text-xs text-[#68736C] mt-0.5 leading-relaxed">Grammar rules, vocabulary, comprehension.</p>
                  </div>
                </Link>

              </div>
            </div>
            <Link 
              href="/#about" 
              onClick={scrollToAbout}
              onMouseEnter={() => setHoveredNav('about')}
              onMouseLeave={() => setHoveredNav(null)}
              className="px-4 py-2.5 rounded-xl text-[#68736C] font-medium transition-all duration-300 hover:scale-[1.05] hover:-translate-y-0.5 hover:bg-[#F5F3FF] hover:text-[#7C3AED] hover:shadow-sm"
            >
              About
            </Link>
          </div>

          {/* Right Side: Auth */}
          <div className="hidden lg:flex items-center space-x-2 z-50">
            {user ? (
              <>
                <Link href={userRole === 'teacher' ? '/teacher/dashboard' : '/student/dashboard'} className="px-4 py-2.5 rounded-xl text-[#68736C] font-medium transition-all duration-300 hover:scale-[1.05] hover:-translate-y-0.5 hover:bg-[#F5F3FF] hover:text-[#7C3AED] hover:shadow-sm">
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="ml-2 px-6 py-2.5 rounded-full font-semibold bg-rose-50 text-rose-600 hover:bg-rose-100 shadow-sm transition-all duration-300 transform hover:-translate-y-0.5 hover:scale-[1.05]">
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="px-4 py-2.5 rounded-xl text-[#68736C] font-medium transition-all duration-300 hover:scale-[1.05] hover:-translate-y-0.5 hover:bg-[#F5F3FF] hover:text-[#7C3AED] hover:shadow-sm">
                  Login
                </Link>
                <Link href="/register" className="ml-2 px-6 py-2.5 rounded-full font-semibold bg-[#7C3AED] text-white hover:bg-[#6D28D9] shadow-[0_4px_15px_rgba(124,58,237,0.2)] transition-all duration-300 transform hover:-translate-y-0.5 hover:scale-[1.05]">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center z-50">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-[#68736C] hover:text-[#17221B] focus:outline-none p-2"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className={`lg:hidden absolute top-full left-0 w-full bg-white border-b border-[#DDE3DD] shadow-2xl transition-all duration-300 origin-top ${isMobileMenuOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'}`}>
        <div className="px-4 py-6 space-y-2 max-h-[calc(100vh-80px)] overflow-y-auto">
          <Link href="/" onClick={closeMenu} className="block px-4 py-3 text-base font-medium text-[#17221B] bg-[#F1F3EE] rounded-xl">Home</Link>
          
          {/* Mobile How It Works Dropdown */}
          <div>
            <button 
              onClick={() => toggleDropdown('howItWorks')} 
              className="flex items-center justify-between w-full px-4 py-3 text-base font-medium text-[#68736C] rounded-xl hover:bg-[#F8F7F2] transition-colors"
            >
              How It Works
              <svg className={`w-4 h-4 transition-transform duration-300 ${activeDropdown === 'howItWorks' ? 'rotate-180 text-[#7C3AED]' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${activeDropdown === 'howItWorks' ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
              <div className="px-2 py-2 space-y-2">
                <button onClick={() => triggerHowItWorks('teachers')} className="w-full text-left flex items-center gap-3 p-3 bg-[#F8F7F2] rounded-xl border border-[#DDE3DD] hover:border-[#7C3AED]/30 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-[#17221B] block">For Teachers</span>
                    <span className="text-xs text-[#68736C] block">Create and manage assessments.</span>
                  </div>
                </button>
                <button onClick={() => triggerHowItWorks('students')} className="w-full text-left flex items-center gap-3 p-3 bg-[#F8F7F2] rounded-xl border border-[#DDE3DD] hover:border-[#7C3AED]/30 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z"></path></svg>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-[#17221B] block">For Students</span>
                    <span className="text-xs text-[#68736C] block">Practice and track progress.</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Tests Dropdown */}
          <div>
            <button 
              onClick={() => toggleDropdown('tests')} 
              className="flex items-center justify-between w-full px-4 py-3 text-base font-medium text-[#68736C] rounded-xl hover:bg-[#F8F7F2] transition-colors"
            >
              Tests
              <svg className={`w-4 h-4 transition-transform duration-300 ${activeDropdown === 'tests' ? 'rotate-180 text-[#7C3AED]' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${activeDropdown === 'tests' ? 'max-h-64 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
              <div className="px-4 py-2 space-y-2">
                <Link href="/register" onClick={closeMenu} className="flex items-center gap-3 p-3 bg-[#F8F7F2] rounded-xl border border-[#DDE3DD] hover:border-[#7C3AED]/30 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-[#7C3AED]"></div>
                  <span className="text-sm font-semibold text-[#17221B]">Practice Test</span>
                </Link>
                <Link href="/register" onClick={closeMenu} className="flex items-center gap-3 p-3 bg-[#F8F7F2] rounded-xl border border-[#DDE3DD] hover:border-[#D98B5F]/30 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-[#D98B5F]"></div>
                  <span className="text-sm font-semibold text-[#17221B]">Mock Test</span>
                </Link>
                <Link href="/register" onClick={closeMenu} className="flex items-center gap-3 p-3 bg-[#F8F7F2] rounded-xl border border-[#DDE3DD] hover:border-[#6D28D9]/30 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-[#6D28D9]"></div>
                  <span className="text-sm font-semibold text-[#17221B]">Live Test</span>
                </Link>
              </div>
            </div>
          </div>
          
          {/* Mobile Materials Dropdown */}
          <div>
            <button 
              onClick={() => toggleDropdown('materials')} 
              className="flex items-center justify-between w-full px-4 py-3 text-base font-medium text-[#68736C] rounded-xl hover:bg-[#F8F7F2] transition-colors"
            >
              Materials
              <svg className={`w-4 h-4 transition-transform duration-300 ${activeDropdown === 'materials' ? 'rotate-180 text-[#7C3AED]' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${activeDropdown === 'materials' ? 'max-h-64 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
              <div className="px-4 py-2 space-y-2">
                <Link href="/materials?category=Aptitude" onClick={closeMenu} className="flex items-center gap-3 p-3 bg-[#F8F7F2] rounded-xl border border-[#DDE3DD] hover:border-orange-500/30 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  <span className="text-sm font-semibold text-[#17221B]">Aptitude Materials</span>
                </Link>
                <Link href="/materials?category=Reasoning" onClick={closeMenu} className="flex items-center gap-3 p-3 bg-[#F8F7F2] rounded-xl border border-[#DDE3DD] hover:border-violet-500/30 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-violet-500"></div>
                  <span className="text-sm font-semibold text-[#17221B]">Reasoning Materials</span>
                </Link>
                <Link href="/materials?category=Verbal" onClick={closeMenu} className="flex items-center gap-3 p-3 bg-[#F8F7F2] rounded-xl border border-[#DDE3DD] hover:border-teal-500/30 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                  <span className="text-sm font-semibold text-[#17221B]">Verbal Ability</span>
                </Link>
              </div>
            </div>
          </div>
          <Link href="/#about" onClick={scrollToAbout} className="block px-4 py-3 text-base font-medium text-[#68736C] hover:text-[#17221B] hover:bg-[#F8F7F2] rounded-xl transition-colors">About</Link>
          
          <div className="mt-6 pt-6 border-t border-[#DDE3DD] flex flex-col gap-4 px-4 pb-8">
            {user ? (
              <>
                <Link href={userRole === 'teacher' ? '/teacher/dashboard' : '/student/dashboard'} onClick={closeMenu} className="w-full text-center px-4 py-3.5 text-sm font-bold text-[#17221B] bg-[#F1F3EE] border border-[#DDE3DD] rounded-xl hover:bg-[#DDE3DD] transition-colors">
                  Dashboard
                </Link>
                <button onClick={() => { closeMenu(); handleLogout(); }} className="w-full text-center px-4 py-3.5 text-sm font-bold text-rose-600 bg-rose-50 rounded-xl hover:bg-rose-100 shadow-sm transition-colors">
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={closeMenu} className="w-full text-center px-4 py-3.5 text-sm font-bold text-[#17221B] bg-[#F1F3EE] border border-[#DDE3DD] rounded-xl hover:bg-[#DDE3DD] transition-colors">
                  Login
                </Link>
                <Link href="/register" onClick={closeMenu} className="w-full text-center px-4 py-3.5 text-sm font-bold text-white bg-[#7C3AED] rounded-xl hover:bg-[#6D28D9] shadow-sm transition-colors">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
