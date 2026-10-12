'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import FeedbackModal from '@/components/FeedbackModal';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
  LayoutDashboard,
  PenTool,
  FileText,
  Radio,
  BookOpen,
  Bookmark,
  Settings,
  Search,
  Moon,
  Sun,
  UserCircle,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  BarChart3
} from 'lucide-react';

export default function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTestsOpen, setIsTestsOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userName, setUserName] = useState('Student');
  const pathname = usePathname();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('name').eq('id', user.id).single();
        if (data?.name) {
          setUserName(data.name);
        }
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const NavLink = ({ href, icon: Icon, label, nested = false }: { href: string, icon: any, label: string, nested?: boolean }) => {
    const isActive = pathname === href;
    return (
      <Link 
        href={href} 
        onClick={() => setIsMobileMenuOpen(false)}
        className={`group flex items-center gap-3 py-2.5 rounded-xl font-medium transition-all duration-300 ${nested ? 'pl-10 pr-3' : 'px-3'} ${
          isActive 
            ? 'bg-violet-50 text-violet-700 shadow-sm' 
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        }`}
      >
        <Icon 
          size={18} 
          className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110 group-hover:rotate-3'}`} 
        />
        <span className="transition-transform duration-300 group-hover:translate-x-1">{label}</span>
      </Link>
    );
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <ProtectedRoute allowedRole="student">
      <div className={`flex h-screen bg-[#F8F7F2] text-slate-800 font-sans overflow-hidden transition-colors duration-500 ${isDarkMode ? 'dark bg-slate-900 text-white' : ''}`}>
        
        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`fixed md:static inset-y-0 left-0 w-72 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col shadow-2xl md:shadow-sm z-50 transform transition-transform duration-500 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}>
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-teal-500 flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:scale-105 transition-transform duration-300">
                T
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white group-hover:text-violet-600 transition-colors">TestWise</span>
            </Link>
            <button className="md:hidden text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-lg" onClick={() => setIsMobileMenuOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <div className="mb-6 animate-in slide-in-from-left-4 duration-500 delay-100">
              <p className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Menu</p>
              <NavLink href="/student/dashboard" icon={LayoutDashboard} label="Overview" />
              <NavLink href="/student/dashboard/analytics" icon={BarChart3} label="AI Analytics" />
            </div>

            <div className="mb-6 animate-in slide-in-from-left-4 duration-500 delay-200">
              <button 
                onClick={() => setIsTestsOpen(!isTestsOpen)} 
                className="w-full flex items-center justify-between px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-violet-100 text-violet-600 rounded-lg group-hover:scale-110 transition-transform">
                    <PenTool size={16} />
                  </div>
                  <span className="font-bold tracking-wide">Tests</span>
                </div>
                {isTestsOpen ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
              </button>
              
              <div className={`mt-2 space-y-1 overflow-hidden transition-all duration-500 ease-in-out ${isTestsOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                <NavLink href="/student/dashboard/tests/practice" icon={PenTool} label="Practice Tests" nested />
                <NavLink href="/student/dashboard/tests/mock" icon={FileText} label="Mock Exams" nested />
                <NavLink href="/student/dashboard/tests/live" icon={Radio} label="Live Tests" nested />
              </div>
            </div>

            <div className="mb-6 animate-in slide-in-from-left-4 duration-500 delay-300">
              <p className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Study</p>
              <NavLink href="/student/dashboard/enotes" icon={BookOpen} label="eNotes" />
              <NavLink href="/student/dashboard/bookmarks" icon={Bookmark} label="Bookmarks" />
            </div>
          </nav>

          <div className="p-4 border-t border-slate-100 dark:border-slate-800 animate-in slide-in-from-bottom-4 duration-500">
            <NavLink href="/student/dashboard/settings" icon={Settings} label="Settings" />
            <button 
              onClick={handleLogout}
              className="w-full group flex items-center gap-3 py-2.5 px-3 rounded-xl font-medium transition-all duration-300 text-red-600 hover:bg-red-50 mt-1"
            >
              <svg className="w-[18px] h-[18px] group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
              <span>Log Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
          
          {/* Top Navbar */}
          <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 md:px-6 z-30 transition-all">
            <div className="flex items-center gap-3">
              <button 
                className="md:hidden p-2 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu size={24} />
              </button>
              
              <div className="hidden sm:block relative w-64 md:w-80 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="Search tests, topics, notes..." 
                  className="w-full pl-10 pr-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-violet-300 focus:ring-4 focus:ring-violet-50 dark:focus:ring-violet-900/20 transition-all outline-none text-sm font-medium dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              <button onClick={toggleDarkMode} className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-violet-600 hover:scale-110 transition-all">
                {isDarkMode ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} />}
              </button>
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>
              <Link href="/student/dashboard/settings" className="flex items-center gap-2 hover:opacity-80 transition-opacity group">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-none group-hover:text-violet-700 transition-colors">{userName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Student</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center border-2 border-white group-hover:scale-105 transition-transform overflow-hidden shadow-sm">
                  <img src="https://api.dicebear.com/7.x/micah/svg?seed=Felix&backgroundColor=f1f5f9" alt="Profile" className="w-full h-full object-cover" />
                </div>
              </Link>
            </div>
          </header>

          {/* Scrollable Page Content */}
          <div className="flex-1 overflow-auto p-4 md:p-8 scroll-smooth">
            {children}
          </div>
        </main>

        {/* Feedback Modal */}
        <FeedbackModal role="student" />
      </div>
    </ProtectedRoute>
  );
}
