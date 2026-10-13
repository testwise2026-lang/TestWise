'use client'

import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default function PrivacyPolicyPage() {
  const lastUpdated = 'October 2026'

  return (
    <div className="min-h-screen bg-[#F8F7F2] font-sans text-slate-900 selection:bg-violet-200 selection:text-violet-900 flex flex-col overflow-x-hidden">
      <Navbar />

      <main className="flex-1 pt-28 sm:pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        {/* Breadcrumb Navigation */}
        <div className="mb-6 flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <Link href="/" className="hover:text-violet-600 transition-colors">Home</Link>
          <span>/</span>
          <span>Legal</span>
          <span>/</span>
          <span className="text-violet-600">Privacy Policy</span>
        </div>

        {/* Page Header */}
        <div className="text-left mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 border border-violet-200 text-violet-700 text-xs font-bold uppercase tracking-wider mb-4">
            <svg className="w-4 h-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Transparency & Data Protection
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-3">
            TestWise Privacy Policy
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed mb-4">
            At TestWise, protecting the privacy and integrity of students, trainers, and educational institutions is foundational to our mission. This policy outlines how we collect, handle, and safeguard your assessment and account data.
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Effective & Last Updated: <strong>{lastUpdated}</strong></span>
          </div>
        </div>

        {/* Policy Switcher Tabs */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-200/80 rounded-2xl mb-10 max-w-xl">
          <Link
            href="/privacy"
            className="flex-1 min-w-[130px] text-center py-2.5 px-3 text-xs sm:text-sm font-bold rounded-xl bg-violet-600 text-white shadow-sm transition-all"
          >
            🔒 Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="flex-1 min-w-[130px] text-center py-2.5 px-3 text-xs sm:text-sm font-bold rounded-xl text-slate-700 hover:text-slate-900 hover:bg-white/60 transition-all"
          >
            📜 Terms of Service
          </Link>
          <Link
            href="/security"
            className="flex-1 min-w-[130px] text-center py-2.5 px-3 text-xs sm:text-sm font-bold rounded-xl text-slate-700 hover:text-slate-900 hover:bg-white/60 transition-all"
          >
            🛡️ Security & Compliance
          </Link>
        </div>

        {/* Main Policy Content */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-10 text-slate-700 leading-relaxed">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 font-bold flex items-center justify-center text-sm border border-violet-100">
                01
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">Information We Collect</h2>
            </div>
            <p className="text-sm sm:text-base text-slate-600">
              We collect information that allows educators to schedule exams and students to evaluate their performance:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm mb-1 flex items-center gap-2">
                  <span className="text-violet-600">👤</span> Account Credentials
                </h3>
                <p className="text-xs text-slate-600">
                  Full name, email address, password hash, role selection (Student or Trainer/Teacher), and optional institutional affiliation.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm mb-1 flex items-center gap-2">
                  <span className="text-teal-600">📝</span> Assessment & Response Logs
                </h3>
                <p className="text-xs text-slate-600">
                  Answers selected, question-by-question time allocation, final score metrics, accuracy breakdowns, and bookmark notes.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm mb-1 flex items-center gap-2">
                  <span className="text-amber-600">⚠️</span> Proctoring & Integrity Telemetry
                </h3>
                <p className="text-xs text-slate-600">
                  During live proctored examinations: tab-switch events, full-screen departure timestamps, window blur events, and suspicious behavior indicators.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm mb-1 flex items-center gap-2">
                  <span className="text-sky-600">📚</span> Educational Materials
                </h3>
                <p className="text-xs text-slate-600">
                  Study notes, formula sheets, and questions uploaded by trainers in Aptitude, Reasoning, and Verbal reasoning categories.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-3 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 font-bold flex items-center justify-center text-sm border border-violet-100">
                02
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">How We Use Your Information</h2>
            </div>
            <p className="text-sm sm:text-base text-slate-600">
              The data collected on TestWise is solely utilized to provide a dependable, cheat-resistant assessment environment:
            </p>
            <ul className="space-y-2.5 text-sm text-slate-700 pl-2">
              <li className="flex items-start gap-2.5">
                <svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                <span><strong>Instant Automated Grading:</strong> To compute objective assessment scores and provide personalized weakness analysis.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                <span><strong>Trainer Monitoring:</strong> To show verified educators real-time student submissions, attendance, and audit logs during scheduled mid-terms or mock tests.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                <span><strong>Integrity Protection:</strong> To guarantee fairness for all test takers and alert trainers in case of unauthorized browser activity.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                <span><strong>No Commercial Advertising:</strong> We never sell student data or exam question banks to third-party ad networks or brokers.</span>
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 font-bold flex items-center justify-center text-sm border border-violet-100">
                03
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">Proctoring & Camera Privacy</h2>
            </div>
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900 text-sm space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-800">
                <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Strict Exam-Time Isolation
              </div>
              <p className="text-xs sm:text-sm text-amber-800/90 leading-relaxed">
                When an institution enables AI Proctoring, camera and tab sensors are active <em>only</em> while an exam is underway. No background video or screen telemetry is accessed once the exam is submitted or when you navigate away from the test portal.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 font-bold flex items-center justify-center text-sm border border-violet-100">
                04
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">Data Storage & Security Standards</h2>
            </div>
            <p className="text-sm sm:text-base text-slate-600">
              All platform data is hosted on enterprise-grade infrastructure utilizing:
            </p>
            <ul className="space-y-2 text-sm text-slate-700 pl-2">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-violet-600"></span>
                <span><strong>Row Level Security (RLS):</strong> Cryptographically enforced database partitions so students can never read test answer keys or other students' papers.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-violet-600"></span>
                <span><strong>TLS 1.3 Transport Encryption:</strong> All interactions between your browser and our servers are encrypted in-transit.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-violet-600"></span>
                <span><strong>Automated Backups:</strong> Secure snapshots ensuring your mock scores, bookmarks, and tests are never lost.</span>
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 font-bold flex items-center justify-center text-sm border border-violet-100">
                05
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">Your Privacy Rights & Contact</h2>
            </div>
            <p className="text-sm sm:text-base text-slate-600">
              You maintain full ownership of your personal data. You may request a complete export of your assessment records, update your profile credentials, or request account deletion at any time.
            </p>
            <div className="mt-4 p-5 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-violet-400 font-bold mb-1">Privacy Officer & Inquiries</p>
                <p className="text-sm font-semibold">Have questions regarding your assessment data?</p>
                <p className="text-xs text-slate-400">Email us at: support@gmail.com</p>
              </div>
              <a
                href="mailto:support@gmail.com?subject=Privacy%20Policy%20Inquiry"
                className="py-2.5 px-4 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl shadow-md transition-all shrink-0"
              >
                Contact Privacy Team →
              </a>
            </div>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-8 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-sm">TestWise</span>
            <span>— Smart Online Assessments</span>
          </div>
          <p>© {new Date().getFullYear()} TestWise. All rights reserved. Official: support@gmail.com</p>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/security" className="hover:text-white transition-colors">Security</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

