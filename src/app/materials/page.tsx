'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Calculator, BrainCircuit, MessageSquare, FileText, Video, 
  Download, Lock, Clock, Sparkles, ExternalLink, X, ArrowRight, Loader2, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/utils/supabase';
import Navbar from '@/components/Navbar';

function MaterialsExplorer() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const initialCategory = searchParams.get('category') || 'Aptitude';
  const [activeTab, setActiveTab] = useState(initialCategory);
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  // Auth required modal state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);

  // Sync tab with URL query parameter
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat && ['Aptitude', 'Reasoning', 'Verbal'].includes(cat)) {
      setActiveTab(cat);
    }
  }, [searchParams]);

  // Check current user session
  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    }
    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Fetch materials from Supabase
  useEffect(() => {
    async function fetchMaterials() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('study_materials')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          setMaterials(data);
        }
      } catch (err) {
        console.error('Error fetching materials:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchMaterials();
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    router.push(`/materials?category=${tab}`, { scroll: false });
  };

  const handleOpenMaterial = (material: any) => {
    if (user) {
      // User is logged in -> open file directly
      if (material.file_url) {
        window.open(material.file_url, '_blank');
      }
    } else {
      // User not logged in -> prompt auth modal
      setSelectedMaterial(material);
      setShowAuthModal(true);
    }
  };

  const filteredMaterials = materials.filter(m => m.course?.toLowerCase() === activeTab.toLowerCase());

  const tabs = [
    { id: 'Aptitude', label: 'Aptitude', icon: Calculator, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
    { id: 'Reasoning', label: 'Reasoning', icon: BrainCircuit, color: 'text-violet-600', bg: 'bg-violet-50 border-violet-200' },
    { id: 'Verbal', label: 'Verbal', icon: MessageSquare, color: 'text-teal-600', bg: 'bg-teal-50 border-teal-200' },
  ];

  const formatSize = (bytes: number) => {
    if (!bytes) return 'PDF';
    const mb = bytes / (1024 * 1024);
    return mb < 1 ? `${(bytes / 1024).toFixed(1)} KB` : `${mb.toFixed(1)} MB`;
  };

  return (
    <div className="min-h-screen bg-[#F8F7F2] text-[#17221B] flex flex-col pt-24">
      <Navbar />

      {/* Hero Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#DDE3DD] shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-violet-200/40 via-teal-100/30 to-transparent rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
          
          <div className="max-w-3xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 border border-violet-500/20 text-violet-700 font-bold text-xs uppercase tracking-wider mb-4">
              <Sparkles size={14} /> Teacher Resources & eNotes
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-[#17221B] tracking-tight mb-4 leading-tight">
              Study Materials Library
            </h1>
            <p className="text-[#68736C] text-base sm:text-lg font-medium leading-relaxed">
              Explore subject-wise formula cheat sheets, shortcuts, and study guides uploaded by expert trainers. Select a category below to access resources.
            </p>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 mt-8">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            const count = materials.filter(m => m.course?.toLowerCase() === tab.id.toLowerCase()).length;

            return (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleTabChange(tab.id)}
                className={`flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 py-4 sm:py-5 px-3 rounded-2xl font-bold border transition-all duration-300 shadow-sm ${
                  isActive 
                    ? 'bg-white border-[#7C3AED] shadow-md ring-2 ring-[#7C3AED]/20 text-[#17221B]' 
                    : 'bg-white/70 hover:bg-white border-[#DDE3DD] text-[#68736C] hover:text-[#17221B]'
                }`}
              >
                <div className={`p-2 rounded-xl ${isActive ? 'bg-[#EDE9FE] text-[#7C3AED]' : 'bg-[#F1F3EE] text-[#68736C]'}`}>
                  <Icon size={20} />
                </div>
                <div className="text-center sm:text-left">
                  <span className="block text-sm sm:text-base font-extrabold">{tab.label}</span>
                  <span className="text-[11px] font-semibold text-[#68736C]">
                    {count} {count === 1 ? 'Material' : 'Materials'}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="mt-10 mb-16">
          {loading ? (
            <div className="bg-white rounded-3xl p-16 border border-[#DDE3DD] text-center flex flex-col items-center justify-center gap-4 shadow-sm">
              <Loader2 className="w-10 h-10 animate-spin text-[#7C3AED]" />
              <p className="text-[#68736C] font-semibold">Loading {activeTab} materials...</p>
            </div>
          ) : filteredMaterials.length > 0 ? (
            /* Materials List */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMaterials.map((mat, idx) => (
                <motion.div
                  key={mat.id || idx}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-3xl border border-[#DDE3DD] hover:border-[#7C3AED]/40 hover:shadow-xl transition-all duration-300 p-6 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        {mat.type === 'video' ? <Video size={24} /> : <FileText size={24} />}
                      </div>
                      <span className="px-3 py-1 bg-[#F1F3EE] text-[#68736C] text-xs font-bold rounded-full uppercase tracking-wider">
                        {mat.type || 'PDF'}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-lg text-[#17221B] group-hover:text-[#7C3AED] transition-colors line-clamp-2 mb-2">
                      {mat.title}
                    </h3>
                    <p className="text-xs text-[#68736C] font-medium flex items-center gap-2 mb-4">
                      <span>Course: <strong className="text-[#17221B]">{mat.course}</strong></span>
                      <span>•</span>
                      <span>{formatSize(mat.file_size_bytes)}</span>
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <span className="text-xs text-[#68736C] flex items-center gap-1 font-medium">
                      <Clock size={12} /> {new Date(mat.created_at || Date.now()).toLocaleDateString()}
                    </span>

                    <button
                      onClick={() => handleOpenMaterial(mat)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-sm transition-all transform hover:-translate-y-0.5"
                    >
                      {user ? (
                        <>
                          View Material <ExternalLink size={13} />
                        </>
                      ) : (
                        <>
                          <Lock size={12} /> Unlock PDF
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            /* Coming Soon Empty State (As Requested by User) */
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl p-12 sm:p-16 border border-[#DDE3DD] text-center shadow-sm max-w-2xl mx-auto flex flex-col items-center"
            >
              <div className="w-20 h-20 bg-amber-50 rounded-3xl border border-amber-200 text-amber-600 flex items-center justify-center mb-6 shadow-inner">
                <Clock size={40} className="animate-pulse" />
              </div>
              <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-extrabold rounded-full uppercase tracking-wider mb-3">
                Coming Soon
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17221B] mb-3">
                {activeTab} Materials Coming Soon!
              </h2>
              <p className="text-[#68736C] text-sm sm:text-base leading-relaxed max-w-md mb-8">
                Trainers are currently curating and uploading comprehensive study notes, formula sheets, and mock guides for <strong className="text-[#17221B]">{activeTab}</strong>. Please check back shortly!
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3">
                {tabs.filter(t => t.id !== activeTab).map(t => (
                  <button
                    key={t.id}
                    onClick={() => handleTabChange(t.id)}
                    className="px-4 py-2.5 rounded-xl border border-[#DDE3DD] text-xs font-bold text-[#17221B] hover:bg-[#F8F7F2] transition-colors"
                  >
                    Explore {t.label} Instead →
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Auth Modal (Requires Login/Signup to view PDF) */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative border border-[#DDE3DD]"
            >
              <button 
                onClick={() => setShowAuthModal(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X size={20} />
              </button>

              <div className="w-14 h-14 rounded-2xl bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center mb-6">
                <Lock size={28} />
              </div>

              <h3 className="text-2xl font-black text-[#17221B] mb-2">
                Sign In to Access Materials
              </h3>
              <p className="text-[#68736C] text-sm leading-relaxed mb-6">
                To view and download <strong className="text-[#17221B]">"{selectedMaterial?.title || 'this PDF'}"</strong>, please sign in with your student or teacher account. It's completely free!
              </p>

              <div className="space-y-3">
                <Link
                  href="/login"
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-center block bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-md transition-all hover:scale-[1.02]"
                >
                  Sign In to Your Account
                </Link>
                <Link
                  href="/register"
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-center block bg-slate-100 hover:bg-slate-200 text-[#17221B] transition-colors"
                >
                  Create a Free Account
                </Link>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-[#68736C]">
                <CheckCircle2 size={14} className="text-emerald-500" />
                <span>Instant access to all practice questions and notes</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="mt-auto bg-slate-950 text-slate-300 py-10 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white text-base">TestWise</span>
            <span>• Study Materials Library</span>
          </div>
          <p>© {new Date().getFullYear()} TestWise Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default function MaterialsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8F7F2] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#7C3AED]" />
      </div>
    }>
      <MaterialsExplorer />
    </Suspense>
  );
}

