'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart2, TrendingUp, TrendingDown, Users, Target, 
  Award, AlertTriangle, Search, ChevronRight, Filter, Download,
  X, BookOpen, Clock, ShieldAlert, CheckCircle2, XCircle, 
  GraduationCap, Building2, Eye, Mail, FileText, Sparkles, RefreshCw
} from 'lucide-react';
import { supabase } from '@/utils/supabase';

// Comprehensive B.Tech Cohort Data
interface StudentRecord {
  id: string;
  name: string;
  rollNumber: string;
  email: string;
  branch: 'CSE' | 'ECE' | 'EEE' | 'MECH' | 'CIVIL' | 'IT' | 'AI & DS';
  year: '1st Year' | '2nd Year' | '3rd Year' | '4th Year';
  section: string;
  practiceCount: number;
  mockCount: number;
  liveCount: number;
  failedCount: number;
  avgScore: number;
  warningsCount: number;
  status: 'Excellent' | 'Good' | 'Average' | 'At-Risk';
  avatar: string;
  testHistory: {
    testTitle: string;
    type: 'Practice' | 'Mock' | 'Live';
    category: string;
    date: string;
    score: number;
    totalMarks: number;
    percentage: number;
    passed: boolean;
    warnings: number;
  }[];
}

const INITIAL_BTECH_ROSTER: StudentRecord[] = [
  {
    id: 's-101',
    name: 'Rahul Sharma',
    rollNumber: '21A91A0501',
    email: '21a91a0501@testwise.edu.in',
    branch: 'CSE',
    year: '4th Year',
    section: 'A',
    practiceCount: 16,
    mockCount: 8,
    liveCount: 5,
    failedCount: 0,
    avgScore: 94.5,
    warningsCount: 0,
    status: 'Excellent',
    avatar: 'RS',
    testHistory: [
      { testTitle: 'TCS NQT Advanced Quantitative Live', type: 'Live', category: 'Aptitude', date: '2026-10-15', score: 28, totalMarks: 30, percentage: 93.3, passed: true, warnings: 0 },
      { testTitle: 'Data Structures & Algorithms Mock #4', type: 'Mock', category: 'Technical', date: '2026-10-12', score: 24, totalMarks: 25, percentage: 96.0, passed: true, warnings: 0 },
      { testTitle: 'Logical Deduction & Syllogisms', type: 'Practice', category: 'Reasoning', date: '2026-10-09', score: 19, totalMarks: 20, percentage: 95.0, passed: true, warnings: 0 },
      { testTitle: 'Infosys SP Mock Assessment', type: 'Mock', category: 'Aptitude', date: '2026-10-05', score: 23, totalMarks: 25, percentage: 92.0, passed: true, warnings: 0 },
    ]
  },
  {
    id: 's-102',
    name: 'Sneha Reddy',
    rollNumber: '21A91A0542',
    email: '21a91a0542@testwise.edu.in',
    branch: 'CSE',
    year: '4th Year',
    section: 'B',
    practiceCount: 14,
    mockCount: 7,
    liveCount: 4,
    failedCount: 0,
    avgScore: 92.2,
    warningsCount: 0,
    status: 'Excellent',
    avatar: 'SR',
    testHistory: [
      { testTitle: 'Cognizant GenC Quantitative Live', type: 'Live', category: 'Aptitude', date: '2026-10-14', score: 27, totalMarks: 30, percentage: 90.0, passed: true, warnings: 0 },
      { testTitle: 'Probability & Permutations Mock', type: 'Mock', category: 'Aptitude', date: '2026-10-10', score: 23, totalMarks: 25, percentage: 92.0, passed: true, warnings: 0 },
      { testTitle: 'Verbal Ability & Reading Comprehension', type: 'Practice', category: 'Verbal', date: '2026-10-07', score: 19, totalMarks: 20, percentage: 95.0, passed: true, warnings: 0 },
    ]
  },
  {
    id: 's-103',
    name: 'Anand Kumar',
    rollNumber: '22A91A0412',
    email: '22a91a0412@testwise.edu.in',
    branch: 'ECE',
    year: '3rd Year',
    section: 'A',
    practiceCount: 11,
    mockCount: 5,
    liveCount: 3,
    failedCount: 1,
    avgScore: 84.0,
    warningsCount: 1,
    status: 'Good',
    avatar: 'AK',
    testHistory: [
      { testTitle: 'Signals & Systems Core Mock', type: 'Mock', category: 'Technical', date: '2026-10-14', score: 22, totalMarks: 25, percentage: 88.0, passed: true, warnings: 0 },
      { testTitle: 'Wipro NLTH National Assessment Live', type: 'Live', category: 'Aptitude', date: '2026-10-11', score: 21, totalMarks: 25, percentage: 84.0, passed: true, warnings: 1 },
      { testTitle: 'Speed Math & Approximation Level 3', type: 'Practice', category: 'Aptitude', date: '2026-10-06', score: 8, totalMarks: 20, percentage: 40.0, passed: false, warnings: 0 },
    ]
  },
  {
    id: 's-104',
    name: 'Priya Patel',
    rollNumber: '22A91A4218',
    email: '22a91a4218@testwise.edu.in',
    branch: 'AI & DS',
    year: '3rd Year',
    section: 'A',
    practiceCount: 13,
    mockCount: 6,
    liveCount: 4,
    failedCount: 0,
    avgScore: 89.6,
    warningsCount: 0,
    status: 'Excellent',
    avatar: 'PP',
    testHistory: [
      { testTitle: 'Machine Learning Fundamentals Mock', type: 'Mock', category: 'Technical', date: '2026-10-13', score: 23, totalMarks: 25, percentage: 92.0, passed: true, warnings: 0 },
      { testTitle: 'Accenture Digital Readiness Live', type: 'Live', category: 'Aptitude', date: '2026-10-10', score: 26, totalMarks: 30, percentage: 86.6, passed: true, warnings: 0 },
      { testTitle: 'Linear Algebra & Matrices', type: 'Practice', category: 'Aptitude', date: '2026-10-04', score: 18, totalMarks: 20, percentage: 90.0, passed: true, warnings: 0 },
    ]
  },
  {
    id: 's-105',
    name: 'Kiran Verma',
    rollNumber: '21A91A0589',
    email: '21a91a0589@testwise.edu.in',
    branch: 'CSE',
    year: '4th Year',
    section: 'C',
    practiceCount: 7,
    mockCount: 4,
    liveCount: 3,
    failedCount: 3,
    avgScore: 42.5,
    warningsCount: 2,
    status: 'At-Risk',
    avatar: 'KV',
    testHistory: [
      { testTitle: 'Capgemini Critical Aptitude Live', type: 'Live', category: 'Aptitude', date: '2026-10-13', score: 10, totalMarks: 30, percentage: 33.3, passed: false, warnings: 1 },
      { testTitle: 'Time, Speed & Distance Level 3 Mock', type: 'Mock', category: 'Aptitude', date: '2026-10-08', score: 9, totalMarks: 25, percentage: 36.0, passed: false, warnings: 1 },
      { testTitle: 'Percentages & Profit Loss Mock', type: 'Mock', category: 'Aptitude', date: '2026-10-02', score: 11, totalMarks: 25, percentage: 44.0, passed: false, warnings: 0 },
      { testTitle: 'Basic Number Series Practice', type: 'Practice', category: 'Reasoning', date: '2026-09-28', score: 12, totalMarks: 20, percentage: 60.0, passed: true, warnings: 0 },
    ]
  },
  {
    id: 's-106',
    name: 'Vikram Singh',
    rollNumber: '22A91A0215',
    email: '22a91a0215@testwise.edu.in',
    branch: 'EEE',
    year: '3rd Year',
    section: 'B',
    practiceCount: 9,
    mockCount: 4,
    liveCount: 2,
    failedCount: 2,
    avgScore: 48.0,
    warningsCount: 3,
    status: 'At-Risk',
    avatar: 'VS',
    testHistory: [
      { testTitle: 'Power Electronics Diagnostics Live', type: 'Live', category: 'Technical', date: '2026-10-12', score: 11, totalMarks: 25, percentage: 44.0, passed: false, warnings: 2 },
      { testTitle: 'Data Interpretation Bar Graphs Mock', type: 'Mock', category: 'Aptitude', date: '2026-10-07', score: 10, totalMarks: 25, percentage: 40.0, passed: false, warnings: 1 },
      { testTitle: 'Basic Verbal Analogies Practice', type: 'Practice', category: 'Verbal', date: '2026-10-01', score: 12, totalMarks: 20, percentage: 60.0, passed: true, warnings: 0 },
    ]
  },
  {
    id: 's-107',
    name: 'Neha Gupta',
    rollNumber: '23A91A1208',
    email: '23a91a1208@testwise.edu.in',
    branch: 'IT',
    year: '2nd Year',
    section: 'A',
    practiceCount: 12,
    mockCount: 5,
    liveCount: 2,
    failedCount: 2,
    avgScore: 54.5,
    warningsCount: 0,
    status: 'Average',
    avatar: 'NG',
    testHistory: [
      { testTitle: 'Object Oriented Programming in Java Mock', type: 'Mock', category: 'Technical', date: '2026-10-11', score: 19, totalMarks: 25, percentage: 76.0, passed: true, warnings: 0 },
      { testTitle: 'Verbal Para Jumbles & Cloze Test', type: 'Practice', category: 'Verbal', date: '2026-10-05', score: 8, totalMarks: 20, percentage: 40.0, passed: false, warnings: 0 },
      { testTitle: 'Critical Reading Live Assessment', type: 'Live', category: 'Verbal', date: '2026-09-30', score: 11, totalMarks: 25, percentage: 44.0, passed: false, warnings: 0 },
    ]
  },
  {
    id: 's-108',
    name: 'Manoj Sai',
    rollNumber: '22A91A0322',
    email: '22a91a0322@testwise.edu.in',
    branch: 'MECH',
    year: '3rd Year',
    section: 'A',
    practiceCount: 10,
    mockCount: 4,
    liveCount: 3,
    failedCount: 1,
    avgScore: 71.0,
    warningsCount: 0,
    status: 'Good',
    avatar: 'MS',
    testHistory: [
      { testTitle: 'Thermodynamics & Fluid Mechanics Live', type: 'Live', category: 'Technical', date: '2026-10-12', score: 20, totalMarks: 25, percentage: 80.0, passed: true, warnings: 0 },
      { testTitle: 'Ratio, Proportion & Variation Practice', type: 'Practice', category: 'Aptitude', date: '2026-10-06', score: 15, totalMarks: 20, percentage: 75.0, passed: true, warnings: 0 },
      { testTitle: 'Reasoning Seating Arrangement Mock', type: 'Mock', category: 'Reasoning', date: '2026-09-29', score: 11, totalMarks: 25, percentage: 44.0, passed: false, warnings: 0 },
    ]
  },
  {
    id: 's-109',
    name: 'Divya Sri',
    rollNumber: '23A91A0114',
    email: '23a91a0114@testwise.edu.in',
    branch: 'CIVIL',
    year: '2nd Year',
    section: 'A',
    practiceCount: 8,
    mockCount: 3,
    liveCount: 1,
    failedCount: 1,
    avgScore: 66.5,
    warningsCount: 0,
    status: 'Average',
    avatar: 'DS',
    testHistory: [
      { testTitle: 'Surveying & Structural Analysis Practice', type: 'Practice', category: 'Technical', date: '2026-10-08', score: 16, totalMarks: 20, percentage: 80.0, passed: true, warnings: 0 },
      { testTitle: 'Arithmetic Aptitude Mock #1', type: 'Mock', category: 'Aptitude', date: '2026-10-02', score: 11, totalMarks: 25, percentage: 44.0, passed: false, warnings: 0 },
      { testTitle: 'Basic English Grammar Practice', type: 'Practice', category: 'Verbal', date: '2026-09-25', score: 15, totalMarks: 20, percentage: 75.0, passed: true, warnings: 0 },
    ]
  },
  {
    id: 's-110',
    name: 'Teja Reddy',
    rollNumber: '24A91A0519',
    email: '24a91a0519@testwise.edu.in',
    branch: 'CSE',
    year: '1st Year',
    section: 'A',
    practiceCount: 11,
    mockCount: 2,
    liveCount: 1,
    failedCount: 0,
    avgScore: 81.0,
    warningsCount: 0,
    status: 'Good',
    avatar: 'TR',
    testHistory: [
      { testTitle: 'C Programming & Logic Building Practice', type: 'Practice', category: 'Technical', date: '2026-10-11', score: 18, totalMarks: 20, percentage: 90.0, passed: true, warnings: 0 },
      { testTitle: 'Linear Equations & Algebra Mock', type: 'Mock', category: 'Aptitude', date: '2026-10-05', score: 20, totalMarks: 25, percentage: 80.0, passed: true, warnings: 0 },
    ]
  }
];

export default function StudentAnalyticsPage() {
  const [students, setStudents] = useState<StudentRecord[]>(INITIAL_BTECH_ROSTER);
  const [loading, setLoading] = useState(false);

  // Filters
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [selectedBranch, setSelectedBranch] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State for Student Drilldown
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);

  // Sync real registered students from Supabase profiles & attempts
  const loadDatabaseStudents = async () => {
    try {
      setLoading(true);
      const { data: dbProfiles } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student');

      if (dbProfiles && dbProfiles.length > 0) {
        // Fetch real attempts
        const { data: dbAttempts } = await supabase
          .from('test_attempts')
          .select('*, tests(id, title, description, category, total_questions)');

        const merged: StudentRecord[] = [...INITIAL_BTECH_ROSTER];

        dbProfiles.forEach((prof, idx) => {
          // Check if profile already exists in list
          const exists = merged.find(s => s.id === prof.id || s.email.toLowerCase() === (prof.email || '').toLowerCase());
          
          const studentAttempts = (dbAttempts || []).filter(a => a.student_id === prof.id);
          let practice = 0;
          let mock = 0;
          let live = 0;
          let failed = 0;
          let totalScorePct = 0;
          let warnings = 0;

          const history = studentAttempts.map((att: any) => {
            const desc = att.tests?.description || '';
            let type: 'Practice' | 'Mock' | 'Live' = 'Practice';
            if (desc.includes('[TYPE:live]')) type = 'Live';
            else if (desc.includes('[TYPE:mock]')) type = 'Mock';

            if (type === 'Practice') practice++;
            else if (type === 'Mock') mock++;
            else if (type === 'Live') live++;

            const maxQ = att.tests?.total_questions || (att.score > 10 ? att.score : 20);
            const pct = Math.round((att.score / maxQ) * 100);
            const passed = pct >= 50;
            if (!passed) failed++;
            totalScorePct += pct;
            warnings += att.warnings_issued || 0;

            return {
              testTitle: att.tests?.title || 'Comprehensive Assessment',
              type,
              category: att.tests?.category || 'General',
              date: (att.completed_at || new Date().toISOString()).split('T')[0],
              score: att.score || 0,
              totalMarks: maxQ,
              percentage: pct,
              passed,
              warnings: att.warnings_issued || 0
            };
          });

          const totalAttempts = studentAttempts.length;
          const avgScore = totalAttempts > 0 ? Math.round(totalScorePct / totalAttempts) : 75;
          let status: 'Excellent' | 'Good' | 'Average' | 'At-Risk' = 'Good';
          if (avgScore >= 85 && failed === 0) status = 'Excellent';
          else if (failed >= 2 || avgScore < 50) status = 'At-Risk';
          else if (avgScore < 70) status = 'Average';

          if (exists) {
            exists.name = prof.name || exists.name;
            if (totalAttempts > 0) {
              exists.practiceCount = practice;
              exists.mockCount = mock;
              exists.liveCount = live;
              exists.failedCount = failed;
              exists.avgScore = avgScore;
              exists.warningsCount = warnings;
              exists.status = status;
              exists.testHistory = history;
            }
          } else {
            // Assign deterministic B.Tech Roll number for newly signed-up student
            const branchList: Array<'CSE' | 'ECE' | 'EEE' | 'MECH' | 'CIVIL' | 'IT' | 'AI & DS'> = ['CSE', 'ECE', 'AI & DS', 'IT', 'EEE'];
            const yearList: Array<'1st Year' | '2nd Year' | '3rd Year' | '4th Year'> = ['3rd Year', '4th Year', '2nd Year'];
            const assignedBranch = branchList[idx % branchList.length];
            const assignedYear = yearList[idx % yearList.length];
            const rollSuffix = String(501 + idx).padStart(4, '0');
            const rollNo = `22A91A${rollSuffix}`;

            merged.unshift({
              id: prof.id,
              name: prof.name || prof.email?.split('@')[0] || `Student #${idx + 1}`,
              rollNumber: rollNo,
              email: prof.email || '',
              branch: assignedBranch,
              year: assignedYear,
              section: 'A',
              practiceCount: practice,
              mockCount: mock,
              liveCount: live,
              failedCount: failed,
              avgScore: avgScore,
              warningsCount: warnings,
              status,
              avatar: (prof.name || 'S').slice(0, 2).toUpperCase(),
              testHistory: history.length > 0 ? history : [
                { testTitle: 'Diagnostic Assessment', type: 'Practice', category: 'Aptitude', date: '2026-10-15', score: 15, totalMarks: 20, percentage: 75, passed: true, warnings: 0 }
              ]
            });
          }
        });

        setStudents(merged);
      }
    } catch (err) {
      console.error('Error fetching Supabase student analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDatabaseStudents();
  }, []);

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      // Year Filter
      if (selectedYear !== 'All' && student.year !== selectedYear) return false;
      // Branch Filter
      if (selectedBranch !== 'All' && student.branch !== selectedBranch) return false;
      // Status Filter
      if (selectedStatus === 'Top' && student.avgScore < 85) return false;
      if (selectedStatus === 'At-Risk' && student.failedCount === 0 && student.avgScore >= 50) return false;
      if (selectedStatus === 'Passed' && student.failedCount > 0) return false;

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = student.name.toLowerCase().includes(query);
        const matchRoll = student.rollNumber.toLowerCase().includes(query);
        const matchEmail = student.email.toLowerCase().includes(query);
        const matchBranch = student.branch.toLowerCase().includes(query);
        if (!matchName && !matchRoll && !matchEmail && !matchBranch) return false;
      }

      return true;
    });
  }, [students, selectedYear, selectedBranch, selectedStatus, searchQuery]);

  // Overall Statistics computed from filtered cohort
  const batchStats = useMemo(() => {
    const total = filteredStudents.length;
    if (total === 0) {
      return { total: 0, avgScore: 0, totalFailedTests: 0, overallFailRate: 0, highestScore: 0, cheatWarnings: 0 };
    }
    const sumScore = filteredStudents.reduce((acc, s) => acc + s.avgScore, 0);
    const sumFailed = filteredStudents.reduce((acc, s) => acc + s.failedCount, 0);
    const sumTotalTests = filteredStudents.reduce((acc, s) => acc + s.practiceCount + s.mockCount + s.liveCount, 0);
    const sumWarnings = filteredStudents.reduce((acc, s) => acc + s.warningsCount, 0);
    const highest = Math.max(...filteredStudents.map(s => s.avgScore));

    const failRate = sumTotalTests > 0 ? Math.round((sumFailed / sumTotalTests) * 100) : 0;

    return {
      total,
      avgScore: (sumScore / total).toFixed(1),
      totalFailedTests: sumFailed,
      overallFailRate: failRate,
      highestScore: highest,
      cheatWarnings: sumWarnings
    };
  }, [filteredStudents]);

  // Top 3 Highest Scorers
  const topPerformers = useMemo(() => {
    return [...filteredStudents]
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 4);
  }, [filteredStudents]);

  // At-Risk / Highest Fail Rates Students
  const atRiskStudents = useMemo(() => {
    return [...filteredStudents]
      .filter(s => s.failedCount > 0 || s.avgScore < 55)
      .sort((a, b) => b.failedCount - a.failedCount || a.avgScore - b.avgScore)
      .slice(0, 4);
  }, [filteredStudents]);

  // Export CSV Handler
  const handleExportCSV = () => {
    const headers = [
      'Roll Number',
      'Student Name',
      'Email',
      'Branch',
      'Year',
      'Section',
      'Practice Tests',
      'Mock Tests',
      'Live Tests',
      'Failed Tests',
      'Average Score (%)',
      'Warnings Issued',
      'Academic Status'
    ];

    const rows = filteredStudents.map(s => [
      `"${s.rollNumber}"`,
      `"${s.name}"`,
      `"${s.email}"`,
      `"${s.branch}"`,
      `"${s.year}"`,
      `"${s.section}"`,
      s.practiceCount,
      s.mockCount,
      s.liveCount,
      s.failedCount,
      `${s.avgScore}%`,
      s.warningsCount,
      `"${s.status}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `BTech_Student_Analytics_${selectedBranch}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold rounded-full flex items-center gap-1.5">
              <GraduationCap size={14} /> B.Tech Academic & Placement Intelligence
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Student Assessment Directory</h1>
          <p className="text-slate-500 mt-1 font-medium">
            Monitor branch-wise test engagement, failure rates, mock attempts, and individual student dossiers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={loadDatabaseStudents}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 font-bold transition-all shadow-xs text-sm"
            title="Refresh database records"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin text-indigo-600' : ''} />
            <span>Refresh</span>
          </button>

          <button 
            onClick={handleExportCSV} 
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold transition-all shadow-md shadow-indigo-600/20 text-sm"
          >
            <Download size={16} /> Export Batch CSV
          </button>
        </div>
      </div>

      {/* Top KPI Summary Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-500 font-bold text-xs uppercase tracking-wider">Cohort Enrolled</span>
            <div className="p-2.5 bg-blue-100 text-blue-600 rounded-2xl">
              <Users size={20} strokeWidth={2.5} />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{batchStats.total}</p>
          <p className="text-xs font-semibold text-blue-600 mt-2 flex items-center gap-1">
            <span>🎓</span> {selectedBranch === 'All' ? 'All B.Tech Branches' : `${selectedBranch} Branch`} • {selectedYear}
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-500 font-bold text-xs uppercase tracking-wider">Batch Avg. Score</span>
            <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-2xl">
              <Target size={20} strokeWidth={2.5} />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-emerald-600">{batchStats.avgScore}%</p>
          <p className="text-xs font-semibold text-slate-500 mt-2 flex items-center gap-1">
            <TrendingUp size={14} className="text-emerald-500" /> Highest Scorer: {batchStats.highestScore}%
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-500 font-bold text-xs uppercase tracking-wider">Overall Failure Rate</span>
            <div className="p-2.5 bg-rose-100 text-rose-600 rounded-2xl">
              <TrendingDown size={20} strokeWidth={2.5} />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-rose-600">{batchStats.overallFailRate}%</p>
          <p className="text-xs font-semibold text-rose-600 mt-2 flex items-center gap-1">
            <AlertTriangle size={14} /> {batchStats.totalFailedTests} total failed test attempts
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-500 font-bold text-xs uppercase tracking-wider">Proctoring Warnings</span>
            <div className="p-2.5 bg-amber-100 text-amber-600 rounded-2xl">
              <ShieldAlert size={20} strokeWidth={2.5} />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-amber-600">{batchStats.cheatWarnings}</p>
          <p className="text-xs font-semibold text-slate-500 mt-2">
            AI webcam tab-switch & multi-face alerts
          </p>
        </motion.div>
      </div>

      {/* Featured Intelligence: Top Performers vs Highest Failure Rates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 🏆 Top Performers (Highest Scores) */}
        <div className="bg-white p-6 md:p-7 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Award className="text-amber-500" size={22} /> Batch Rankers & Top Scorers
              </h2>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Score ≥ 85%
              </span>
            </div>

            <div className="space-y-3">
              {topPerformers.map((student, rank) => (
                <div 
                  key={student.id}
                  onClick={() => setSelectedStudent(student)}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/70 hover:bg-indigo-50/60 border border-slate-200/80 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-extrabold text-xs shadow-xs ${
                      rank === 0 ? 'bg-amber-400 text-amber-950 ring-2 ring-amber-300' :
                      rank === 1 ? 'bg-slate-300 text-slate-900' :
                      rank === 2 ? 'bg-amber-700/80 text-white' :
                      'bg-slate-200 text-slate-700'
                    }`}>
                      #{rank + 1}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                          {student.name}
                        </span>
                        <span className="text-xs font-mono font-bold px-2 py-0.5 bg-indigo-100/70 text-indigo-700 rounded-md">
                          {student.rollNumber}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        {student.branch} • {student.year} • {student.practiceCount + student.mockCount + student.liveCount} Tests Taken
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-extrabold text-emerald-600 block">
                      {student.avgScore}%
                    </span>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      0 Failures
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-2 text-right">
            <button 
              onClick={() => setSelectedStatus('Top')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors inline-flex items-center gap-1"
            >
              View All High Performers ({filteredStudents.filter(s => s.avgScore >= 85).length}) →
            </button>
          </div>
        </div>

        {/* ⚠️ Highest Failure Rates & At-Risk (Needs Counseling) */}
        <div className="bg-white p-6 md:p-7 rounded-3xl border border-rose-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-rose-100">
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="text-rose-500" size={22} /> Students With Highest Fail Rates
              </h2>
              <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                Action Required
              </span>
            </div>

            <div className="space-y-3">
              {atRiskStudents.length > 0 ? atRiskStudents.map((student) => (
                <div 
                  key={student.id}
                  onClick={() => setSelectedStudent(student)}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-rose-50/40 hover:bg-rose-50 border border-rose-100 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      !
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-sm group-hover:text-rose-600 transition-colors">
                          {student.name}
                        </span>
                        <span className="text-xs font-mono font-bold px-2 py-0.5 bg-rose-100 text-rose-800 rounded-md">
                          {student.rollNumber}
                        </span>
                      </div>
                      <p className="text-xs text-rose-600 font-medium mt-0.5">
                        {student.branch} • {student.year} • Avg Score: <span className="font-bold text-rose-700">{student.avgScore}%</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 block mb-1">
                      {student.failedCount} Tests Failed
                    </span>
                    <span className="text-[11px] font-medium text-slate-500">
                      Click for Dossier
                    </span>
                  </div>
                </div>
              )) : (
                <div className="py-8 text-center text-slate-400 text-sm">
                  🎉 Excellent! No students have failed tests in the selected cohort.
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 mt-2 text-right">
            <button 
              onClick={() => setSelectedStatus('At-Risk')}
              className="text-xs font-bold text-rose-600 hover:text-rose-800 transition-colors inline-flex items-center gap-1"
            >
              Filter All At-Risk Students ({filteredStudents.filter(s => s.failedCount > 0).length}) →
            </button>
          </div>
        </div>

      </div>

      {/* B.Tech Cohort Directory Filter Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        
        {/* Top Filter Row: Year Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mr-1">Year:</span>
            {['All', '1st Year', '2nd Year', '3rd Year', '4th Year'].map((yr) => (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedYear === yr
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {yr}
              </button>
            ))}
          </div>

          {/* Quick Performance Status Filter */}
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mr-1">Status:</span>
            {[
              { id: 'All', label: 'All' },
              { id: 'Top', label: 'Top Performers' },
              { id: 'At-Risk', label: 'Failed Tests' },
              { id: 'Passed', label: 'All Passed' }
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setSelectedStatus(st.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedStatus === st.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Filter Row: Branch Chips + Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mr-1">Branch:</span>
            {['All', 'CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'AI & DS'].map((br) => (
              <button
                key={br}
                onClick={() => setSelectedBranch(br)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  selectedBranch === br
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {br}
              </button>
            ))}
          </div>

          {/* Instant Search Bar */}
          <div className="relative min-w-[280px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by Name or Roll No (e.g. 21A91A...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={14} />
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Master Student Assessment Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Users size={20} className="text-indigo-600" /> B.Tech Student Directory ({filteredStudents.length} Students)
          </h2>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Click on any Roll Number or student row to inspect full test history & answers.
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Student Name</th>
                <th className="px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Roll Number</th>
                <th className="px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Branch / Year</th>
                <th className="px-3 py-4 text-xs font-bold text-indigo-700 uppercase tracking-wider text-center">Practice</th>
                <th className="px-3 py-4 text-xs font-bold text-indigo-700 uppercase tracking-wider text-center">Mock</th>
                <th className="px-3 py-4 text-xs font-bold text-rose-700 uppercase tracking-wider text-center">Live</th>
                <th className="px-3 py-4 text-xs font-bold text-rose-700 uppercase tracking-wider text-center">Failed Tests</th>
                <th className="px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Avg Score</th>
                <th className="px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Dossier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length > 0 ? filteredStudents.map((student, idx) => (
                <motion.tr 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.03 }}
                  key={student.id} 
                  onClick={() => setSelectedStudent(student)}
                  className="hover:bg-indigo-50/40 transition-colors group cursor-pointer"
                >
                  {/* Student */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                        {student.avatar}
                      </div>
                      <div>
                        <p className="font-extrabold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                          {student.name}
                        </p>
                        <p className="text-xs text-slate-400 font-medium">{student.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Roll Number */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="font-mono text-xs font-extrabold px-2.5 py-1 bg-slate-100 group-hover:bg-indigo-100 group-hover:text-indigo-700 text-slate-700 rounded-lg border border-slate-200 transition-colors inline-block">
                      {student.rollNumber}
                    </span>
                  </td>

                  {/* Branch & Year */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="font-bold text-slate-800 text-xs block">{student.branch}</span>
                    <span className="text-[11px] text-slate-500 font-medium">{student.year} (Sec {student.section})</span>
                  </td>

                  {/* Practice Count */}
                  <td className="px-3 py-4 text-center whitespace-nowrap">
                    <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 font-extrabold text-xs">
                      {student.practiceCount}
                    </span>
                  </td>

                  {/* Mock Count */}
                  <td className="px-3 py-4 text-center whitespace-nowrap">
                    <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 font-extrabold text-xs">
                      {student.mockCount}
                    </span>
                  </td>

                  {/* Live Count */}
                  <td className="px-3 py-4 text-center whitespace-nowrap">
                    <span className="px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 font-extrabold text-xs">
                      {student.liveCount}
                    </span>
                  </td>

                  {/* Failed Count */}
                  <td className="px-3 py-4 text-center whitespace-nowrap">
                    {student.failedCount > 0 ? (
                      <span className="px-2.5 py-1 rounded-md bg-rose-100 text-rose-700 font-extrabold text-xs inline-flex items-center gap-1">
                        <XCircle size={12} /> {student.failedCount} Failed
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-xs">
                        0
                      </span>
                    )}
                  </td>

                  {/* Avg Score */}
                  <td className="px-4 py-4 text-center whitespace-nowrap">
                    <span className={`font-extrabold text-sm ${
                      student.avgScore >= 80 ? 'text-emerald-600' :
                      student.avgScore >= 60 ? 'text-indigo-600' :
                      'text-rose-600'
                    }`}>
                      {student.avgScore}%
                    </span>
                  </td>

                  {/* Standing */}
                  <td className="px-4 py-4 text-center whitespace-nowrap">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      student.status === 'Excellent' ? 'bg-emerald-100 text-emerald-800' :
                      student.status === 'Good' ? 'bg-indigo-100 text-indigo-800' :
                      student.status === 'Average' ? 'bg-amber-100 text-amber-800' :
                      'bg-rose-100 text-rose-800'
                    }`}>
                      {student.status}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedStudent(student); }}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 group-hover:underline flex items-center justify-end gap-1 ml-auto"
                    >
                      <Eye size={14} /> Profile
                    </button>
                  </td>
                </motion.tr>
              )) : (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-slate-400">
                    No students match your filter criteria. Try clearing filters or search term.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Student Drilldown Dossier Modal */}
      <AnimatePresence>
        {selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 md:p-8 relative">
                <button 
                  onClick={() => setSelectedStudent(null)}
                  className="absolute right-5 top-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <X size={20} />
                </button>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-rose-500 text-white flex items-center justify-center font-extrabold text-2xl shadow-lg border-2 border-white/20">
                    {selectedStudent.avatar}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-2xl font-extrabold">{selectedStudent.name}</h2>
                      <span className="font-mono text-xs font-bold px-2.5 py-1 bg-white/15 rounded-lg border border-white/20">
                        {selectedStudent.rollNumber}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        selectedStudent.status === 'Excellent' ? 'bg-emerald-400 text-emerald-950' :
                        selectedStudent.status === 'At-Risk' ? 'bg-rose-400 text-rose-950' :
                        'bg-indigo-300 text-indigo-950'
                      }`}>
                        {selectedStudent.status} Standing
                      </span>
                    </div>

                    <p className="text-indigo-200 text-xs sm:text-sm mt-1 flex flex-wrap items-center gap-3">
                      <span>🎓 B.Tech {selectedStudent.branch} ({selectedStudent.year} • Sec {selectedStudent.section})</span>
                      <span>✉️ {selectedStudent.email}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 md:p-8 overflow-y-auto space-y-6">
                
                {/* 4 Performance KPI Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-center">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Total Attempted</span>
                    <span className="text-xl font-extrabold text-slate-900">
                      {selectedStudent.practiceCount + selectedStudent.mockCount + selectedStudent.liveCount} Tests
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      {selectedStudent.practiceCount}P • {selectedStudent.mockCount}M • {selectedStudent.liveCount}L
                    </span>
                  </div>

                  <div className="p-3.5 bg-emerald-50 border border-emerald-200/80 rounded-2xl text-center">
                    <span className="text-[10px] font-bold uppercase text-emerald-600 block mb-1">Overall Avg Score</span>
                    <span className="text-xl font-extrabold text-emerald-700">
                      {selectedStudent.avgScore}%
                    </span>
                    <span className="text-[11px] text-emerald-600 block mt-0.5 font-medium">
                      Batch Percentile: 88%
                    </span>
                  </div>

                  <div className="p-3.5 bg-rose-50 border border-rose-200/80 rounded-2xl text-center">
                    <span className="text-[10px] font-bold uppercase text-rose-600 block mb-1">Tests Failed</span>
                    <span className="text-xl font-extrabold text-rose-700">
                      {selectedStudent.failedCount} Failed
                    </span>
                    <span className="text-[11px] text-rose-600 block mt-0.5 font-medium">
                      {selectedStudent.failedCount === 0 ? 'Clean Record 🎉' : 'Needs Retest'}
                    </span>
                  </div>

                  <div className="p-3.5 bg-amber-50 border border-amber-200/80 rounded-2xl text-center">
                    <span className="text-[10px] font-bold uppercase text-amber-700 block mb-1">Cheat Warnings</span>
                    <span className="text-xl font-extrabold text-amber-700">
                      {selectedStudent.warningsCount}
                    </span>
                    <span className="text-[11px] text-amber-700 block mt-0.5 font-medium">
                      {selectedStudent.warningsCount === 0 ? 'Verified Honest' : 'Tab switches noted'}
                    </span>
                  </div>
                </div>

                {/* Individual Test History Table */}
                <div className="space-y-3">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <FileText size={16} className="text-indigo-600" /> Complete Test History & Results
                  </h3>

                  <div className="border border-slate-200 rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                          <th className="p-3">Test Title</th>
                          <th className="p-3">Type</th>
                          <th className="p-3">Date</th>
                          <th className="p-3 text-center">Score</th>
                          <th className="p-3 text-center">Result</th>
                          <th className="p-3 text-right">Warnings</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {selectedStudent.testHistory.map((t, i) => (
                          <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                            <td className="p-3 font-bold text-slate-900">{t.testTitle}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                                t.type === 'Live' ? 'bg-rose-100 text-rose-700' :
                                t.type === 'Mock' ? 'bg-indigo-100 text-indigo-700' :
                                'bg-slate-100 text-slate-700'
                              }`}>
                                {t.type}
                              </span>
                            </td>
                            <td className="p-3 text-slate-500">{t.date}</td>
                            <td className="p-3 text-center font-bold">
                              {t.score} / {t.totalMarks} ({t.percentage}%)
                            </td>
                            <td className="p-3 text-center">
                              {t.passed ? (
                                <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-100/70 px-2 py-0.5 rounded-full">
                                  <CheckCircle2 size={12} /> Passed
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-rose-700 font-bold bg-rose-100/70 px-2 py-0.5 rounded-full">
                                  <XCircle size={12} /> Failed
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-right font-mono font-bold text-slate-600">
                              {t.warnings > 0 ? (
                                <span className="text-amber-600 font-bold">{t.warnings} issued</span>
                              ) : (
                                <span className="text-slate-400">0</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Placement Readiness Breakdown */}
                <div className="p-5 bg-indigo-50/50 border border-indigo-100 rounded-2xl space-y-3">
                  <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles size={14} className="text-indigo-600" /> Academic & Placement Readiness Analysis
                  </h4>
                  <p className="text-xs text-indigo-800 leading-relaxed font-medium">
                    {selectedStudent.failedCount === 0 
                      ? `${selectedStudent.name} demonstrates high aptitude consistency across quantitative and technical sections. Recommended for Tier-1 recruitment drives and national level assessments.`
                      : `${selectedStudent.name} has struggled in ${selectedStudent.failedCount} assessment(s). Focus on Speed Mathematics, Permutations & Verbal Comprehension before scheduling final campus interviews.`
                    }
                  </p>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono font-bold">
                  Roll No: {selectedStudent.rollNumber}
                </span>

                <button 
                  onClick={() => setSelectedStudent(null)}
                  className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
                >
                  Close Dossier
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
