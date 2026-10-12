'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Calculator, BrainCircuit, MessageSquare, Download, Loader2 } from 'lucide-react';
import { supabase } from '@/utils/supabase';
import { motion, AnimatePresence } from 'framer-motion';

export default function ENotesPage() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Aptitude');

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('study_materials')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setMaterials(data);
    setLoading(false);
  };

  const getIcon = (course: string) => {
    if (course === 'Aptitude') return <Calculator className="text-orange-600" size={24} />;
    if (course === 'Reasoning') return <BrainCircuit className="text-violet-600" size={24} />;
    return <MessageSquare className="text-teal-600" size={24} />;
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return '--';
    const mb = bytes / (1024 * 1024);
    return mb < 1 ? `${(bytes / 1024).toFixed(1)} KB` : `${mb.toFixed(1)} MB`;
  };

  const tabs = ['Aptitude', 'Reasoning', 'Verbal'];
  const filteredMaterials = materials.filter(m => m.course === activeTab);

  return (
    <>
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
        
        <div className="bg-white p-8 rounded-3xl border border-[#DDE3DD] shadow-sm relative overflow-hidden animate-in slide-in-from-top-4 duration-700">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-yellow-100 to-transparent rounded-full -mr-20 -mt-20 opacity-50 blur-3xl animate-pulse"></div>
          <h1 className="text-3xl font-bold text-[#17221B] relative z-10">eNotes Library</h1>
          <p className="text-[#68736C] mt-2 max-w-2xl relative z-10 text-lg font-medium">
            Access premium study materials, formula cheat sheets, and shortcut tricks uploaded by teachers.
          </p>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full pb-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl font-bold border transition-all duration-300 ${
                  isActive 
                  ? 'bg-slate-900 border-slate-900 text-white shadow-lg scale-100' 
                  : 'bg-white border-[#DDE3DD] text-[#68736C] hover:bg-slate-50 hover:scale-[1.02]'
                }`}
              >
                <div className={`p-1.5 sm:p-2 rounded-xl bg-white/10 ${isActive ? 'text-white' : ''}`}>
                  {getIcon(tab)}
                </div>
                <span className="text-sm sm:text-base">{tab}</span>
              </button>
            )
          })}
        </div>

        {/* Notes Grid */}
        {loading ? (
           <div className="flex justify-center items-center h-40"><Loader2 className="animate-spin text-slate-500" size={40} /></div>
        ) : filteredMaterials.length === 0 ? (
           <div className="text-center text-[#68736C] py-20 bg-white rounded-3xl border border-[#DDE3DD] font-medium text-lg">No materials available for {activeTab} yet. Check back soon!</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-from-bottom-4 duration-700">
            {filteredMaterials.map((note) => (
              <a 
                href={note.file_url} 
                target="_blank" 
                rel="noreferrer"
                key={note.id} 
                className="group relative bg-white rounded-3xl p-6 border border-[#DDE3DD] hover:border-emerald-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-slate-50 to-transparent rounded-tr-3xl -z-10 group-hover:from-emerald-50 transition-colors"></div>
                
                <div>
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform group-hover:bg-emerald-50 text-[#17221B]">
                    <BookOpen size={20} />
                  </div>
                  <h3 className="font-extrabold text-[#17221B] text-lg leading-tight group-hover:text-emerald-700 transition-colors line-clamp-2">
                    {note.title}
                  </h3>
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between">
                    <span className="bg-slate-100 text-[#68736C] text-xs font-bold px-3 py-1 rounded-lg">
                      {note.type.toUpperCase()}
                    </span>
                    <span className="text-[#68736C] text-xs font-bold bg-slate-50 px-2 py-1 rounded-lg">
                      {formatSize(note.file_size_bytes)}
                    </span>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-center gap-2 w-full bg-slate-50 group-hover:bg-emerald-600 text-[#17221B] group-hover:text-white py-2.5 rounded-xl font-bold transition-colors text-sm">
                    <Download size={16} /> Open Material
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
