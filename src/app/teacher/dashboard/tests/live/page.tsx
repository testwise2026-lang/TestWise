'use client'

import { useState, useEffect } from 'react';
import { 
  PlusCircle, Edit2, Trash2, Calendar, Clock, Users, FileText, 
  ChevronRight, ArrowLeft, X, AlertCircle, UploadCloud, Activity, Download, Trophy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/utils/supabase';

const LIVE_TESTS = [
  {
    id: 1,
    title: 'TCS NQT National Qualifier - Mega Mock',
    description: 'A comprehensive national level mock test simulating the exact TCS NQT pattern.',
    status: 'Upcoming', // Upcoming, Active, Completed
    startTime: '2024-12-15T10:00:00',
    endTime: '2024-12-15T13:00:00',
    duration: 180, // minutes
    registered: 1254,
    questions: 90
  },
  {
    id: 2,
    title: 'Wipro Elite National Talent Hunt',
    description: 'Official pattern mock test for Wipro Elite NTH 2024 batch.',
    status: 'Active',
    startTime: '2024-10-08T09:00:00',
    endTime: '2024-10-08T18:00:00',
    duration: 120,
    registered: 850,
    questions: 60,
    liveNow: 420
  },
  {
    id: 3,
    title: 'Infosys SP & SE Certification',
    description: 'System Engineer pattern test covering logical reasoning and pseudocode.',
    status: 'Completed',
    startTime: '2024-09-25T10:00:00',
    endTime: '2024-09-25T13:00:00',
    duration: 100,
    registered: 1540,
    submitted: 1480,
    avgScore: '78%',
    highestScore: '99%',
    passRate: '85%',
    questions: 75
  }
];

import { useRouter } from 'next/navigation';

export default function TeacherLiveTestsPage() {
  const router = useRouter();
  const [dbTests, setDbTests] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchDbTests = async () => {
      try {
        const { data } = await supabase.from('tests').select('*').order('created_at', { ascending: false });
        if (data) setDbTests(data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchDbTests();
  }, []);

  const formattedDbTests = dbTests
    .filter(t => (t.description || '').includes('[TYPE:live]'))
    .map(t => ({
      id: t.id,
      title: t.title,
      description: (t.description || '').replace(/^\[TYPE:[a-z]+\]\s*/i, ''),
      status: t.is_active ? 'Active' : 'Upcoming',
      startTime: t.created_at || new Date().toISOString(),
      endTime: new Date(Date.now() + 86400000).toISOString(),
      duration: t.duration_minutes || 60,
      registered: 0,
      questions: t.total_questions || 0,
      liveNow: 0,
      isDb: true
    }));

  const allLiveTests = [...formattedDbTests, ...LIVE_TESTS];

  const [step, setStep] = useState(1);
  const [testData, setTestData] = useState({
    title: '',
    description: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    duration: '',
    entryMethod: ''
  });

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setStep(1);
    setTestData({
      title: '',
      description: '',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      duration: '',
      entryMethod: ''
    });
  };

  const nextStep = () => setStep(s => Math.min(3, s + 1));
  const prevStep = () => setStep(s => Math.max(1, s - 1));

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return (
          <span className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 text-sm font-bold rounded-full border border-emerald-200 shadow-sm animate-pulse">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Live Now
          </span>
        );
      case 'Upcoming':
        return (
          <span className="flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 text-sm font-bold rounded-full border border-amber-200 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span> Upcoming
          </span>
        );
      case 'Completed':
        return (
          <span className="flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-600 text-sm font-bold rounded-full border border-slate-200 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-slate-400"></span> Completed
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Live Tests & Exams</h1>
          <p className="text-slate-600 mt-1">Schedule and monitor real-time assessments for your institution.</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={openModal} 
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-md hover:shadow-indigo-500/20"
        >
          <PlusCircle size={20} />
          Schedule Live Test
        </motion.button>
      </div>

      {/* Tests Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {allLiveTests.map((test) => (
            <motion.div 
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ duration: 0.3 }}
              key={test.id} 
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all group cursor-pointer flex flex-col"
            >
              <div className={`h-2 w-full ${test.status === 'Active' ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' : 'bg-gradient-to-r from-indigo-400 to-purple-500'}`}></div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                    <Calendar size={24} />
                  </div>
                  {renderStatusBadge(test.status)}
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-700 transition-colors">{test.title}</h3>
                <p className="text-slate-600 text-sm line-clamp-2 mb-6 flex-1">{test.description}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm text-slate-600 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="flex flex-col gap-1">
                    <span className="text-slate-400 text-[10px] font-bold uppercase">Date</span>
                    <span className="font-bold flex items-center gap-1.5"><Calendar size={14} className="text-indigo-500" /> {new Date(test.startTime).toLocaleDateString()}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-slate-400 text-[10px] font-bold uppercase">Duration</span>
                    <span className="font-bold flex items-center gap-1.5"><Clock size={14} className="text-indigo-500" /> {test.duration} mins</span>
                  </div>
                  
                  {test.status === 'Completed' ? (
                    <>
                      <div className="flex flex-col gap-1">
                        <span className="text-slate-400 text-[10px] font-bold uppercase">Submitted</span>
                        <span className="font-bold flex items-center gap-1.5"><Users size={14} className="text-indigo-500" /> {test.submitted} / {test.registered}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-slate-400 text-[10px] font-bold uppercase">Avg Score</span>
                        <span className="font-bold flex items-center gap-1.5"><Activity size={14} className="text-emerald-500" /> {test.avgScore}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-slate-400 text-[10px] font-bold uppercase">Pass Rate</span>
                        <span className="font-bold flex items-center gap-1.5 text-slate-700">{test.passRate}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-slate-400 text-[10px] font-bold uppercase">Highest Score</span>
                        <span className="font-bold flex items-center gap-1.5 text-emerald-600"><Trophy size={14} /> {test.highestScore}</span>
                      </div>
                    </>
                  ) : test.status === 'Active' ? (
                    <>
                      <div className="flex flex-col gap-1">
                        <span className="text-slate-400 text-[10px] font-bold uppercase">Registered</span>
                        <span className="font-bold flex items-center gap-1.5"><Users size={14} className="text-indigo-500" /> {test.registered}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-emerald-500 text-[10px] font-bold uppercase animate-pulse">Live Now</span>
                        <span className="font-bold flex items-center gap-1.5 text-emerald-600"><Activity size={14} /> {test.liveNow} Writing</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex flex-col gap-1">
                        <span className="text-slate-400 text-[10px] font-bold uppercase">Questions</span>
                        <span className="font-bold flex items-center gap-1.5"><FileText size={14} className="text-indigo-500" /> {test.questions} Qs</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-slate-400 text-[10px] font-bold uppercase">Registered</span>
                        <span className="font-bold flex items-center gap-1.5"><Users size={14} className="text-indigo-500" /> {test.registered}</span>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100 mt-auto">
                  {test.status === 'Completed' ? (
                    <>
                      <button className="flex-1 flex items-center justify-center gap-2 bg-emerald-50 border border-emerald-200 hover:bg-emerald-600 hover:text-white text-emerald-700 px-4 py-2.5 rounded-xl font-bold transition-all shadow-sm">
                        <Download size={16} /> Report
                      </button>
                      <button className="flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 p-2.5 rounded-xl font-bold transition-all shadow-sm">
                        <Activity size={18} />
                      </button>
                    </>
                  ) : test.status === 'Active' ? (
                    <>
                      <button className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-emerald-500/20">
                        <Activity size={16} /> Live Monitor
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 text-slate-700 px-4 py-2.5 rounded-xl font-bold transition-all">
                        <Edit2 size={16} /> Edit
                      </button>
                      <button className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-rose-600 hover:text-rose-700 hover:bg-rose-50 text-slate-700 px-4 py-2.5 rounded-xl font-bold transition-all">
                        <Trash2 size={16} /> Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-slate-900">Schedule Live Test</h2>
              <button onClick={closeModal} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 md:p-8 overflow-y-auto">
              
              {/* Stepper */}
              <div className="flex items-center justify-center mb-8">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>1</div>
                  <div className={`w-12 h-1 rounded-full ${step >= 2 ? 'bg-indigo-600' : 'bg-slate-100'}`}></div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>2</div>
                  <div className={`w-12 h-1 rounded-full ${step >= 3 ? 'bg-indigo-600' : 'bg-slate-100'}`}></div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 3 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>3</div>
                </div>
              </div>

              {/* Step 1: Basic Info */}
              {step === 1 && (
                <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Test Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g., TCS NQT Final Mock"
                      value={testData.title}
                      onChange={e => setTestData({...testData, title: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none transition-all" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description (Optional)</label>
                    <textarea 
                      rows={3}
                      placeholder="Brief instructions or details about the test..."
                      value={testData.description}
                      onChange={e => setTestData({...testData, description: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none transition-all resize-none" 
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Scheduling */}
              {step === 2 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  
                  <div className="bg-blue-50 text-blue-800 p-4 rounded-xl flex items-start gap-3">
                    <AlertCircle size={20} className="shrink-0 mt-0.5" />
                    <p className="text-sm leading-relaxed">
                      Live tests will only be accessible to students between the Start Date/Time and End Date/Time. The test will automatically close when the End Time is reached or when the individual Duration is exhausted, whichever is earlier.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Start Date</label>
                      <input 
                        type="date" 
                        value={testData.startDate}
                        onChange={e => setTestData({...testData, startDate: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Start Time</label>
                      <input 
                        type="time" 
                        value={testData.startTime}
                        onChange={e => setTestData({...testData, startTime: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">End Date</label>
                      <input 
                        type="date" 
                        value={testData.endDate}
                        onChange={e => setTestData({...testData, endDate: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">End Time</label>
                      <input 
                        type="time" 
                        value={testData.endTime}
                        onChange={e => setTestData({...testData, endTime: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Test Duration (in minutes)</label>
                    <input 
                      type="number" 
                      placeholder="e.g., 120"
                      value={testData.duration}
                      onChange={e => setTestData({...testData, duration: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none" 
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Question Entry Method */}
              {step === 3 && (
                <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                  <p className="text-slate-600 mb-4">How would you like to add questions to this live test?</p>
                  
                  <button 
                    onClick={() => setTestData({...testData, entryMethod: 'manual'})}
                    className={`w-full flex items-start gap-4 p-5 rounded-xl border-2 transition-all text-left ${
                      testData.entryMethod === 'manual' 
                        ? 'border-indigo-600 bg-indigo-50' 
                        : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`p-3 rounded-lg ${testData.entryMethod === 'manual' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <FileText size={24} />
                    </div>
                    <div>
                      <h4 className={`font-bold text-lg ${testData.entryMethod === 'manual' ? 'text-indigo-900' : 'text-slate-900'}`}>Manual Entry</h4>
                      <p className={`text-sm mt-1 ${testData.entryMethod === 'manual' ? 'text-indigo-700' : 'text-slate-500'}`}>
                        Type questions, options, and explanations manually using our rich text editor. Good for a small number of custom questions.
                      </p>
                    </div>
                  </button>

                  <button 
                    onClick={() => setTestData({...testData, entryMethod: 'upload'})}
                    className={`w-full flex items-start gap-4 p-5 rounded-xl border-2 transition-all text-left ${
                      testData.entryMethod === 'upload' 
                        ? 'border-indigo-600 bg-indigo-50' 
                        : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`p-3 rounded-lg ${testData.entryMethod === 'upload' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <UploadCloud size={24} />
                    </div>
                    <div>
                      <h4 className={`font-bold text-lg ${testData.entryMethod === 'upload' ? 'text-indigo-900' : 'text-slate-900'}`}>Upload File / PDF</h4>
                      <p className={`text-sm mt-1 ${testData.entryMethod === 'upload' ? 'text-indigo-700' : 'text-slate-500'}`}>
                        Upload questions in bulk via Excel, CSV, or parse directly from a PDF document. Fastest method for large exams.
                      </p>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              {step > 1 ? (
                <button 
                  onClick={prevStep}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-slate-600 hover:bg-slate-200 font-semibold transition-colors"
                >
                  <ArrowLeft size={18} /> Back
                </button>
              ) : (
                <div></div> // Empty div to keep 'Next' button on the right
              )}

              {step < 3 ? (
                <button 
                  onClick={nextStep}
                  disabled={step === 1 ? !testData.title : false}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:shadow-none text-white px-6 py-2.5 rounded-lg font-bold transition-all shadow-md hover:shadow-lg shadow-indigo-500/20"
                >
                  Continue <ChevronRight size={18} />
                </button>
              ) : (
                <button 
                  onClick={() => {
                    closeModal();
                    router.push(`/teacher/dashboard/tests/create?type=live&mode=${testData.entryMethod === 'upload' ? 'bulk' : 'manual'}`);
                  }}
                  disabled={!testData.entryMethod}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:shadow-none text-white px-6 py-2.5 rounded-lg font-bold transition-all shadow-md hover:shadow-lg shadow-indigo-500/20"
                >
                  Create Live Test
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
