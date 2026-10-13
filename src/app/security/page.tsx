'use client'

import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default function SecurityCompliancePage() {
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
          <span className="text-violet-600">Security & Compliance</span>
        </div>

        {/* Page Header */}
        <div className="text-left mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 border border-teal-200 text-teal-800 text-xs font-bold uppercase tracking-wider mb-4">
            <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Enterprise-Grade Protection
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-3">
            Security & Compliance
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed mb-4">
            TestWise is engineered to meet the stringent security, anti-tampering, and reliability requirements expected by universities, competitive coaching institutes, and corporate hiring partners.
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Security Posture Verified: <strong>{lastUpdated}</strong></span>
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
            className="flex-1 min-w-[130px] text-center py-2.5 px-3 text-xs sm:text-sm font-bold rounded-xl text-slate-700 hover:text-slate-900 hover:bg-white/60 transition-all"
          >
            📜 Terms of Service
          </Link>
          <Link
            href="/security"
            className="flex-1 min-w-[130px] text-center py-2.5 px-3 text-xs sm:text-sm font-bold rounded-xl bg-violet-600 text-white shadow-sm transition-all"
          >
            🛡️ Security & Compliance
          </Link>
        </div>

        {/* Security Metric Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center shadow-sm">
            <div className="text-2xl font-black text-violet-600 mb-0.5">TLS 1.3</div>
            <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">End-to-End Encryption</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center shadow-sm">
            <div className="text-2xl font-black text-teal-600 mb-0.5">AES-256</div>
            <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Storage at Rest</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center shadow-sm">
            <div className="text-2xl font-black text-emerald-600 mb-0.5">99.8%</div>
            <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Proctoring Accuracy</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center shadow-sm">
            <div className="text-2xl font-black text-sky-600 mb-0.5">RBAC</div>
            <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Row-Level Security</div>
          </div>
        </div>

        {/* Main Security Content */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-10 text-slate-700 leading-relaxed">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 font-bold flex items-center justify-center text-sm border border-teal-100">
                01
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">Anti-Cheat Architecture & Proctoring Controls</h2>
            </div>
            <p className="text-sm sm:text-base text-slate-600">
              Online assessments require rigorous fraud prevention to maintain credential credibility. TestWise embeds multi-factor integrity monitors:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm mb-1 text-violet-700">Tab Switch & Screen Departure Interceptor</h3>
                <p className="text-xs text-slate-600">
                  Detects window blur, tab changes, and application minimizations. Every departure triggers a clear screen warning and increments the student's violation counter on the trainer's live monitor.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm mb-1 text-teal-700">Full-Screen Lockdown Enforcement</h3>
                <p className="text-xs text-slate-600">
                  Assessments run inside a guarded viewport. Attempting to open split-screen windows or secondary displays alerts the proctoring supervisor in real time.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm mb-1 text-amber-700">Automated Violation Thresholds</h3>
                <p className="text-xs text-slate-600">
                  Trainers can set automated auto-submission limits (e.g. 3 tab switches). Once exceeded, the assessment locks automatically to preserve testing standards.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm mb-1 text-sky-700">Time-Stamped Audit Ledger</h3>
                <p className="text-xs text-slate-600">
                  Every answer click, bookmark, and telemetry warning is cryptographically timestamped, preventing post-exam disputes or fabricated claims.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-3 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 font-bold flex items-center justify-center text-sm border border-teal-100">
                02
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">Database & Row-Level Security (RLS)</h2>
            </div>
            <p className="text-sm sm:text-base text-slate-600">
              We leverage PostgreSQL Row-Level Security policies to enforce zero-trust data segregation at the database engine level:
            </p>
            <ul className="space-y-2 text-sm text-slate-700 pl-2">
              <li className="flex items-start gap-2.5">
                <svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                <span><strong>Answer Key Isolation:</strong> Correct answer keys for live exams remain hidden on the server until the exam window has formally elapsed. Students cannot inspect HTTP responses to uncover solutions.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                <span><strong>Role Isolation:</strong> Student profiles are strictly restricted from calling trainer APIs or viewing other students' score reports.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                <span><strong>Protected Materials:</strong> Uploaded notes and formula PDFs are delivered via signed, authenticated sessions.</span>
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 font-bold flex items-center justify-center text-sm border border-teal-100">
                03
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">Network Resiliency & Offline Auto-Save</h2>
            </div>
            <p className="text-sm sm:text-base text-slate-600">
              Exam takers should never lose their work due to an unexpected WiFi glitch or brief network drop:
            </p>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs sm:text-sm">
              <p className="font-semibold text-slate-800">
                Continuous Local State Sync:
              </p>
              <p className="text-slate-600 leading-relaxed">
                As a student selects an option, the state is immediately stored in memory and synced to the secure server queue. If connectivity is briefly interrupted, the UI indicates reconnection mode and syncs the response as soon as the connection resumes, protecting the student's exam timer and answers.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 font-bold flex items-center justify-center text-sm border border-teal-100">
                04
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">Vulnerability Disclosure & Security Inquiries</h2>
            </div>
            <p className="text-sm sm:text-base text-slate-600">
              We welcome security researchers and institutional auditors to report potential vulnerabilities responsibly.
            </p>
            <div className="mt-4 p-5 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-teal-400 font-bold mb-1">Security Response Team</p>
                <p className="text-sm font-semibold">Need security questionnaires, SOC reports, or want to report a bug?</p>
                <p className="text-xs text-slate-400">Security Hotline: support@gmail.com</p>
              </div>
              <a
                href="mailto:support@gmail.com?subject=Security%20Vulnerability%20Report%20or%20Compliance%20Request"
                className="py-2.5 px-4 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow-md transition-all shrink-0 text-center"
              >
                Report Security Issue →
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
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

