'use client'

import { useState } from 'react';
import Link from 'next/link';
import { BrainCircuit, Calculator, MessageSquare, ChevronRight, BarChart, Clock } from 'lucide-react';

export default function PracticeTestsPage() {
  const subjects = [
    {
      id: 'aptitude',
      title: "Aptitude",
      icon: <Calculator className="w-6 h-6" />,
      bg: "bg-orange-50 border-orange-100 text-orange-600",
      activeBg: "bg-orange-600 text-white shadow-md shadow-orange-500/20",
      topics: [
        { name: "Time & Distance", count: 12 },
        { name: "Percentages", count: 8 },
        { name: "Profit & Loss", count: 15 },
        { name: "Simple & Compound Interest", count: 10 },
        { name: "Probability", count: 6 },
        { name: "Ratio & Proportion", count: 14 },
      ]
    },
    {
      id: 'reasoning',
      title: "Reasoning",
      icon: <BrainCircuit className="w-6 h-6" />,
      bg: "bg-violet-50 border-violet-100 text-violet-600",
      activeBg: "bg-violet-600 text-white shadow-md shadow-violet-500/20",
      topics: [
        { name: "Blood Relations", count: 6 },
        { name: "Coding Decoding", count: 10 },
        { name: "Number Series", count: 14 },
        { name: "Syllogisms", count: 12 },
        { name: "Seating Arrangement", count: 8 },
        { name: "Clocks & Calendars", count: 5 },
      ]
    },
    {
      id: 'verbal',
      title: "Verbal",
      icon: <MessageSquare className="w-6 h-6" />,
      bg: "bg-teal-50 border-teal-100 text-teal-600",
      activeBg: "bg-teal-600 text-white shadow-md shadow-teal-500/20",
      topics: [
        { name: "Reading Comprehension", count: 15 },
        { name: "Synonyms & Antonyms", count: 20 },
        { name: "Error Spotting", count: 12 },
        { name: "Sentence Correction", count: 18 },
        { name: "Idioms & Phrases", count: 10 },
      ]
    }
  ];

  const [activeTab, setActiveTab] = useState(subjects[0].id);
  const activeSubject = subjects.find(s => s.id === activeTab) || subjects[0];

  const getTestId = (subjectId: string, difficulty: string) => {
    if (subjectId === 'aptitude') {
      if (difficulty === 'EASY') return '11111111-1111-1111-1111-111111111111';
      if (difficulty === 'MEDIUM') return '11111111-1111-1111-1111-222222222222';
      if (difficulty === 'HARD') return '11111111-1111-1111-1111-333333333333';
    }
    if (subjectId === 'reasoning') {
      if (difficulty === 'EASY') return '22222222-2222-2222-2222-111111111111';
      if (difficulty === 'MEDIUM') return '22222222-2222-2222-2222-222222222222';
      if (difficulty === 'HARD') return '22222222-2222-2222-2222-333333333333';
    }
    if (subjectId === 'verbal') {
      if (difficulty === 'EASY') return '33333333-3333-3333-3333-111111111111';
      if (difficulty === 'MEDIUM') return '33333333-3333-3333-3333-222222222222';
      if (difficulty === 'HARD') return '33333333-3333-3333-3333-333333333333';
    }
    return '11111111-1111-1111-1111-111111111111';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700">
      
      <div className="bg-white p-8 rounded-3xl border border-[#DDE3DD] shadow-sm relative overflow-hidden animate-in slide-in-from-top-4 duration-700">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-orange-100 to-transparent rounded-full -mr-20 -mt-20 opacity-50 blur-3xl animate-pulse"></div>
        <h1 className="text-3xl font-bold text-[#17221B] relative z-10">Practice Tests</h1>
        <p className="text-[#68736C] mt-2 max-w-2xl relative z-10 text-lg font-medium">
          Master specific topics at your own pace. Choose a category below to see available topics.
        </p>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full">
        {subjects.map((subject) => (
          <button
            key={subject.id}
            onClick={() => setActiveTab(subject.id)}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl font-bold border transition-all duration-300 ${
              activeTab === subject.id 
                ? subject.activeBg 
                : `${subject.bg} hover:scale-105`
            }`}
          >
            <div className="scale-75 sm:scale-100">{subject.icon}</div>
            <span className="text-[11px] sm:text-lg text-center leading-tight">{subject.title}</span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="space-y-4 sm:space-y-6 animate-in slide-in-from-bottom-4 duration-500" key={activeTab}>
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-[#17221B]">{activeSubject.title} Topics</h2>
          <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-slate-100 text-slate-600 rounded-full text-xs sm:text-sm font-bold border border-slate-200">
            {activeSubject.topics.length} Available
          </span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {activeSubject.topics.map((topic, tIdx) => (
            <div key={tIdx} className="group bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-[#DDE3DD] hover:border-violet-300 hover:shadow-lg transition-all cursor-pointer relative overflow-hidden flex flex-col h-full hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-violet-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <h3 className="font-bold text-base sm:text-lg text-[#17221B] relative z-10 group-hover:text-violet-700 transition-colors">{topic.name}</h3>
              <p className="text-xs sm:text-sm font-bold text-[#68736C] mb-4 sm:mb-6 relative z-10 flex items-center gap-1.5 mt-1 sm:mt-2">
                <BarChart size={14} className="text-slate-400 group-hover:text-violet-400 transition-colors sm:w-4 sm:h-4" />
                {topic.count} Tests Available
              </p>
              
              <div className="mt-auto grid grid-cols-3 gap-1.5 sm:gap-2 relative z-10">
                <Link href={`/student/take-test/${getTestId(activeSubject.id, 'EASY')}`} className="text-center py-2 sm:py-2.5 text-[10px] sm:text-xs font-bold rounded-lg sm:rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-500 hover:text-white hover:shadow-md hover:shadow-emerald-500/20 transition-all">EASY</Link>
                <Link href={`/student/take-test/${getTestId(activeSubject.id, 'MEDIUM')}`} className="text-center py-2 sm:py-2.5 text-[10px] sm:text-xs font-bold rounded-lg sm:rounded-xl bg-yellow-50 text-yellow-700 border border-yellow-100 hover:bg-yellow-500 hover:text-white hover:shadow-md hover:shadow-yellow-500/20 transition-all">MEDIUM</Link>
                <Link href={`/student/take-test/${getTestId(activeSubject.id, 'HARD')}`} className="text-center py-2 sm:py-2.5 text-[10px] sm:text-xs font-bold rounded-lg sm:rounded-xl bg-rose-50 text-rose-700 border border-rose-100 hover:bg-rose-500 hover:text-white hover:shadow-md hover:shadow-rose-500/20 transition-all">HARD</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
