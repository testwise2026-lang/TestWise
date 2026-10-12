'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, ShieldAlert, CheckCircle, Video, Monitor, Mic, 
  AlertOctagon, XCircle, ChevronRight, Maximize, Search, AlertTriangle, Filter
} from 'lucide-react';

export default function TeacherLiveMonitoringPage() {
  const [activeTab, setActiveTab] = useState('grid');
  // High-fidelity realistic dummy data for demo
  const activeStudents = [
    { id: 'S101', name: 'Rahul Sharma', status: 'clean', progress: 65, warnings: 0, timeRemaining: '45m 12s', avatar: 'RS', cam: true, screen: true, mic: true },
    { id: 'S102', name: 'Priya Patel', status: 'warning', progress: 42, warnings: 2, timeRemaining: '48m 30s', avatar: 'PP', cam: true, screen: true, mic: false, lastAlert: 'Tab switch detected' },
    { id: 'S103', name: 'Anand Kumar', status: 'critical', progress: 12, warnings: 5, timeRemaining: '52m 10s', avatar: 'AK', cam: true, screen: false, mic: true, lastAlert: 'Screen sharing stopped' },
    { id: 'S104', name: 'Sneha Reddy', status: 'clean', progress: 88, warnings: 0, timeRemaining: '12m 05s', avatar: 'SR', cam: true, screen: true, mic: true },
    { id: 'S105', name: 'Kiran Verma', status: 'submitted', progress: 100, warnings: 1, timeRemaining: '--', avatar: 'KV', cam: false, screen: false, mic: false },
    { id: 'S106', name: 'Vikram Singh', status: 'warning', progress: 55, warnings: 1, timeRemaining: '40m 22s', avatar: 'VS', cam: true, screen: true, mic: true, lastAlert: 'Looking away from screen' },
    { id: 'S107', name: 'Amit Jain', status: 'clean', progress: 30, warnings: 0, timeRemaining: '10m 00s', avatar: 'AJ', cam: true, screen: true, mic: true },
  ];

  const liveAlerts = [
    { id: 1, time: 'Just now', student: 'Anand Kumar', type: 'critical', message: 'Screen sharing stopped abruptly.' },
    { id: 2, time: '2 mins ago', student: 'Priya Patel', type: 'warning', message: 'Tab switched to "Google Search".' },
    { id: 3, time: '5 mins ago', student: 'Vikram Singh', type: 'warning', message: 'Face not detected in webcam.' },
    { id: 4, time: '12 mins ago', student: 'Priya Patel', type: 'warning', message: 'Tab switched to "ChatGPT".' },
    { id: 5, time: '18 mins ago', student: 'Anand Kumar', type: 'warning', message: 'Multiple voices detected.' },
  ];

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'clean': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'warning': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'critical': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'submitted': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 h-[calc(100vh-8rem)] flex flex-col">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3 tracking-tight">
            Live Proctoring
            <span className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full border border-red-200 uppercase tracking-wider">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              Monitoring Active
            </span>
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Monitoring students currently taking tests.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="hidden sm:block"></div>

          <div className="relative w-full sm:w-auto">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search candidate..." 
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-full sm:w-64 font-medium"
            />
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* Left Side: Candidates Grid */}
        <div className="flex-1 flex flex-col min-h-0 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex gap-4">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active</span>
                <span className="text-xl font-extrabold text-slate-800">{activeStudents.length}</span>
              </div>
              <div className="w-px bg-slate-200"></div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Warnings</span>
                <span className="text-xl font-extrabold text-amber-600">{activeStudents.filter(s => s.warnings > 0).length}</span>
              </div>
              <div className="w-px bg-slate-200"></div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Critical</span>
                <span className="text-xl font-extrabold text-rose-600">{activeStudents.filter(s => s.status === 'critical').length}</span>
              </div>
            </div>
            
            <div className="flex bg-slate-200/70 p-1 rounded-lg">
              <button 
                onClick={() => setActiveTab('grid')}
                className={`px-3 py-1.5 text-sm font-bold rounded-md transition-colors ${activeTab === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Grid View
              </button>
              <button 
                onClick={() => setActiveTab('list')}
                className={`px-3 py-1.5 text-sm font-bold rounded-md transition-colors ${activeTab === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                List View
              </button>
            </div>
          </div>

          {/* Grid Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/30">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {activeStudents.map((student, i) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  key={student.id} 
                  className={`bg-white rounded-2xl border transition-all duration-300 hover:shadow-lg overflow-hidden group ${student.status === 'critical' ? 'border-rose-300 shadow-rose-100' : 'border-slate-200 hover:border-indigo-300'}`}
                >
                  <div className="p-4 flex items-start justify-between border-b border-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600 border border-slate-200">
                        {student.avatar}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">{student.name}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{student.id}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(student.status)}`}>
                      {student.status}
                    </span>
                  </div>
                  
                  <div className="p-4 bg-slate-50/50 space-y-4">
                    {/* Progress & Time */}
                    <div className="flex justify-between text-xs font-bold text-slate-500">
                      <span>Progress: {student.progress}%</span>
                      <span>{student.timeRemaining}</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full rounded-full transition-all duration-1000" style={{ width: `${student.progress}%` }}></div>
                    </div>

                    {/* Sensor Status */}
                    <div className="flex justify-between items-center pt-2">
                      <div className="flex gap-2">
                        <div className={`p-1.5 rounded-md flex items-center justify-center ${student.cam ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'}`} title="Webcam">
                          <Video size={14} strokeWidth={2.5} />
                        </div>
                        <div className={`p-1.5 rounded-md flex items-center justify-center ${student.screen ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'}`} title="Screen Share">
                          <Monitor size={14} strokeWidth={2.5} />
                        </div>
                        <div className={`p-1.5 rounded-md flex items-center justify-center ${student.mic ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-500'}`} title="Microphone">
                          <Mic size={14} strokeWidth={2.5} />
                        </div>
                      </div>
                      
                      <button className="text-[11px] font-bold text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded transition-colors flex items-center gap-1 opacity-0 group-hover:opacity-100">
                        View Stream <Maximize size={12} />
                      </button>
                    </div>

                    {/* Warning message if applicable */}
                    {student.lastAlert && student.status !== 'submitted' && (
                      <div className={`text-[11px] font-medium p-2 rounded-lg flex items-start gap-1.5 ${student.status === 'critical' ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                        <AlertTriangle size={12} className="shrink-0 mt-0.5" /> {student.lastAlert}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Alerts Feed */}
        <div className="w-full lg:w-80 flex flex-col bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden shrink-0">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 flex items-center gap-2">
              <Activity size={18} className="text-indigo-500" /> Live Feed
            </h3>
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <AnimatePresence>
              {liveAlerts.map((alert, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={alert.id}
                  className="flex gap-3 relative before:absolute before:left-3.5 before:top-8 before:bottom-[-16px] before:w-px before:bg-slate-200 last:before:hidden"
                >
                  <div className="shrink-0 relative z-10">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 border-white shadow-sm ${alert.type === 'critical' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
                      {alert.type === 'critical' ? <AlertOctagon size={12} /> : <AlertTriangle size={12} />}
                    </div>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex-1 hover:border-indigo-200 transition-colors cursor-pointer group">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-xs text-slate-900 group-hover:text-indigo-600 transition-colors">{alert.student}</span>
                      <span className="text-[10px] font-bold text-slate-400">{alert.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 font-medium leading-relaxed">{alert.message}</p>
                    <div className="mt-2 flex gap-2">
                      <button className="text-[10px] bg-white border border-slate-200 px-2 py-1 rounded font-bold hover:bg-slate-50 text-slate-600 transition-colors">Dismiss</button>
                      {alert.type === 'critical' && (
                        <button className="text-[10px] bg-rose-50 text-rose-700 px-2 py-1 rounded font-bold hover:bg-rose-100 transition-colors">Terminate Test</button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          
          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            <button className="w-full py-2.5 bg-white border border-slate-200 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
              View All Logs
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
