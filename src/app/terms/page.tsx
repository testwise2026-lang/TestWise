'use client'

import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default function TermsOfServicePage() {
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
          <span className="text-violet-600">Terms of Service</span>
        </div>

        {/* Page Header */}
        <div className="text-left mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 border border-violet-200 text-violet-700 text-xs font-bold uppercase tracking-wider mb-4">
            <svg className="w-4 h-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Platform Usage Agreement
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-3">
            TestWise Terms of Service
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed mb-4">
            These terms govern your access to the TestWise online assessment platform, mobile interfaces, and proctored examination tools. By creating an account or taking a test, you agree to these terms.
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
            className="flex-1 min-w-[130px] text-center py-2.5 px-3 text-xs sm:text-sm font-bold rounded-xl text-slate-700 hover:text-slate-900 hover:bg-white/60 transition-all"
          >
            🔒 Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="flex-1 min-w-[130px] text-center py-2.5 px-3 text-xs sm:text-sm font-bold rounded-xl bg-violet-600 text-white shadow-sm transition-all"
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

        {/* Main Terms Content */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-10 text-slate-700 leading-relaxed">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 font-bold flex items-center justify-center text-sm border border-violet-100">
                01
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">User Roles & Account Registration</h2>
            </div>
            <p className="text-sm sm:text-base text-slate-600">
              TestWise provides distinct portal interfaces for students and educators:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm mb-1 text-violet-700">Student Accounts</h3>
                <p className="text-xs text-slate-600">
                  Individual learners take practice quizzes, mock competitive tests, access study notes, and participate in proctored exams assigned by their trainers. You are responsible for keeping your login credentials confidential.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm mb-1 text-teal-700">Teacher & Trainer Accounts</h3>
                <p className="text-xs text-slate-600">
                  Verified trainers can author questions in Aptitude, Reasoning, and Verbal domains, upload study resources, schedule live assessments, and inspect live proctoring telemetry for enrolled batches.
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
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">Academic Integrity & Proctoring Rules</h2>
            </div>
            <p className="text-sm sm:text-base text-slate-600">
              Fairness and honesty are central to competitive assessments. When attempting a proctored assessment, students agree:
            </p>
            <div className="p-5 rounded-2xl bg-rose-50/70 border border-rose-200 text-rose-950 space-y-2 text-xs sm:text-sm">
              <p className="font-bold text-rose-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Prohibited Conduct During Live Examinations
              </p>
              <ul className="list-disc pl-5 space-y-1 text-rose-800">
                <li>Switching browser tabs, opening developer inspect tools, or minimizing the exam window.</li>
                <li>Employing unauthorized AI extensions, secondary screens, or automated answer scrapers.</li>
                <li>Allowing a proxy individual to attempt the assessment under your name.</li>
                <li>Taking screenshots, recording, or redistributing proprietary question banks.</li>
              </ul>
              <p className="text-[11px] text-rose-700 pt-1">
                Violations are logged with high-precision timestamps and may lead to automatic disqualification or expulsion from the assessment batch by the trainer.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 font-bold flex items-center justify-center text-sm border border-violet-100">
                03
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">Content Ownership & Study Materials</h2>
            </div>
            <p className="text-sm sm:text-base text-slate-600">
              Educational materials shared on the platform adhere to these intellectual property guarantees:
            </p>
            <ul className="space-y-2 text-sm text-slate-700 pl-2">
              <li className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-violet-600 mt-2 shrink-0"></span>
                <span><strong>Trainer Content:</strong> Educators retain full copyright ownership of custom question banks, formulas, and study PDFs they upload.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-violet-600 mt-2 shrink-0"></span>
                <span><strong>Student Submissions:</strong> Answers and self-study notes remain the intellectual property of the respective student.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-violet-600 mt-2 shrink-0"></span>
                <span><strong>Platform Infrastructure:</strong> The TestWise user interface, proctoring algorithms, predictive analytics, and design are protected under copyright laws.</span>
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 font-bold flex items-center justify-center text-sm border border-violet-100">
                04
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">Subscription Plans & Billing</h2>
            </div>
            <p className="text-sm sm:text-base text-slate-600">
              TestWise provides transparent pricing without hidden renewal surcharges:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <div className="font-extrabold text-slate-900 mb-1">Student Free Tier</div>
                <div className="text-slate-500">Always ₹0. Unlimited self-practice tests, instant answer reviews, and assigned institutional exams.</div>
              </div>
              <div className="p-3.5 rounded-xl border border-violet-200 bg-violet-50/50">
                <div className="font-extrabold text-violet-900 mb-1">Pro Trainer (₹999/mo)</div>
                <div className="text-slate-600">Includes a 14-day free trial. Unlimited exam creation, AI proctoring, up to 500 active students. Cancel anytime.</div>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <div className="font-extrabold text-slate-900 mb-1">Enterprise Custom</div>
                <div className="text-slate-500">Custom volume agreements, dedicated account manager, API integrations, and tailored institute SLAs.</div>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-3 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 font-bold flex items-center justify-center text-sm border border-violet-100">
                05
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">Service Availability & Inquiries</h2>
            </div>
            <p className="text-sm sm:text-base text-slate-600">
              We maintain continuous assessment uptime (99.8% target) with real-time state synchronization, so temporary internet hiccups during tests do not erase completed responses.
            </p>
            <div className="mt-4 p-5 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-violet-400 font-bold mb-1">Legal Support & Agreements</p>
                <p className="text-sm font-semibold">Need custom institutional terms or procurement agreements?</p>
                <p className="text-xs text-slate-400">Write to us: support@gmail.com</p>
              </div>
              <Link
                href="/contact"
                className="py-2.5 px-4 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl shadow-md transition-all shrink-0 text-center"
              >
                Contact Enterprise Sales →
              </Link>
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
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/security" className="hover:text-white transition-colors">Security</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
