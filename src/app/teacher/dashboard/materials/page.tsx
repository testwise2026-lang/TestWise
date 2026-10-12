'use client';
import { useState, useEffect, useRef } from 'react';
import { UploadCloud, FileText, Video, Link as LinkIcon, Search, Calculator, BrainCircuit, MessageSquare, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/utils/supabase';

export default function TeacherMaterialsPage() {
  const [activeTab, setActiveTab] = useState('Aptitude');
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('study_materials')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setMaterials(data);
    setLoading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not logged in');

      // Upload to Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${userData.user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('materials')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get Public URL
      const { data: publicUrlData } = supabase.storage
        .from('materials')
        .getPublicUrl(filePath);

      // Save to Database
      let type = 'link';
      if (file.type.includes('pdf')) type = 'pdf';
      else if (file.type.includes('video')) type = 'video';
      else type = fileExt || 'file';

      const { error: dbError } = await supabase
        .from('study_materials')
        .insert({
          title: file.name,
          type: type,
          course: activeTab,
          file_url: publicUrlData.publicUrl,
          file_size_bytes: file.size,
          uploaded_by: userData.user.id
        });

      if (dbError) throw dbError;

      // Refresh list
      await fetchMaterials();
    } catch (err: any) {
      alert('Error uploading file: ' + err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const filteredMaterials = materials.filter(m => m.course === activeTab);

  const getIcon = (type: string) => {
    if (type === 'pdf') return <FileText size={20} className="text-rose-500" />;
    if (type === 'video' || type === 'mp4') return <Video size={20} className="text-indigo-500" />;
    return <LinkIcon size={20} className="text-emerald-500" />;
  };

  const tabs = [
    { id: 'Aptitude', label: 'Aptitude', icon: Calculator, count: materials.filter(m => m.course === 'Aptitude').length },
    { id: 'Reasoning', label: 'Reasoning', icon: BrainCircuit, count: materials.filter(m => m.course === 'Reasoning').length },
    { id: 'Verbal', label: 'Verbal', icon: MessageSquare, count: materials.filter(m => m.course === 'Verbal').length },
  ];

  const formatSize = (bytes: number) => {
    if (!bytes) return '--';
    const mb = bytes / (1024 * 1024);
    return mb < 1 ? `${(bytes / 1024).toFixed(1)} KB` : `${mb.toFixed(1)} MB`;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Study Materials</h1>
          <p className="text-slate-600 mt-1">Upload and manage resources for your students.</p>
        </div>
        
        <input 
          type="file" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
        />
        
        <motion.button 
          whileHover={{ scale: uploading ? 1 : 1.05 }} 
          whileTap={{ scale: uploading ? 1 : 0.95 }}
          onClick={() => !uploading && fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md"
        >
          {uploading ? <Loader2 size={20} className="animate-spin" /> : <UploadCloud size={20} />}
          {uploading ? 'Uploading...' : 'Upload Material'}
        </motion.button>
      </div>

      {/* Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-3 gap-2 relative">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)} 
              className={`relative flex justify-center items-center gap-1 sm:gap-2 px-1 sm:px-6 py-3 rounded-xl font-bold text-[11px] sm:text-base transition-colors z-10 ${isActive ? 'text-indigo-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
            >
              {isActive && (
                <motion.div 
                  layoutId="materials-active-tab"
                  className="absolute inset-0 bg-indigo-50 rounded-xl -z-10"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <tab.icon size={16} className={`shrink-0 sm:w-5 sm:h-5 ${isActive ? 'text-indigo-600' : ''}`} /> 
              <span className="truncate">{tab.label}</span>
              <span className={`hidden sm:flex ml-2 items-center justify-center px-2 py-0.5 rounded-full text-xs ${isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder={`Search ${activeTab} materials...`} 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
            />
          </div>
        </div>
        
        <div className="p-6 bg-slate-50/50 min-h-[300px]">
          {loading ? (
             <div className="flex justify-center items-center h-40"><Loader2 className="animate-spin text-indigo-500" size={32} /></div>
          ) : filteredMaterials.length === 0 ? (
             <div className="text-center text-slate-500 py-10 font-medium">No materials uploaded for {activeTab} yet.</div>
          ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredMaterials.map((item) => (
                <a 
                  key={item.id} 
                  href={item.file_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-indigo-400 hover:shadow-2xl hover:shadow-indigo-500/20 transition-all flex flex-col gap-4 cursor-pointer group relative overflow-hidden h-full"
                  >
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-50/0 via-indigo-50/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    <div className="flex justify-between items-start relative z-10">
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 group-hover:scale-110 flex items-center justify-center shrink-0 transition-all duration-300 shadow-sm">
                        {getIcon(item.type)}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg leading-tight group-hover:text-indigo-700 transition-colors line-clamp-2">
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-3 text-sm font-medium text-slate-500">
                        <span className="uppercase tracking-wider text-[11px] bg-slate-100 px-2 py-1 rounded-md group-hover:bg-indigo-100 group-hover:text-indigo-700 transition-colors">{item.type}</span>
                        <span>•</span>
                        <span>{formatSize(item.file_size_bytes)}</span>
                      </div>
                    </div>
                  </motion.div>
                </a>
              ))}
            </AnimatePresence>
          </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
