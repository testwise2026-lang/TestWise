'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default function ContactPage() {
  const [copied, setCopied] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
    studentCount: '200-500',
    message: ''
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('support@gmail.com')
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    // Simulate brief network submission
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
    }, 600)
  }

  return (
    <div className="min-h-screen bg-[#F8F7F2] font-sans text-slate-900 selection:bg-violet-200 selection:text-violet-900 flex flex-col">
      <Navbar />

      {/* Main Content Container */}
      <main className="flex-1 pt-28 sm:pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Breadcrumb / Top Tag */}
        <div className="mb-6 flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <Link href="/" className="hover:text-violet-600 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/#pricing" className="hover:text-violet-600 transition-colors">Pricing</Link>
          <span>/</span>
          <span className="text-violet-600">Contact Sales</span>
        </div>

        {/* Page Header */}
        <div className="text-left mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-100/80 border border-violet-200 text-violet-700 text-xs font-bold uppercase tracking-wider mb-4">
            <span className="w-2 h-2 rounded-full bg-violet-600 animate-pulse"></span>
            Enterprise & Institutional Sales
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.2] mb-4">
            Contact Sales & Support
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
            Have questions about custom plans, high-volume student onboarding, or institutional testing? Speak directly with our team or drop us a line below.
          </p>
        </div>

        {/* Two-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Direct Contact Details & Guarantees (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Primary Email Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center border border-violet-100">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Active & Online
                </span>
              </div>

              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Official Sales & Support Email</h2>
              <a 
                href="mailto:support@gmail.com" 
                className="text-2xl sm:text-3xl font-black text-slate-900 hover:text-violet-600 transition-colors block mb-4 break-all"
              >
                support@gmail.com
              </a>

              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                Direct channel for enterprise quotes, trainer onboarding, technical escalations, and student queries.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <a 
                  href="mailto:support@gmail.com?subject=TestWise%20Sales%20Inquiry" 
                  className="flex-1 text-center py-3 px-4 rounded-xl font-bold text-sm bg-violet-600 text-white hover:bg-violet-700 shadow-sm transition-all transform hover:-translate-y-0.5"
                >
                  Send Email Directly
                </a>
                <button 
                  onClick={handleCopyEmail}
                  type="button"
                  className="py-3 px-4 rounded-xl font-bold text-sm bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200 transition-all flex items-center justify-center gap-2"
                >
                  {copied ? (
                    <>
                      <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-emerald-700">Copied!</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span>Copy Email</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Support Details & Working Hours */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Support Timings & Response</h3>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Working Hours</p>
                  <p className="text-xs text-slate-600 mt-0.5">Monday to Saturday: 9:00 AM – 6:00 PM IST</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Response Speed</p>
                  <p className="text-xs text-slate-600 mt-0.5">All enterprise queries answered in under 2 hours.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Dedicated Account Manager</p>
                  <p className="text-xs text-slate-600 mt-0.5">Custom setup & personal contact assigned to institutes.</p>
                </div>
              </div>
            </div>

            {/* Enterprise Perks Pill */}
            <div className="p-5 rounded-2xl bg-[#EDE9FE]/50 border border-violet-200/80">
              <p className="text-xs font-bold uppercase tracking-wider text-violet-800 mb-2">What Enterprise Includes</p>
              <ul className="text-xs text-slate-700 space-y-1.5">
                <li className="flex items-center gap-2">✓ Unlimited student batches & simultaneous tests</li>
                <li className="flex items-center gap-2">✓ AI Anti-Cheat proctoring with tab switch detection</li>
                <li className="flex items-center gap-2">✓ Custom institute logo & student rank certificates</li>
                <li className="flex items-center gap-2">✓ CSV/Excel student result export & predictive analytics</li>
              </ul>
            </div>

          </div>

          {/* Right Column: Direct Sales Inquiry Form (7 cols) */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm relative overflow-hidden">
              
              {isSubmitted ? (
                /* Success State */
                <div className="py-12 text-center space-y-5 animate-fade-in">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2">Inquiry Received Successfully!</h3>
                    <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                      Thank you for contacting TestWise Sales. Our team has received your message and will reach out to <span className="font-bold text-slate-800">{formData.email}</span> within 2 hours.
                    </p>
                  </div>
                  <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                    <Link 
                      href="/" 
                      className="px-6 py-3 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700 transition-colors text-sm shadow-sm"
                    >
                      Return to Home
                    </Link>
                    <button 
                      onClick={() => {
                        setIsSubmitted(false)
                        setFormData({ name: '', email: '', phone: '', organization: '', studentCount: '200-500', message: '' })
                      }}
                      className="px-6 py-3 bg-slate-100 text-slate-800 font-bold rounded-xl hover:bg-slate-200 transition-colors text-sm"
                    >
                      Send Another Message
                    </button>
                  </div>
                </div>
              ) : (
                /* Form State */
                <div>
                  <div className="mb-8">
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Request an Enterprise Quote</h2>
                    <p className="text-sm text-slate-600">
                      Fill out this quick form and our sales representative will get back to you with custom pricing and a personalized demo.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Full Name & Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                          Full Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g. Dr. Rajesh Kumar"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                          Work / Official Email <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="rajesh@college.edu"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-slate-900"
                        />
                      </div>
                    </div>

                    {/* Phone & Organization */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                          Phone Number <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+91 98765 43210"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                          College / Institute Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.organization}
                          onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                          placeholder="e.g. National Institute of Tech"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-slate-900"
                        />
                      </div>
                    </div>

                    {/* Student Count Dropdown */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Expected Number of Students
                      </label>
                      <select
                        value={formData.studentCount}
                        onChange={(e) => setFormData({ ...formData, studentCount: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-slate-900"
                      >
                        <option value="50-200">50 – 200 Students (Individual Trainer / Academy)</option>
                        <option value="200-500">200 – 500 Students (Small Institute)</option>
                        <option value="500-2000">500 – 2,000 Students (College / University Department)</option>
                        <option value="2000+">2,000+ Students (Full Campus / Multi-Branch Enterprise)</option>
                      </select>
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Specific Requirements or Questions
                      </label>
                      <textarea
                        rows={4}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Tell us about the exams you conduct, question bank size, or anti-cheat features you need..."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-slate-900 resize-none"
                      ></textarea>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 px-6 rounded-xl font-bold text-base bg-violet-600 text-white hover:bg-violet-700 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none"
                    >
                      {isSubmitting ? 'Sending Inquiry...' : 'Submit Sales Inquiry →'}
                    </button>

                    <p className="text-center text-xs text-slate-400">
                      We value your privacy. Your information will only be used to discuss your institutional assessment requirements.
                    </p>
                  </form>
                </div>
              )}

            </div>
          </div>

        </div>
      </main>

      {/* Classy Footer */}
      <footer className="bg-slate-950 text-slate-400 py-8 border-t border-slate-800 text-center text-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-sm">TestWise</span>
            <span>— Smart Online Assessments</span>
          </div>
          <p>© {new Date().getFullYear()} TestWise. All rights reserved. Support: support@gmail.com</p>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/#pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/#about" className="hover:text-white transition-colors">About</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
