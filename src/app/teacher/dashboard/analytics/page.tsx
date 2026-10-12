'use client'

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart2, TrendingUp, TrendingDown, Users, Target, 
  Award, AlertTriangle, Search, ChevronRight, Filter, Download
} from 'lucide-react';
import Link from 'next/link';

export default function StudentAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('This Month');
  const [searchQuery, setSearchQuery] = useState('');
  const [testType, setTestType] = useState('All');

  // Realistic Dummy Data for the Vercel Demo
  // If testType is 'Mock', numbers change slightly. If 'Live', they change again to simulate filtering.
  const stats = [
    { title: "Total Students", value: testType === 'Live' ? "310" : "342", trend: "+12% vs last month", icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
    { title: "Avg. Batch Score", value: testType === 'Mock' ? "74.1%" : testType === 'Live' ? "78.2%" : "76.4%", trend: "+2.1% improvement", icon: Target, color: "text-emerald-600", bg: "bg-emerald-100" },
    { title: "Completion Rate", value: testType === 'Live' ? "95%" : "89%", trend: "High engagement", icon: BarChart2, color: "text-indigo-600", bg: "bg-indigo-100" },
    { title: "Cheat Warnings", value: testType === 'Live' ? "24" : "14", trend: "-5% vs last month", icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-100" },
  ];

  const topStudents = [
    { id: 1, name: "Rahul Sharma", email: "rahul.s@testwise.com", score: 98, avatar: "RS", trend: "up" },
    { id: 2, name: "Priya Patel", email: "priya.p@testwise.com", score: 95, avatar: "PP", trend: "up" },
    { id: 3, name: "Anand Kumar", email: "anand.k@testwise.com", score: 92, avatar: "AK", trend: "same" },
    { id: 4, name: "Sneha Reddy", email: "sneha.r@testwise.com", score: 91, avatar: "SR", trend: "up" },
  ];

  const needsAttention = [
    { id: 5, name: "Kiran Verma", issue: "Failed last 2 Aptitude tests", score: 45, avatar: "KV" },
    { id: 6, name: "Vikram Singh", issue: "Multiple tab-switch warnings", score: 52, avatar: "VS" },
    { id: 7, name: "Neha Gupta", issue: "Struggling in Verbal section", score: 48, avatar: "NG" },
  ];

  const barChartData = [
    { label: "Week 1", score: 65 },
    { label: "Week 2", score: 72 },
    { label: "Week 3", score: 68 },
    { label: "Week 4", score: 76 },
    { label: "Week 5", score: testType === 'Live' ? 79 : 82 },
    { label: "Week 6", score: testType === 'Mock' ? 81 : 78 },
  ];

  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'Score', 'Status'];
    const csvContent = [
      headers.join(','),
      ...topStudents.map(s => `${s.name},${s.email},${s.score}%,Excellent`)
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'student_analytics_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Student Analytics</h1>
          <p className="text-slate-500 mt-1 font-medium">Track performance and identify trends across the batch.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 font-bold transition-colors shadow-sm">
            <Download size={16} /> Export CSV
          </button>
          
          <select 
            value={testType}
            onChange={(e) => setTestType(e.target.value)}
            className="px-4 py-2 bg-emerald-50 border-none text-emerald-700 rounded-xl font-bold cursor-pointer outline-none focus:ring-2 ring-emerald-200"
          >
            <option value="All">Total (Mock + Live)</option>
            <option value="Mock">Mock Tests Only</option>
            <option value="Live">Live Tests Only</option>
          </select>

          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 bg-indigo-50 border-none text-indigo-700 rounded-xl font-bold cursor-pointer outline-none focus:ring-2 ring-indigo-200"
          >
            <option>This Week</option>
            <option>This Month</option>
            <option>Last 3 Months</option>
            <option>All Time</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, index) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            key={index}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon size={24} strokeWidth={2.5} />
              </div>
            </div>
            <div>
              <h3 className="text-slate-500 font-bold text-sm mb-1">{stat.title}</h3>
              <p className="text-3xl font-extrabold text-slate-900">{stat.value}</p>
              <p className="text-sm font-medium text-slate-400 mt-2">{stat.trend}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Chart Area */}
        <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-extrabold text-slate-900">Batch Performance Trend</h2>
            <div className="flex gap-2">
              <span className="flex items-center gap-1.5 text-sm font-bold text-slate-500"><div className="w-3 h-3 rounded-full bg-indigo-500"></div> Avg Score</span>
            </div>
          </div>
          
          {/* Custom CSS Bar Chart */}
          <div className="h-64 flex items-end justify-between gap-2 md:gap-4 pt-4 border-b border-slate-100">
            {barChartData.map((data, index) => (
              <div key={index} className="flex flex-col items-center gap-3 flex-1 group h-full justify-end">
                <div className="w-full relative flex items-end justify-center h-[200px]">
                  {/* Tooltip */}
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs font-bold py-1 px-2 rounded-lg pointer-events-none z-10 whitespace-nowrap">
                    {data.score}%
                  </div>
                  {/* Bar */}
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${data.score}%` }}
                    transition={{ duration: 1, delay: index * 0.1, type: 'spring' }}
                    className="w-full max-w-[48px] bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-xl group-hover:from-indigo-500 group-hover:to-indigo-300 transition-colors"
                  ></motion.div>
                </div>
                <span className="text-xs font-bold text-slate-400">{data.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Needs Attention Panel */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="text-amber-500" size={20} /> Needs Attention
            </h2>
          </div>
          
          <div className="flex-1 space-y-4">
            {needsAttention.map((student, index) => (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + (index * 0.1) }}
                key={student.id} 
                className="flex items-start gap-4 p-4 rounded-2xl bg-amber-50/50 border border-amber-100/50 hover:bg-amber-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-amber-200 text-amber-700 flex items-center justify-center font-bold text-sm shrink-0">
                  {student.avatar}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{student.name}</h4>
                  <p className="text-xs font-medium text-amber-700 mt-0.5">{student.issue}</p>
                  <p className="text-xs font-bold text-slate-500 mt-2">Avg Score: <span className="text-red-500">{student.score}%</span></p>
                </div>
              </motion.div>
            ))}
          </div>
          
          <Link href="/teacher/dashboard/live-monitoring" className="block text-center w-full mt-6 py-3 rounded-xl bg-slate-50 text-slate-600 font-bold text-sm hover:bg-slate-100 transition-colors">
            View All Alerts in Monitoring
          </Link>
        </div>

      </div>

      {/* Top Performers Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mt-6">
        <div className="p-6 md:p-8 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Award className="text-emerald-500" size={24} /> Top Performers
          </h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search students..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium w-full sm:w-64"
              />
            </div>
            <button className="p-2 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors">
              <Filter size={18} />
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Overall Score</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tests Taken</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topStudents.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.email.toLowerCase().includes(searchQuery.toLowerCase())).map((student, idx) => (
                <motion.tr 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 + (idx * 0.05) }}
                  key={student.id} 
                  className="hover:bg-slate-50/50 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-blue-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                        {student.avatar}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{student.name}</p>
                        <p className="text-xs text-slate-500 font-medium">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-emerald-600">{student.score}%</span>
                      {student.trend === 'up' ? <TrendingUp size={14} className="text-emerald-500" /> : <div className="w-3 h-0.5 bg-slate-300"></div>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-700">12 / 12</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">Excellent</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href="/teacher/dashboard/analytics" className="text-indigo-600 font-bold text-sm hover:text-indigo-800 flex items-center justify-end gap-1 w-full opacity-0 group-hover:opacity-100 transition-opacity">
                      Profile <ChevronRight size={16} />
                    </Link>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
