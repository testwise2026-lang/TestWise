'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, Plus, Building2, Search, Filter, 
  FileSpreadsheet, FileText, Upload, UserPlus, Users, 
  CheckCircle2, AlertCircle, Trash2, Download, ExternalLink, 
  ChevronRight, X, Edit2, ArrowUpDown, Sparkles, RefreshCw,
  Phone, Mail, MapPin, LayoutGrid, List, Check, ArrowRight,
  Send, ShieldCheck, UserCheck, Layers, BookOpen, Clock
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { supabase } from '@/utils/supabase';

// Data Interfaces
export interface Institution {
  id: string;
  name: string;
  code: string;
  location: string;
  type: 'Full-Time' | 'Part-Time / Visiting';
}

export interface StudentItem {
  id: string;
  rollNumber: string;
  name: string;
  email: string;
  phone: string;
  registeredOnApp?: boolean;
  testsCompleted?: number;
  avgScore?: number;
}

export interface ClassGroup {
  id: string;
  institutionId: string;
  stream: string;
  branch: string;
  year: string;
  section: string;
  students: StudentItem[];
  createdAt: string;
}

const DEFAULT_INSTITUTIONS: Institution[] = [
  {
    id: 'inst-1',
    name: 'Riverdale Institute of Technology',
    code: 'RIT',
    location: 'Hyderabad, Telangana',
    type: 'Full-Time'
  },
  {
    id: 'inst-2',
    name: 'Crescent Degree College',
    code: 'CDC',
    location: 'Vijayawada, AP',
    type: 'Part-Time / Visiting'
  }
];

const DEFAULT_CLASSES: ClassGroup[] = [
  {
    id: 'cls-1',
    institutionId: 'inst-1',
    stream: 'B.Tech',
    branch: 'Computer Science',
    year: 'Year 2',
    section: 'Section A',
    createdAt: new Date().toISOString(),
    students: [
      { id: 's-1', rollNumber: '23A91A0501', name: 'Aarav Patel', email: 'aarav.patel@rit.edu.in', phone: '+91 98490 12345', registeredOnApp: true, testsCompleted: 4, avgScore: 78 },
      { id: 's-2', rollNumber: '23A91A0502', name: 'Ananya Sharma', email: 'ananya.sharma@rit.edu.in', phone: '+91 98490 23456', registeredOnApp: true, testsCompleted: 5, avgScore: 84 },
      { id: 's-3', rollNumber: '23A91A0503', name: 'Bhavya Reddy', email: 'bhavya.reddy@rit.edu.in', phone: '+91 98490 34567', registeredOnApp: false, testsCompleted: 0, avgScore: 0 },
      { id: 's-4', rollNumber: '23A91A0504', name: 'Chaitanya Varma', email: 'chaitanya.v@rit.edu.in', phone: '+91 98490 45678', registeredOnApp: true, testsCompleted: 3, avgScore: 69 },
      { id: 's-5', rollNumber: '23A91A0505', name: 'Divya Sri', email: 'divyasri.k@rit.edu.in', phone: '+91 98490 56789', registeredOnApp: true, testsCompleted: 4, avgScore: 74 },
    ]
  },
  {
    id: 'cls-2',
    institutionId: 'inst-1',
    stream: 'B.Tech',
    branch: 'Computer Science',
    year: 'Year 2',
    section: 'Section B',
    createdAt: new Date().toISOString(),
    students: [
      { id: 's-6', rollNumber: '23A91A0561', name: 'Harish Rao', email: 'harish.rao@rit.edu.in', phone: '+91 97010 11223', registeredOnApp: true, testsCompleted: 3, avgScore: 72 },
      { id: 's-7', rollNumber: '23A91A0562', name: 'Ishita Sen', email: 'ishita.sen@rit.edu.in', phone: '+91 97010 22334', registeredOnApp: true, testsCompleted: 5, avgScore: 91 },
      { id: 's-8', rollNumber: '23A91A0563', name: 'Kiran Kumar', email: 'kiran.k@rit.edu.in', phone: '+91 97010 33445', registeredOnApp: false, testsCompleted: 0, avgScore: 0 }
    ]
  },
  {
    id: 'cls-3',
    institutionId: 'inst-1',
    stream: 'B.Tech',
    branch: 'Computer Science',
    year: 'Year 2',
    section: 'Section C',
    createdAt: new Date().toISOString(),
    students: [
      { id: 's-9', rollNumber: '23A91A05C1', name: 'Manish Varma', email: 'manish.v@rit.edu.in', phone: '+91 99890 44556', registeredOnApp: true, testsCompleted: 4, avgScore: 66 },
      { id: 's-10', rollNumber: '23A91A05C2', name: 'Naveen Raj', email: 'naveen.raj@rit.edu.in', phone: '+91 99890 55667', registeredOnApp: true, testsCompleted: 2, avgScore: 70 }
    ]
  },
  {
    id: 'cls-4',
    institutionId: 'inst-2',
    stream: 'B.Tech',
    branch: 'Information Technology',
    year: 'Year 3',
    section: 'Section A',
    createdAt: new Date().toISOString(),
    students: [
      { id: 's-11', rollNumber: '22A91A1201', name: 'Pooja Hegde', email: 'pooja.h@cdc.edu.in', phone: '+91 91234 56780', registeredOnApp: true, testsCompleted: 6, avgScore: 88 },
      { id: 's-12', rollNumber: '22A91A1202', name: 'Rohan Joshi', email: 'rohan.j@cdc.edu.in', phone: '+91 91234 56781', registeredOnApp: false, testsCompleted: 0, avgScore: 0 }
    ]
  }
];

export default function StudentsDirectoryPage() {
  // Institutions State
  const [institutions, setInstitutions] = useState<Institution[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('testwise_institutions');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return DEFAULT_INSTITUTIONS;
  });

  const [activeInstitutionId, setActiveInstitutionId] = useState<string>(() => {
    return institutions[0]?.id || 'inst-1';
  });

  // Classes State
  const [classes, setClasses] = useState<ClassGroup[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('testwise_classes');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return DEFAULT_CLASSES;
  });

  // Save to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('testwise_institutions', JSON.stringify(institutions));
    }
  }, [institutions]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('testwise_classes', JSON.stringify(classes));
    }
  }, [classes]);

  // Sync with real Supabase profiles & test attempts
  useEffect(() => {
    const syncWithDatabase = async () => {
      try {
        const { data: dbProfiles } = await supabase.from('profiles').select('*').eq('role', 'student');
        const { data: dbAttempts } = await supabase.from('test_attempts').select('student_id, score, total_marks');

        if (dbProfiles && dbProfiles.length > 0) {
          setClasses(prevClasses => {
            return prevClasses.map(cls => {
              const updatedStudents = cls.students.map(std => {
                const match = dbProfiles.find(p => 
                  (p.roll_number && p.roll_number.toLowerCase() === std.rollNumber.toLowerCase()) ||
                  (p.email && p.email.toLowerCase() === std.email.toLowerCase())
                );

                if (match) {
                  const studentAttempts = dbAttempts ? dbAttempts.filter(a => a.student_id === match.id) : [];
                  const testsCount = studentAttempts.length;
                  const avg = testsCount > 0 
                    ? Math.round(studentAttempts.reduce((acc, curr) => acc + ((curr.score / (curr.total_marks || 100)) * 100), 0) / testsCount)
                    : std.avgScore || 0;

                  return {
                    ...std,
                    name: match.name || std.name,
                    email: match.email || std.email,
                    phone: match.phone || std.phone || '',
                    registeredOnApp: true,
                    testsCompleted: testsCount > 0 ? testsCount : std.testsCompleted,
                    avgScore: testsCount > 0 ? avg : std.avgScore
                  };
                }
                return std;
              });
              return { ...cls, students: updatedStudents };
            });
          });
        }
      } catch (err) {
        console.error('Error syncing roster with database:', err);
      }
    };

    syncWithDatabase();
  }, []);

  // View Mode: 'table' | 'grid'
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Filter States
  const [selectedStream, setSelectedStream] = useState<string>('All');
  const [selectedBranch, setSelectedBranch] = useState<string>('All');
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [selectedSection, setSelectedSection] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddInstitutionOpen, setIsAddInstitutionOpen] = useState(false);
  const [viewingClass, setViewingClass] = useState<ClassGroup | null>(null);

  // New Institution Form State
  const [newInstName, setNewInstName] = useState('');
  const [newInstCode, setNewInstCode] = useState('');
  const [newInstLocation, setNewInstLocation] = useState('');
  const [newInstType, setNewInstType] = useState<'Full-Time' | 'Part-Time / Visiting'>('Part-Time / Visiting');

  // Create Student List Form State
  const [formInstId, setFormInstId] = useState('');
  const [formStream, setFormStream] = useState('B.Tech');
  const [formBranch, setFormBranch] = useState('Computer Science');
  const [formYear, setFormYear] = useState('Year 2');
  const [formSection, setFormSection] = useState('Section A');
  const [customBranchInput, setCustomBranchInput] = useState('');
  const [customSectionInput, setCustomSectionInput] = useState('');
  const [isCustomBranch, setIsCustomBranch] = useState(false);
  const [isCustomSection, setIsCustomSection] = useState(false);

  // Student Input Method: 'excel' | 'pdf' | 'manual'
  const [inputTab, setInputTab] = useState<'excel' | 'pdf' | 'manual'>('excel');
  const [parsedStudents, setParsedStudents] = useState<StudentItem[]>([]);
  const [manualRows, setManualRows] = useState<Array<{ rollNumber: string; name: string; email: string; phone: string }>>([
    { rollNumber: '', name: '', email: '', phone: '' },
    { rollNumber: '', name: '', email: '', phone: '' },
    { rollNumber: '', name: '', email: '', phone: '' }
  ]);
  const [bulkPasteText, setBulkPasteText] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // View Students Filter & Search
  const [rosterSearch, setRosterSearch] = useState('');
  const [rosterStatusFilter, setRosterStatusFilter] = useState<'All' | 'Active' | 'Pending'>('All');
  const [isAddSingleStudentOpen, setIsAddSingleStudentOpen] = useState(false);
  const [singleRoll, setSingleRoll] = useState('');
  const [singleName, setSingleName] = useState('');
  const [singleEmail, setSingleEmail] = useState('');
  const [singlePhone, setSinglePhone] = useState('');

  // When opening Create Modal
  const handleOpenCreateModal = () => {
    setFormInstId(activeInstitutionId);
    setParsedStudents([]);
    setUploadError('');
    setUploadSuccess('');
    setIsCreateModalOpen(true);
  };

  // Active institution details
  const currentInstitution = useMemo(() => {
    return institutions.find(i => i.id === activeInstitutionId) || institutions[0];
  }, [institutions, activeInstitutionId]);

  // Classes for active institution
  const institutionClasses = useMemo(() => {
    return classes.filter(c => c.institutionId === activeInstitutionId);
  }, [classes, activeInstitutionId]);

  // Overall Global Stats for Header Ticker
  const overallStats = useMemo(() => {
    let totalStudents = 0;
    let totalRegistered = 0;
    let totalClasses = classes.length;

    classes.forEach(cls => {
      totalStudents += cls.students.length;
      cls.students.forEach(s => {
        if (s.registeredOnApp) totalRegistered++;
      });
    });

    const adoptionRate = totalStudents > 0 ? Math.round((totalRegistered / totalStudents) * 100) : 0;
    return { totalStudents, totalRegistered, totalClasses, adoptionRate };
  }, [classes]);

  // Compute institution metrics
  const institutionMetrics = useMemo(() => {
    const map: Record<string, { streams: Set<string>; branches: Set<string>; years: Set<string>; sections: Set<string>; totalStudents: number; registeredCount: number }> = {};
    institutions.forEach(inst => {
      map[inst.id] = {
        streams: new Set(),
        branches: new Set(),
        years: new Set(),
        sections: new Set(),
        totalStudents: 0,
        registeredCount: 0
      };
    });

    classes.forEach(cls => {
      if (map[cls.institutionId]) {
        map[cls.institutionId].streams.add(cls.stream);
        map[cls.institutionId].branches.add(cls.branch);
        map[cls.institutionId].years.add(cls.year);
        map[cls.institutionId].sections.add(cls.section);
        map[cls.institutionId].totalStudents += cls.students.length;
        cls.students.forEach(s => {
          if (s.registeredOnApp) map[cls.institutionId].registeredCount++;
        });
      }
    });

    return map;
  }, [institutions, classes]);

  // Available Filter Options
  const availableStreams = useMemo(() => {
    return Array.from(new Set(institutionClasses.map(c => c.stream)));
  }, [institutionClasses]);

  const availableBranches = useMemo(() => {
    let list = institutionClasses;
    if (selectedStream !== 'All') list = list.filter(c => c.stream === selectedStream);
    return Array.from(new Set(list.map(c => c.branch)));
  }, [institutionClasses, selectedStream]);

  const availableYears = useMemo(() => {
    let list = institutionClasses;
    if (selectedStream !== 'All') list = list.filter(c => c.stream === selectedStream);
    if (selectedBranch !== 'All') list = list.filter(c => c.branch === selectedBranch);
    return Array.from(new Set(list.map(c => c.year)));
  }, [institutionClasses, selectedStream, selectedBranch]);

  const availableSections = useMemo(() => {
    let list = institutionClasses;
    if (selectedStream !== 'All') list = list.filter(c => c.stream === selectedStream);
    if (selectedBranch !== 'All') list = list.filter(c => c.branch === selectedBranch);
    if (selectedYear !== 'All') list = list.filter(c => c.year === selectedYear);
    return Array.from(new Set(list.map(c => c.section)));
  }, [institutionClasses, selectedStream, selectedBranch, selectedYear]);

  // Filtered Classes to display
  const displayedClasses = useMemo(() => {
    return institutionClasses.filter(c => {
      if (selectedStream !== 'All' && c.stream !== selectedStream) return false;
      if (selectedBranch !== 'All' && c.branch !== selectedBranch) return false;
      if (selectedYear !== 'All' && c.year !== selectedYear) return false;
      if (selectedSection !== 'All' && c.section !== selectedSection) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const hasSection = c.section.toLowerCase().includes(q);
        const hasBranch = c.branch.toLowerCase().includes(q);
        const hasStudent = c.students.some(s => 
          s.name.toLowerCase().includes(q) || 
          s.rollNumber.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          (s.phone && s.phone.toLowerCase().includes(q))
        );
        if (!hasSection && !hasBranch && !hasStudent) return false;
      }
      return true;
    });
  }, [institutionClasses, selectedStream, selectedBranch, selectedYear, selectedSection, searchQuery]);

  // Add New Institution Handler
  const handleAddInstitution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInstName.trim()) return;

    const newInst: Institution = {
      id: `inst-${Date.now()}`,
      name: newInstName.trim(),
      code: newInstCode.trim().toUpperCase() || 'COL',
      location: newInstLocation.trim() || 'India',
      type: newInstType
    };

    setInstitutions(prev => [...prev, newInst]);
    setActiveInstitutionId(newInst.id);
    setNewInstName('');
    setNewInstCode('');
    setNewInstLocation('');
    setIsAddInstitutionOpen(false);
  };

  // Download Sample Excel Template (With Phone Number)
  const handleDownloadSampleTemplate = () => {
    const sampleData = [
      { 'Roll Number': '23A91A0501', 'Full Name': 'Aarav Patel', 'Email': 'aarav.patel@college.edu', 'Phone Number': '+91 98490 12345' },
      { 'Roll Number': '23A91A0502', 'Full Name': 'Ananya Sharma', 'Email': 'ananya.sharma@college.edu', 'Phone Number': '+91 98490 23456' },
      { 'Roll Number': '23A91A0503', 'Full Name': 'Bhavya Reddy', 'Email': 'bhavya.reddy@college.edu', 'Phone Number': '+91 98490 34567' },
      { 'Roll Number': '23A91A0504', 'Full Name': 'Chaitanya Varma', 'Email': 'chaitanya.v@college.edu', 'Phone Number': '+91 98490 45678' }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students_Template');
    XLSX.writeFile(workbook, 'TestWise_Student_List_Template.xlsx');
  };

  // Excel / CSV File Parsing Handler with Phone Number detection
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('');
    setUploadSuccess('');
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        if (!rawJson || rawJson.length < 1) {
          setUploadError('Uploaded file is empty. Please upload a valid Excel or CSV.');
          return;
        }

        // Header detection
        let headerRowIndex = 0;
        let rollColIdx = -1;
        let nameColIdx = -1;
        let emailColIdx = -1;
        let phoneColIdx = -1;

        // Scan first 5 rows for header names
        for (let r = 0; r < Math.min(rawJson.length, 5); r++) {
          const row = rawJson[r];
          if (Array.isArray(row)) {
            row.forEach((cell, idx) => {
              const str = String(cell || '').trim().toLowerCase();
              if (str.includes('roll') || str.includes('hall ticket') || str.includes('reg') || str.includes('htno') || str.includes('id')) {
                rollColIdx = idx;
                headerRowIndex = r;
              }
              if (str.includes('name') || str.includes('student')) {
                nameColIdx = idx;
                headerRowIndex = r;
              }
              if (str.includes('email') || str.includes('mail')) {
                emailColIdx = idx;
              }
              if (str.includes('phone') || str.includes('mobile') || str.includes('contact') || str.includes('ph') || str.includes('cell') || str.includes('whatsapp')) {
                phoneColIdx = idx;
              }
            });
          }
          if (rollColIdx !== -1 && nameColIdx !== -1) break;
        }

        // Fallbacks if not auto-detected
        if (rollColIdx === -1) rollColIdx = 0;
        if (nameColIdx === -1) nameColIdx = 1;
        if (emailColIdx === -1) emailColIdx = 2;
        if (phoneColIdx === -1) phoneColIdx = 3;

        const extracted: StudentItem[] = [];
        const startRow = headerRowIndex + 1;

        for (let r = startRow; r < rawJson.length; r++) {
          const row = rawJson[r];
          if (!row || !Array.isArray(row)) continue;

          const rollVal = String(row[rollColIdx] || '').trim();
          const nameVal = String(row[nameColIdx] || '').trim();
          const emailVal = emailColIdx !== -1 && row[emailColIdx] ? String(row[emailColIdx]).trim() : '';
          const phoneVal = phoneColIdx !== -1 && row[phoneColIdx] ? String(row[phoneColIdx]).trim() : '';

          if (rollVal && rollVal.length >= 2) {
            extracted.push({
              id: `std-${Date.now()}-${r}`,
              rollNumber: rollVal.toUpperCase(),
              name: nameVal || `Student ${rollVal}`,
              email: emailVal || `${rollVal.toLowerCase()}@testwise.edu.in`,
              phone: phoneVal,
              registeredOnApp: false,
              testsCompleted: 0,
              avgScore: 0
            });
          }
        }

        if (extracted.length === 0) {
          setUploadError('Could not find student records. Ensure file has columns: Roll Number, Name, Email, Phone.');
        } else {
          setParsedStudents(extracted);
          setUploadSuccess(`Successfully extracted ${extracted.length} students (with phone numbers) from ${file.name}!`);
        }
      } catch (err: any) {
        console.error('File parsing error:', err);
        setUploadError(`Failed to parse file: ${err.message || 'Unknown format'}`);
      }
    };

    reader.readAsBinaryString(file);
  };

  // Quick Bulk Paste parsing
  const handleBulkPasteParse = () => {
    if (!bulkPasteText.trim()) return;
    const lines = bulkPasteText.split('\n');
    const extracted: StudentItem[] = [];

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      // Split by tab or comma
      const parts = trimmed.split(/[\t,;]+/).map(p => p.trim());
      if (parts.length >= 1 && parts[0]) {
        const roll = parts[0].toUpperCase();
        const name = parts[1] || `Student ${roll}`;
        const email = parts[2] || `${roll.toLowerCase()}@testwise.edu.in`;
        const phone = parts[3] || '';
        extracted.push({
          id: `std-p-${Date.now()}-${idx}`,
          rollNumber: roll,
          name: name,
          email: email,
          phone: phone,
          registeredOnApp: false,
          testsCompleted: 0,
          avgScore: 0
        });
      }
    });

    if (extracted.length > 0) {
      setParsedStudents(extracted);
      setUploadSuccess(`Parsed ${extracted.length} students from pasted text!`);
      setBulkPasteText('');
    } else {
      setUploadError('Could not parse. Format: RollNumber, FullName, Email, PhoneNumber');
    }
  };

  // Save / Create the Student List
  const handleSaveStudentList = () => {
    const finalBranch = isCustomBranch ? customBranchInput.trim() : formBranch;
    const finalSection = isCustomSection ? customSectionInput.trim() : formSection;

    if (!formInstId) {
      alert('Please select an institution');
      return;
    }
    if (!finalBranch) {
      alert('Please enter or select a branch');
      return;
    }
    if (!finalSection) {
      alert('Please enter or select a section');
      return;
    }

    let finalStudents: StudentItem[] = [];
    if (inputTab === 'excel' || inputTab === 'pdf') {
      finalStudents = parsedStudents;
    } else {
      const validRows = manualRows.filter(r => r.rollNumber.trim() !== '');
      finalStudents = validRows.map((r, i) => ({
        id: `std-m-${Date.now()}-${i}`,
        rollNumber: r.rollNumber.trim().toUpperCase(),
        name: r.name.trim() || `Student ${r.rollNumber.trim()}`,
        email: r.email.trim() || `${r.rollNumber.trim().toLowerCase()}@testwise.edu.in`,
        phone: r.phone.trim(),
        registeredOnApp: false,
        testsCompleted: 0,
        avgScore: 0
      }));
    }

    if (finalStudents.length === 0) {
      alert('Please add at least one student to this class.');
      return;
    }

    // Merge or create new class group
    const existingIndex = classes.findIndex(c => 
      c.institutionId === formInstId &&
      c.stream.toLowerCase() === formStream.toLowerCase() &&
      c.branch.toLowerCase() === finalBranch.toLowerCase() &&
      c.year.toLowerCase() === formYear.toLowerCase() &&
      c.section.toLowerCase() === finalSection.toLowerCase()
    );

    if (existingIndex !== -1) {
      const existing = classes[existingIndex];
      const mergedStudents = [...existing.students];
      finalStudents.forEach(newStd => {
        if (!mergedStudents.some(s => s.rollNumber.toLowerCase() === newStd.rollNumber.toLowerCase())) {
          mergedStudents.push(newStd);
        }
      });

      const updated = [...classes];
      updated[existingIndex] = { ...existing, students: mergedStudents };
      setClasses(updated);
    } else {
      const newClass: ClassGroup = {
        id: `cls-${Date.now()}`,
        institutionId: formInstId,
        stream: formStream,
        branch: finalBranch,
        year: formYear,
        section: finalSection,
        students: finalStudents,
        createdAt: new Date().toISOString()
      };
      setClasses(prev => [newClass, ...prev]);
    }

    setIsCreateModalOpen(false);
    setParsedStudents([]);
    setManualRows([
      { rollNumber: '', name: '', email: '', phone: '' },
      { rollNumber: '', name: '', email: '', phone: '' },
      { rollNumber: '', name: '', email: '', phone: '' }
    ]);
    setIsCustomBranch(false);
    setIsCustomSection(false);
    setCustomBranchInput('');
    setCustomSectionInput('');
  };

  // Export Class Students to Excel (Includes Phone Number)
  const handleExportClassExcel = (cls: ClassGroup) => {
    const inst = institutions.find(i => i.id === cls.institutionId)?.name || 'Institution';
    const rows = cls.students.map((s, idx) => ({
      'S.No': idx + 1,
      'Roll Number': s.rollNumber,
      'Full Name': s.name,
      'Email Address': s.email,
      'Phone Number': s.phone || 'N/A',
      'TestWise App Status': s.registeredOnApp ? 'Active / Registered' : 'Invited',
      'Tests Completed': s.testsCompleted || 0,
      'Avg Score (%)': s.avgScore || 0
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `${cls.section}`);
    XLSX.writeFile(workbook, `${inst}_${cls.branch}_${cls.year}_${cls.section}_Roster.xlsx`);
  };

  // Add Single Student to Viewing Class
  const handleAddSingleStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewingClass || !singleRoll.trim()) return;

    const newStudent: StudentItem = {
      id: `std-s-${Date.now()}`,
      rollNumber: singleRoll.trim().toUpperCase(),
      name: singleName.trim() || `Student ${singleRoll.trim().toUpperCase()}`,
      email: singleEmail.trim() || `${singleRoll.trim().toLowerCase()}@testwise.edu.in`,
      phone: singlePhone.trim(),
      registeredOnApp: false,
      testsCompleted: 0,
      avgScore: 0
    };

    const updatedStudents = [newStudent, ...viewingClass.students];
    const updatedClass = { ...viewingClass, students: updatedStudents };

    setClasses(prev => prev.map(c => c.id === viewingClass.id ? updatedClass : c));
    setViewingClass(updatedClass);

    setSingleRoll('');
    setSingleName('');
    setSingleEmail('');
    setSinglePhone('');
    setIsAddSingleStudentOpen(false);
  };

  // Remove student from viewing class
  const handleRemoveStudentFromClass = (studentId: string) => {
    if (!viewingClass) return;
    if (!confirm('Are you sure you want to remove this student from this class?')) return;

    const updatedStudents = viewingClass.students.filter(s => s.id !== studentId);
    const updatedClass = { ...viewingClass, students: updatedStudents };

    setClasses(prev => prev.map(c => c.id === viewingClass.id ? updatedClass : c));
    setViewingClass(updatedClass);
  };

  // Delete entire class
  const handleDeleteClass = (clsId: string) => {
    if (!confirm('Are you sure you want to delete this entire class section?')) return;
    setClasses(prev => prev.filter(c => c.id !== clsId));
    if (viewingClass?.id === clsId) setViewingClass(null);
  };

  // Filtered Students in Viewing Class Modal
  const displayedViewingStudents = useMemo(() => {
    if (!viewingClass) return [];
    return viewingClass.students.filter(s => {
      if (rosterStatusFilter === 'Active' && !s.registeredOnApp) return false;
      if (rosterStatusFilter === 'Pending' && s.registeredOnApp) return false;
      if (rosterSearch) {
        const q = rosterSearch.toLowerCase();
        return s.rollNumber.toLowerCase().includes(q) ||
               s.name.toLowerCase().includes(q) ||
               s.email.toLowerCase().includes(q) ||
               (s.phone && s.phone.toLowerCase().includes(q));
      }
      return true;
    });
  }, [viewingClass, rosterSearch, rosterStatusFilter]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16 font-sans">
      
      {/* 1. Header Bar: Title, Micro-Metrics & "+ Create student list" Button */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50/80 dark:bg-indigo-950/50 px-3 py-1 rounded-full border border-indigo-200/60 dark:border-indigo-800">
              <GraduationCap size={14} className="text-indigo-600" />
              Faculty Student Hub
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {institutions.length} Institutions Connected
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Student Directory & Cohorts
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base mt-1.5 max-w-2xl leading-relaxed">
            Manage your teaching batches, upload student rosters via Excel or PDF, and view individual student readiness across all your institutions.
          </p>
        </div>

        {/* Action Button & Overall Stats Ticker */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="hidden sm:flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl px-4 py-2.5 shadow-sm">
            <div className="text-right">
              <div className="text-xs text-slate-400 font-medium">App Adoption</div>
              <div className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">
                {overallStats.adoptionRate}% Active
              </div>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800"></div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Total Students</div>
              <div className="text-base font-extrabold text-slate-900 dark:text-white">
                {overallStats.totalStudents}
              </div>
            </div>
          </div>

          <button 
            onClick={handleOpenCreateModal}
            className="flex items-center justify-center gap-2.5 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white font-bold px-6 py-3.5 rounded-2xl shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 transition-all hover:scale-105 active:scale-95 text-sm sm:text-base"
          >
            <Plus size={19} strokeWidth={2.5} />
            <span>Create Student List</span>
          </button>
        </div>
      </div>

      {/* 2. Institution Cards Selector (Full-Time & Visiting Colleges) */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Teaching Campuses & Institutions
            </h3>
            <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold px-2 py-0.5 rounded-md">
              {institutions.length}
            </span>
          </div>

          <button 
            onClick={() => setIsAddInstitutionOpen(true)}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:underline flex items-center gap-1.5 transition-colors"
          >
            <Plus size={15} strokeWidth={2.5} /> 
            <span>Add Visiting / 2nd College</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {institutions.map(inst => {
            const metrics = institutionMetrics[inst.id] || { streams: new Set(), branches: new Set(), years: new Set(), sections: new Set(), totalStudents: 0, registeredCount: 0 };
            const isSelected = inst.id === activeInstitutionId;

            return (
              <motion.div
                key={inst.id}
                whileHover={{ y: -3 }}
                onClick={() => {
                  setActiveInstitutionId(inst.id);
                  setSelectedStream('All');
                  setSelectedBranch('All');
                  setSelectedYear('All');
                  setSelectedSection('All');
                }}
                className={`relative cursor-pointer rounded-2xl p-5 border transition-all duration-300 shadow-sm ${
                  isSelected 
                    ? 'bg-gradient-to-b from-white to-indigo-50/20 dark:from-slate-900 dark:to-indigo-950/20 border-indigo-600 ring-2 ring-indigo-600/20 shadow-indigo-600/10 shadow-lg' 
                    : 'bg-white/90 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Top Badge: Type & Selected indicator */}
                <div className="flex items-center justify-between mb-3.5">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    inst.type === 'Full-Time'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                      : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300'
                  }`}>
                    {inst.type}
                  </span>

                  {isSelected && (
                    <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full">
                      <CheckCircle2 size={13} />
                      <span>Active</span>
                    </div>
                  )}
                </div>

                <div className="flex items-start gap-3 mb-4">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                    isSelected 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                  }`}>
                    <Building2 size={20} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-base leading-tight line-clamp-1">
                      {inst.name}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-1 text-slate-500 dark:text-slate-400 text-xs">
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{inst.code}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 line-clamp-1">
                        <MapPin size={11} className="text-slate-400" />
                        {inst.location}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Big Student Count + Registered pill */}
                <div className="flex items-baseline justify-between mb-3.5">
                  <div>
                    <span className="text-2xl font-black text-slate-900 dark:text-white">
                      {metrics.totalStudents}
                    </span>
                    <span className="text-xs text-slate-500 ml-1.5 font-medium">Students</span>
                  </div>
                  <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-md">
                    {metrics.registeredCount} on App
                  </span>
                </div>

                {/* Badges: streams, branches, years, sections */}
                <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
                  <div>
                    <div className="font-extrabold text-slate-800 dark:text-slate-200 text-xs">{metrics.streams.size}</div>
                    <div className="text-[10px] text-slate-400 font-medium">streams</div>
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-800 dark:text-slate-200 text-xs">{metrics.branches.size}</div>
                    <div className="text-[10px] text-slate-400 font-medium">branches</div>
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-800 dark:text-slate-200 text-xs">{metrics.years.size}</div>
                    <div className="text-[10px] text-slate-400 font-medium">years</div>
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-800 dark:text-slate-200 text-xs">{metrics.sections.size}</div>
                    <div className="text-[10px] text-slate-400 font-medium">sections</div>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Quick Add Institution Card */}
          <motion.div
            whileHover={{ y: -3 }}
            onClick={() => setIsAddInstitutionOpen(true)}
            className="cursor-pointer rounded-2xl p-5 border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col items-center justify-center text-center group transition-all min-h-[170px]"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2.5 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all">
              <Plus size={22} />
            </div>
            <div className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">Add New Campus</div>
            <div className="text-xs text-slate-400 mt-1 max-w-[200px]">
              Teach at another college? Connect it to your dashboard.
            </div>
          </motion.div>
        </div>
      </div>

      {/* 3. Main Directory Box: Filters + Classes (Grid or Table View) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        
        {/* Active Campus Header & View Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800 gap-4">
          <div>
            <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              Selected Campus Roster
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {currentInstitution.name}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Institution Code: <span className="font-semibold text-slate-700 dark:text-slate-300">{currentInstitution.code}</span> • {currentInstitution.location}
            </p>
          </div>

          {/* Search Box & View Mode Toggle */}
          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search section, roll or phone..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>

            {/* Toggle Table / Grid */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('table')}
                title="Table View"
                className={`p-2 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <List size={16} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                title="Cards Grid View"
                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <LayoutGrid size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Filters Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {/* Stream */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Stream</label>
            <select
              value={selectedStream}
              onChange={(e) => {
                setSelectedStream(e.target.value);
                setSelectedBranch('All');
                setSelectedYear('All');
                setSelectedSection('All');
              }}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm rounded-xl px-3 py-2.5 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="All">All Streams</option>
              {availableStreams.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Branch */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Branch</label>
            <select
              value={selectedBranch}
              onChange={(e) => {
                setSelectedBranch(e.target.value);
                setSelectedYear('All');
                setSelectedSection('All');
              }}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm rounded-xl px-3 py-2.5 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="All">All Branches</option>
              {availableBranches.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          {/* Year */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                setSelectedSection('All');
              }}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm rounded-xl px-3 py-2.5 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="All">All Years</option>
              {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          {/* Section */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Section</label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm rounded-xl px-3 py-2.5 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="All">All Sections</option>
              {availableSections.map(sec => <option key={sec} value={sec}>{sec}</option>)}
            </select>
          </div>
        </div>

        {/* Classes Content Display */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Assigned Classes & Cohorts {selectedYear !== 'All' ? `(${selectedYear})` : ''}
            </h3>
            <span className="text-xs font-semibold text-slate-500">
              {displayedClasses.length} class {displayedClasses.length === 1 ? 'batch' : 'batches'} found
            </span>
          </div>

          {/* Empty State */}
          {displayedClasses.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-950/20">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
                <Users size={32} />
              </div>
              <h4 className="font-extrabold text-slate-800 dark:text-slate-200 text-lg">No class cohorts found</h4>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1 mb-5">
                You haven&apos;t added student lists for this criteria yet, or no classes match your current search.
              </p>
              <button
                onClick={handleOpenCreateModal}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/25 transition-all"
              >
                <Plus size={16} /> Create Student List
              </button>
            </div>
          ) : viewMode === 'table' ? (
            /* Table View */
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-4 px-4">Section / Batch</th>
                    <th className="py-4 px-4">Stream & Branch</th>
                    <th className="py-4 px-4">Academic Year</th>
                    <th className="py-4 px-4 text-center">Enrolled Students</th>
                    <th className="py-4 px-4 text-center">App Readiness</th>
                    <th className="py-4 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                  {displayedClasses.map(cls => {
                    const activeCount = cls.students.filter(s => s.registeredOnApp).length;
                    const activePct = cls.students.length > 0 ? Math.round((activeCount / cls.students.length) * 100) : 0;

                    return (
                      <tr key={cls.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-4 px-4">
                          <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                            {cls.section}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-bold text-slate-800 dark:text-slate-200">{cls.branch}</span>
                          <span className="text-xs text-slate-400 ml-1.5 font-medium">({cls.stream})</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-xs font-bold bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg text-slate-700 dark:text-slate-300">
                            {cls.year}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="font-black text-slate-900 dark:text-white text-base">
                            {cls.students.length}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="inline-flex items-center gap-2">
                            <div className="w-16 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-emerald-500 rounded-full" 
                                style={{ width: `${activePct}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                              {activeCount}/{cls.students.length}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setViewingClass(cls)}
                              className="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-sm"
                            >
                              <Users size={14} />
                              <span>View Students</span>
                            </button>
                            <button
                              onClick={() => handleExportClassExcel(cls)}
                              title="Export Roster with Phone Numbers"
                              className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl transition-colors"
                            >
                              <Download size={15} />
                            </button>
                            <button
                              onClick={() => handleDeleteClass(cls.id)}
                              title="Delete Section"
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* Cards Grid View */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedClasses.map(cls => {
                const activeCount = cls.students.filter(s => s.registeredOnApp).length;
                const activePct = cls.students.length > 0 ? Math.round((activeCount / cls.students.length) * 100) : 0;

                return (
                  <motion.div
                    key={cls.id}
                    whileHover={{ y: -3 }}
                    className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-black text-indigo-700 bg-indigo-50 dark:bg-indigo-950/60 dark:text-indigo-300 px-3 py-1 rounded-full">
                          {cls.section}
                        </span>
                        <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-md">
                          {cls.year}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-slate-900 dark:text-white text-base leading-snug">
                        {cls.branch}
                      </h4>
                      <div className="text-xs text-slate-400 font-medium mt-0.5">
                        Stream: {cls.stream}
                      </div>

                      <div className="my-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-black text-slate-900 dark:text-white">
                            {cls.students.length}
                          </div>
                          <div className="text-xs text-slate-400 font-medium">Students Enrolled</div>
                        </div>

                        <div className="text-right">
                          <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                            {activeCount} Registered
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {activePct}% App Ready
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => setViewingClass(cls)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-md transition-all"
                      >
                        <Users size={14} />
                        <span>View Students</span>
                      </button>
                      <button
                        onClick={() => handleExportClassExcel(cls)}
                        title="Export Excel"
                        className="p-2.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl transition-colors border border-slate-200 dark:border-slate-700"
                      >
                        <Download size={15} />
                      </button>
                      <button
                        onClick={() => handleDeleteClass(cls.id)}
                        title="Delete"
                        className="p-2.5 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors border border-slate-200 dark:border-slate-700"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Clean Footer Note */}
          <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 pt-5 border-t border-slate-100 dark:border-slate-800 mt-6">
            <div className="flex items-center gap-2">
              <FileSpreadsheet size={15} className="text-indigo-500" />
              <span>Supports Excel (.xlsx, .xls), CSV, and PDF imports with Full Name, Roll No, Email, & Phone Number.</span>
            </div>
            <button
              onClick={handleDownloadSampleTemplate}
              className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline hidden sm:inline-flex items-center gap-1"
            >
              <Download size={13} /> Download Sample Excel Template
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. MODAL: Create Student List (Excel / PDF / Manual Entry with Phone)     */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 my-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    Create Student List & Cohort
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Define section parameters and import student roster with phone numbers.
                  </p>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6 pt-6">
                
                {/* Step 1: Campus & Academic Parameters */}
                <div className="space-y-4 bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      Step 1: Class & Campus Allocation
                    </span>
                  </div>

                  {/* Institution Picker */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Target Institution / College Campus *
                    </label>
                    <select
                      value={formInstId}
                      onChange={(e) => setFormInstId(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm rounded-xl px-3.5 py-2.5 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      {institutions.map(inst => (
                        <option key={inst.id} value={inst.id}>
                          {inst.name} ({inst.code}) — {inst.type}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Stream, Branch, Year, Section Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    
                    {/* Stream */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Stream *</label>
                      <select
                        value={formStream}
                        onChange={(e) => setFormStream(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm rounded-xl px-2.5 py-2 focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="B.Tech">B.Tech</option>
                        <option value="M.Tech">M.Tech</option>
                        <option value="MCA">MCA</option>
                        <option value="MBA">MBA</option>
                        <option value="Pharmacy">Pharmacy</option>
                        <option value="Degree">Degree</option>
                      </select>
                    </div>

                    {/* Branch */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400">Branch *</label>
                        <button
                          type="button"
                          onClick={() => setIsCustomBranch(!isCustomBranch)}
                          className="text-[10px] text-indigo-600 font-bold hover:underline"
                        >
                          {isCustomBranch ? 'List' : '+ Custom'}
                        </button>
                      </div>
                      {isCustomBranch ? (
                        <input
                          type="text"
                          placeholder="e.g. AI & ML"
                          value={customBranchInput}
                          onChange={(e) => setCustomBranchInput(e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm rounded-xl px-2.5 py-2 focus:ring-2 focus:ring-indigo-500"
                        />
                      ) : (
                        <select
                          value={formBranch}
                          onChange={(e) => setFormBranch(e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm rounded-xl px-2.5 py-2 focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="Computer Science">Computer Science</option>
                          <option value="Information Technology">Information Technology</option>
                          <option value="Electronics & Comm.">Electronics & Comm.</option>
                          <option value="Electrical Engineering">Electrical Engineering</option>
                          <option value="Mechanical Engineering">Mechanical Engineering</option>
                          <option value="Civil Engineering">Civil Engineering</option>
                          <option value="Data Science">Data Science</option>
                          <option value="AI & Robotics">AI & Robotics</option>
                        </select>
                      )}
                    </div>

                    {/* Year */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Year *</label>
                      <select
                        value={formYear}
                        onChange={(e) => setFormYear(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm rounded-xl px-2.5 py-2 focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="Year 1">Year 1</option>
                        <option value="Year 2">Year 2</option>
                        <option value="Year 3">Year 3</option>
                        <option value="Year 4">Year 4</option>
                      </select>
                    </div>

                    {/* Section */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400">Section *</label>
                        <button
                          type="button"
                          onClick={() => setIsCustomSection(!isCustomSection)}
                          className="text-[10px] text-indigo-600 font-bold hover:underline"
                        >
                          {isCustomSection ? 'List' : '+ Custom'}
                        </button>
                      </div>
                      {isCustomSection ? (
                        <input
                          type="text"
                          placeholder="e.g. Section E"
                          value={customSectionInput}
                          onChange={(e) => setCustomSectionInput(e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm rounded-xl px-2.5 py-2 focus:ring-2 focus:ring-indigo-500"
                        />
                      ) : (
                        <select
                          value={formSection}
                          onChange={(e) => setFormSection(e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm rounded-xl px-2.5 py-2 focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="Section A">Section A</option>
                          <option value="Section B">Section B</option>
                          <option value="Section C">Section C</option>
                          <option value="Section D">Section D</option>
                          <option value="Section E">Section E</option>
                        </select>
                      )}
                    </div>

                  </div>
                </div>

                {/* Step 2: Student Input Method (Excel / PDF / Manual) */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      Step 2: Add Students (Name, Roll No, Email, & Phone)
                    </span>
                    {parsedStudents.length > 0 && (
                      <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                        ✓ {parsedStudents.length} Students Parsed
                      </span>
                    )}
                  </div>

                  {/* Tabs: Excel / PDF / Manual */}
                  <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 gap-1">
                    <button
                      type="button"
                      onClick={() => setInputTab('excel')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all ${
                        inputTab === 'excel'
                          ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      <FileSpreadsheet size={15} />
                      <span>Excel / CSV Import</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputTab('pdf')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all ${
                        inputTab === 'pdf'
                          ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      <FileText size={15} />
                      <span>PDF Document</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputTab('manual')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all ${
                        inputTab === 'manual'
                          ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      <UserPlus size={15} />
                      <span>Manual Spreadsheet</span>
                    </button>
                  </div>

                  {/* Tab 1: Excel / CSV Upload */}
                  {inputTab === 'excel' && (
                    <div className="space-y-4">
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="cursor-pointer border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-2xl p-7 text-center bg-slate-50/50 dark:bg-slate-900/30 hover:bg-indigo-50/20 transition-all group"
                      >
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileUpload}
                          accept=".xlsx,.xls,.csv"
                          className="hidden"
                        />
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-2.5 group-hover:scale-110 transition-transform shadow-sm">
                          <Upload size={22} />
                        </div>
                        <h5 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">
                          Click to upload your College Excel or CSV file
                        </h5>
                        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                          Supports columns: <strong>Roll Number</strong>, <strong>Full Name</strong>, <strong>Email</strong>, and <strong>Phone Number</strong>.
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Need a sample format?</span>
                        <button
                          type="button"
                          onClick={handleDownloadSampleTemplate}
                          className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                        >
                          <Download size={13} /> Download .xlsx Template
                        </button>
                      </div>

                      {uploadError && (
                        <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 dark:bg-red-950/30 p-3.5 rounded-xl border border-red-200 dark:border-red-800">
                          <AlertCircle size={16} className="shrink-0" />
                          <span>{uploadError}</span>
                        </div>
                      )}

                      {uploadSuccess && (
                        <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 size={16} className="shrink-0" />
                          <span>{uploadSuccess}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tab 2: PDF Document Upload */}
                  {inputTab === 'pdf' && (
                    <div className="space-y-4">
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="cursor-pointer border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-2xl p-6 text-center bg-slate-50/50 dark:bg-slate-900/30 transition-all"
                      >
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileUpload}
                          accept=".pdf,.csv"
                          className="hidden"
                        />
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-2">
                          <FileText size={22} />
                        </div>
                        <h5 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                          Upload College Roster PDF
                        </h5>
                        <p className="text-xs text-slate-400 mt-1">
                          Our parser extracts Hall Ticket / Roll Numbers automatically.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-400">
                          Or Paste Roll Numbers, Names, & Phone copied from PDF:
                        </label>
                        <textarea
                          rows={3}
                          placeholder="e.g.&#10;23A91A0501, Aarav Patel, aarav@college.edu, 9849012345&#10;23A91A0502, Ananya Sharma, ananya@college.edu, 9849023456"
                          value={bulkPasteText}
                          onChange={(e) => setBulkPasteText(e.target.value)}
                          className="w-full text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={handleBulkPasteParse}
                          className="text-xs font-bold bg-slate-800 text-white hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 px-4 py-2 rounded-xl transition-colors"
                        >
                          Parse Pasted Text
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Tab 3: Manual Entry Table with Phone Number */}
                  {inputTab === 'manual' && (
                    <div className="space-y-3">
                      <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-2xl">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase">
                            <tr>
                              <th className="py-2.5 px-3">Roll Number *</th>
                              <th className="py-2.5 px-3">Student Full Name *</th>
                              <th className="py-2.5 px-3">Email Address</th>
                              <th className="py-2.5 px-3">Phone Number</th>
                              <th className="py-2.5 px-3 text-center">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {manualRows.map((row, idx) => (
                              <tr key={idx}>
                                <td className="p-2">
                                  <input
                                    type="text"
                                    placeholder="23A91A0501"
                                    value={row.rollNumber}
                                    onChange={(e) => {
                                      const updated = [...manualRows];
                                      updated[idx].rollNumber = e.target.value;
                                      setManualRows(updated);
                                    }}
                                    className="w-full uppercase font-mono font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500"
                                  />
                                </td>
                                <td className="p-2">
                                  <input
                                    type="text"
                                    placeholder="Student Name"
                                    value={row.name}
                                    onChange={(e) => {
                                      const updated = [...manualRows];
                                      updated[idx].name = e.target.value;
                                      setManualRows(updated);
                                    }}
                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500"
                                  />
                                </td>
                                <td className="p-2">
                                  <input
                                    type="email"
                                    placeholder="student@college.edu"
                                    value={row.email}
                                    onChange={(e) => {
                                      const updated = [...manualRows];
                                      updated[idx].email = e.target.value;
                                      setManualRows(updated);
                                    }}
                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500"
                                  />
                                </td>
                                <td className="p-2">
                                  <input
                                    type="tel"
                                    placeholder="+91 98490 12345"
                                    value={row.phone}
                                    onChange={(e) => {
                                      const updated = [...manualRows];
                                      updated[idx].phone = e.target.value;
                                      setManualRows(updated);
                                    }}
                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500"
                                  />
                                </td>
                                <td className="p-2 text-center">
                                  <button
                                    type="button"
                                    onClick={() => setManualRows(manualRows.filter((_, i) => i !== idx))}
                                    className="text-slate-400 hover:text-red-500 p-1 rounded-md"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <button
                        type="button"
                        onClick={() => setManualRows([...manualRows, { rollNumber: '', name: '', email: '', phone: '' }])}
                        className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1.5"
                      >
                        <Plus size={15} /> + Add Another Student Row
                      </button>
                    </div>
                  )}

                  {/* Parsed Students Preview (with Phone Number column) */}
                  {parsedStudents.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Preview of Uploaded Students ({parsedStudents.length}):
                      </div>
                      <div className="max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-xl">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold sticky top-0">
                            <tr>
                              <th className="py-2 px-3">#</th>
                              <th className="py-2 px-3">Roll Number</th>
                              <th className="py-2 px-3">Name</th>
                              <th className="py-2 px-3">Email</th>
                              <th className="py-2 px-3">Phone</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {parsedStudents.slice(0, 50).map((s, i) => (
                              <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <td className="py-1.5 px-3 text-slate-400">{i + 1}</td>
                                <td className="py-1.5 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">{s.rollNumber}</td>
                                <td className="py-1.5 px-3 font-semibold text-slate-800 dark:text-slate-200">{s.name}</td>
                                <td className="py-1.5 px-3 text-slate-500">{s.email}</td>
                                <td className="py-1.5 px-3 text-slate-600 font-mono text-[11px]">{s.phone || '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {parsedStudents.length > 50 && (
                        <p className="text-[11px] text-slate-400 italic">
                          Showing first 50 of {parsedStudents.length} students.
                        </p>
                      )}
                    </div>
                  )}

                </div>

                {/* Modal Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveStudentList}
                    className="px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95"
                  >
                    Save & Create Student List
                  </button>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 5. MODAL: View Students Window (With Phone Number & Single Student Add)   */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {viewingClass && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-5xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 my-8 max-h-[92vh] overflow-y-auto space-y-6"
            >
              {/* Window Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-800 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 dark:bg-indigo-950/60 dark:text-indigo-300 px-3 py-1 rounded-full">
                      {viewingClass.stream} • {viewingClass.branch}
                    </span>
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-md">
                      {viewingClass.year}
                    </span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1.5">
                    {viewingClass.section} Student Roster
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Campus: <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {institutions.find(i => i.id === viewingClass.institutionId)?.name || 'College'}
                    </span> • Enrolled: <span className="font-bold text-slate-900 dark:text-white">{viewingClass.students.length} Students</span>
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setIsAddSingleStudentOpen(!isAddSingleStudentOpen)}
                    className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-md transition-all"
                  >
                    <UserPlus size={14} />
                    <span>Add Student</span>
                  </button>
                  <button
                    onClick={() => handleExportClassExcel(viewingClass)}
                    className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 font-bold text-xs px-3.5 py-2.5 rounded-xl hover:bg-emerald-100 transition-colors border border-emerald-200/50"
                  >
                    <Download size={14} />
                    <span>Export Excel</span>
                  </button>
                  <button
                    onClick={() => setViewingClass(null)}
                    className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Inline Add Single Student Form */}
              <AnimatePresence>
                {isAddSingleStudentOpen && (
                  <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    onSubmit={handleAddSingleStudent}
                    className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl p-4 space-y-3"
                  >
                    <div className="font-extrabold text-xs text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                      Add New Student to {viewingClass.section}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div>
                        <input
                          type="text"
                          required
                          placeholder="Roll Number *"
                          value={singleRoll}
                          onChange={(e) => setSingleRoll(e.target.value)}
                          className="w-full font-mono uppercase bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          required
                          placeholder="Full Name *"
                          value={singleName}
                          onChange={(e) => setSingleName(e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
                        />
                      </div>
                      <div>
                        <input
                          type="email"
                          placeholder="Email Address"
                          value={singleEmail}
                          onChange={(e) => setSingleEmail(e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
                        />
                      </div>
                      <div>
                        <input
                          type="tel"
                          placeholder="Phone / WhatsApp"
                          value={singlePhone}
                          onChange={(e) => setSinglePhone(e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsAddSingleStudentOpen(false)}
                        className="px-3.5 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-200/50 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
                      >
                        Save Student
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Roster Controls: Search & Status Filter */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                  <input
                    type="text"
                    placeholder="Search by roll, name, or phone..."
                    value={rosterSearch}
                    onChange={(e) => setRosterSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
                  <button
                    onClick={() => setRosterStatusFilter('All')}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${rosterStatusFilter === 'All' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-500'}`}
                  >
                    All ({viewingClass.students.length})
                  </button>
                  <button
                    onClick={() => setRosterStatusFilter('Active')}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${rosterStatusFilter === 'Active' ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm' : 'text-slate-500'}`}
                  >
                    Active on App ({viewingClass.students.filter(s => s.registeredOnApp).length})
                  </button>
                  <button
                    onClick={() => setRosterStatusFilter('Pending')}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${rosterStatusFilter === 'Pending' ? 'bg-white dark:bg-slate-700 text-amber-600 shadow-sm' : 'text-slate-500'}`}
                  >
                    Pending ({viewingClass.students.filter(s => !s.registeredOnApp).length})
                  </button>
                </div>
              </div>

              {/* Students List Table (Showing Phone Numbers!) */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4">#</th>
                      <th className="py-3.5 px-4">Roll Number</th>
                      <th className="py-3.5 px-4">Student Full Name</th>
                      <th className="py-3.5 px-4">Email</th>
                      <th className="py-3.5 px-4">Phone Number</th>
                      <th className="py-3.5 px-4 text-center">App Status</th>
                      <th className="py-3.5 px-4 text-center">Tests Taken</th>
                      <th className="py-3.5 px-4 text-center">Avg Score</th>
                      <th className="py-3.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                    {displayedViewingStudents.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-slate-400 text-xs">
                          No students match this filter.
                        </td>
                      </tr>
                    ) : (
                      displayedViewingStudents.map((student, idx) => (
                        <tr key={student.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 px-4 text-slate-400 text-xs font-mono">{idx + 1}</td>
                          <td className="py-3.5 px-4">
                            <span className="font-mono font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-md text-xs border border-indigo-100 dark:border-indigo-900">
                              {student.rollNumber}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center text-[10px] font-bold">
                                {student.name.slice(0, 2).toUpperCase()}
                              </div>
                              {student.name}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-xs text-slate-500">
                            <a href={`mailto:${student.email}`} className="hover:text-indigo-600 flex items-center gap-1">
                              <Mail size={12} className="text-slate-400" />
                              {student.email}
                            </a>
                          </td>
                          <td className="py-3.5 px-4 text-xs">
                            {student.phone ? (
                              <a href={`tel:${student.phone}`} className="font-mono text-slate-700 dark:text-slate-300 hover:text-indigo-600 flex items-center gap-1">
                                <Phone size={12} className="text-emerald-500" />
                                {student.phone}
                              </a>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">Not provided</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {student.registeredOnApp ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                                <CheckCircle2 size={12} /> Active
                              </span>
                            ) : (
                              <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-200/60">
                                Invited
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center font-bold text-slate-800 dark:text-slate-200">
                            {student.testsCompleted || 0}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className={`font-bold ${
                              (student.avgScore || 0) >= 75 ? 'text-emerald-600' :
                              (student.avgScore || 0) >= 50 ? 'text-blue-600' :
                              (student.avgScore || 0) > 0 ? 'text-amber-600' : 'text-slate-400'
                            }`}>
                              {(student.avgScore || 0) > 0 ? `${student.avgScore}%` : '—'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => handleRemoveStudentFromClass(student.id)}
                              title="Remove from class"
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Close Button */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setViewingClass(null)}
                  className="px-6 py-2.5 text-xs sm:text-sm font-bold bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-700 dark:hover:bg-slate-600 rounded-xl transition-all shadow-md"
                >
                  Close Window
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 6. MODAL: Add New Institution (For Part-Time / Visiting Colleges)          */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isAddInstitutionOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5"
            >
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    Add Campus / Institution
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Add full-time or visiting/part-time colleges where you teach.
                  </p>
                </div>
                <button
                  onClick={() => setIsAddInstitutionOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddInstitution} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Institution / College Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pragati Engineering College"
                    value={newInstName}
                    onChange={(e) => setNewInstName(e.target.value)}
                    className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      College Code
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. P3"
                      value={newInstCode}
                      onChange={(e) => setNewInstCode(e.target.value)}
                      className="w-full text-xs uppercase font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Location
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Surampalem"
                      value={newInstLocation}
                      onChange={(e) => setNewInstLocation(e.target.value)}
                      className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Faculty Engagement Type
                  </label>
                  <select
                    value={newInstType}
                    onChange={(e) => setNewInstType(e.target.value as any)}
                    className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Full-Time">Full-Time Campus</option>
                    <option value="Part-Time / Visiting">Visiting / Guest Faculty</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAddInstitutionOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md"
                  >
                    Add Campus
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
