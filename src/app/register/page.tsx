'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/utils/supabase'
import { Eye, EyeOff } from 'lucide-react'

function AuthContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialMode = searchParams.get('mode') === 'login' ? 'signin' : 'signup'
  
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode)
  const [role, setRole] = useState<'student' | 'teacher' | null>(null)
  
  // Form State
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [organization, setOrganization] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  // Update mode if query param changes
  useEffect(() => {
    const queryMode = searchParams.get('mode')
    if (queryMode === 'login') {
      setMode('signin')
      setRole(null) // Reset role on mode switch
    } else if (queryMode === 'register') {
      setMode('signup')
      setRole(null)
    }
  }, [searchParams])

  // Clear errors when mode or role changes
  useEffect(() => {
    setError(null)
  }, [mode, role])

  const handleGoogleAuth = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?role=${role}`
        }
      })
      if (error) throw error
    } catch (err: any) {
      setError(err.message || 'An error occurred during Google authentication')
      setLoading(false)
    }
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (mode === 'signup') {
        if (!role) {
          setError('Please select a role')
          setLoading(false)
          return
        }
        
        if (password !== confirmPassword) {
          setError('Passwords do not match')
          setLoading(false)
          return
        }

        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        })

        if (authError) throw authError

        if (authData.user) {
          const profileData: any = {
            id: authData.user.id,
            name,
            email,
            role,
          }
          if (phone) profileData.phone = phone
          if (role === 'teacher' && organization) {
            // profileData.organization = organization // Requires adding organization column in Supabase DB
          }

          const { error: profileError } = await supabase.from('profiles').insert(profileData)
          
          if (profileError) throw profileError

          // Route to dashboard
          router.push(role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard')
        }
      } else {
        // Sign In
        if (!role) {
          setError('Please select a role to sign in as')
          setLoading(false)
          return
        }

        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) throw signInError

        // Verify the user role matches the selected role
        if (data.user) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .maybeSingle()

          let userRole = profileData?.role

          // If profile is missing (maybe due to a previous failed signup), create it now
          if (!profileData) {
             const { error: insertError } = await supabase.from('profiles').insert({
               id: data.user.id,
               email: email,
               role: role,
               name: email.split('@')[0]
             })
             if (insertError) {
               await supabase.auth.signOut()
               throw new Error('Please run the Database Setup SQL to allow profile creation: ' + insertError.message)
             }
             userRole = role
          } else if (profileError) {
             throw profileError
          }
          
          if (userRole !== role) {
            // Sign out immediately if role mismatch
            await supabase.auth.signOut()
            throw new Error(`Unauthorized: You are trying to sign in as a ${role === 'teacher' ? 'Teacher' : 'Student'}, but this account belongs to a ${userRole === 'teacher' ? 'Teacher' : 'Student'}.`)
          }

          // Cache in sessionStorage to make ProtectedRoute and Dashboard instant
          sessionStorage.setItem(`user_role_${data.user.id}`, userRole)

          router.push(userRole === 'teacher' ? '/teacher/dashboard' : '/student/dashboard')
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication')
    } finally {
      setLoading(false)
    }
  }

  const renderRoleSelection = () => (
    <div className="animate-in fade-in zoom-in-95 duration-300 w-full max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-[#17221B] mb-3">
          {mode === 'signup' ? 'Create your TestWise Account' : 'Welcome Back to TestWise'}
        </h2>
        <p className="text-[#68736C] text-lg">
          {mode === 'signup' ? 'Choose your role:' : 'Sign in as:'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Student Card */}
        <button
          onClick={() => setRole('student')}
          className="group relative flex flex-col items-center p-8 bg-white border border-[#DDE3DD] rounded-2xl hover:border-violet-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_20px_40px_-10px_rgba(139,92,246,0.15)] text-left w-full overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/0 via-violet-500/0 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="w-16 h-16 bg-[#F8F7F2] rounded-2xl flex items-center justify-center mb-6 group-hover:bg-violet-100 group-hover:text-violet-600 group-hover:scale-110 transition-all duration-300 text-[#68736C] relative z-10">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          </div>
          
          <h3 className="text-2xl font-bold text-[#17221B] group-hover:text-violet-600 transition-colors mb-3 relative z-10">Student</h3>
          <p className="text-sm text-[#68736C] group-hover:text-[#17221B] text-center transition-colors relative z-10 leading-relaxed">
            {mode === 'signup' ? 'Practice, take assessments and track your performance.' : 'Sign in to access your tests and performance dashboard.'}
          </p>
        </button>

        {/* Teacher Card */}
        <button
          onClick={() => setRole('teacher')}
          className="group relative flex flex-col items-center p-8 bg-white border border-[#DDE3DD] rounded-2xl hover:border-teal-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_20px_40px_-10px_rgba(20,184,166,0.15)] text-left w-full overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/0 via-teal-500/0 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="w-16 h-16 bg-[#F8F7F2] rounded-2xl flex items-center justify-center mb-6 group-hover:bg-teal-50 group-hover:text-teal-600 group-hover:scale-110 transition-all duration-300 text-[#68736C] relative z-10">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          
          <h3 className="text-2xl font-bold text-[#17221B] group-hover:text-teal-600 transition-colors mb-3 relative z-10">Teacher</h3>
          <p className="text-sm text-[#68736C] group-hover:text-[#17221B] text-center transition-colors relative z-10 leading-relaxed">
            {mode === 'signup' ? 'Create and manage assessments, students and results.' : 'Sign in to manage your assessments and students.'}
          </p>
        </button>
      </div>
    </div>
  )

  const renderForm = () => {
    const isTeacher = role === 'teacher'
    const themeColor = isTeacher ? 'teal' : 'violet'
    const colorClasses = {
      violet: {
        bg: 'bg-violet-600 hover:bg-violet-700 text-white',
        shadow: 'shadow-md shadow-violet-500/20 hover:shadow-lg hover:shadow-violet-500/30',
        text: 'text-violet-600',
        border: 'border-[#DDE3DD] focus:border-violet-500 focus:ring-violet-500/20'
      },
      teal: {
        bg: 'bg-teal-600 hover:bg-teal-700 text-white',
        shadow: 'shadow-md shadow-teal-500/20 hover:shadow-lg hover:shadow-teal-500/30',
        text: 'text-teal-600',
        border: 'border-[#DDE3DD] focus:border-teal-500 focus:ring-teal-500/20'
      }
    }[themeColor]

    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-400 w-full max-w-md mx-auto">
        
        <button 
          onClick={() => setRole(null)}
          className="flex items-center text-sm text-[#68736C] hover:text-[#17221B] transition-colors mb-6 group font-medium"
          type="button"
        >
          <svg className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to roles
        </button>

        <div className="text-center mb-8">
          <h2 className={`text-3xl font-extrabold mb-2 ${colorClasses.text}`}>
            {isTeacher ? 'Teacher' : 'Student'} {mode === 'signup' ? 'Sign Up' : 'Sign In'}
          </h2>
          <p className="text-[#68736C]">
            {mode === 'signin' ? 'Enter your credentials to access your account' : 'Fill in the details below to get started'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-start gap-3">
            <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-sm font-bold text-[#17221B] mb-1.5">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full bg-white border rounded-xl px-4 py-3 text-[#17221B] placeholder-[#68736C] focus:outline-none focus:ring-4 transition-all ${colorClasses.border}`}
                  placeholder="John Doe"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-bold text-[#17221B] mb-1.5">Email Address</label>
            <input 
               type="email" 
               required
               value={email}
               onChange={(e) => setEmail(e.target.value)}
               className={`w-full bg-white border rounded-xl px-4 py-3 text-[#17221B] placeholder-[#68736C] focus:outline-none focus:ring-4 transition-all ${colorClasses.border}`}
               placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#17221B] mb-1.5">Password</label>
            <div className="relative">
              <input 
                 type={showPassword ? "text" : "password"}
                 required
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 className={`w-full bg-white border rounded-xl pl-4 pr-12 py-3 text-[#17221B] placeholder-[#68736C] focus:outline-none focus:ring-4 transition-all ${colorClasses.border}`}
                 placeholder="••••••••"
                 minLength={6}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#68736C] hover:text-[#17221B] transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-sm font-bold text-[#17221B] mb-1.5">Confirm Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full bg-white border rounded-xl pl-4 pr-12 py-3 text-[#17221B] placeholder-[#68736C] focus:outline-none focus:ring-4 transition-all ${colorClasses.border}`}
                    placeholder="••••••••"
                    minLength={6}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#68736C] hover:text-[#17221B] transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-[#17221B] mb-1.5">Phone <span className="text-[#68736C] font-normal">(Optional)</span></label>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`w-full bg-white border rounded-xl px-4 py-3 text-[#17221B] placeholder-[#68736C] focus:outline-none focus:ring-4 transition-all ${colorClasses.border}`}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </>
          )}

          {mode === 'signup' && isTeacher && (
            <div>
              <label className="block text-sm font-bold text-[#17221B] mb-1.5">Organization / Institution</label>
              <input 
                type="text"
                required
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className={`w-full bg-white border rounded-xl px-4 py-3 text-[#17221B] placeholder-[#68736C] focus:outline-none focus:ring-4 transition-all ${colorClasses.border}`}
                placeholder="University or Company Name"
              />
            </div>
          )}

          {mode === 'signin' && (
            <div className="flex justify-end">
              <Link href="/forgot-password" className={`text-sm font-bold transition-colors hover:text-[#17221B] ${colorClasses.text}`}>
                Forgot Password?
              </Link>
            </div>
          )}

          <div className="pt-2">
            <button 
              type="submit" 
              disabled={loading}
              className={`w-full py-4 px-4 rounded-xl font-bold transition-all duration-300 transform hover:-translate-y-0.5 ${colorClasses.bg} ${colorClasses.shadow} disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
            >
              {loading ? 'Processing...' : mode === 'signin' ? `Sign In as ${isTeacher ? 'Teacher' : 'Student'}` : `Create ${isTeacher ? 'Teacher' : 'Student'} Account`}
            </button>
          </div>
        </form>

        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#DDE3DD]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[#F8F7F2] text-[#68736C] font-bold">OR</span>
            </div>
          </div>
          
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={loading}
            className="mt-6 w-full flex items-center justify-center gap-3 py-4 px-4 bg-white border-2 border-[#DDE3DD] rounded-xl font-bold text-[#17221B] hover:bg-gray-50 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F7F2] flex flex-col font-sans selection:bg-[#DDE3DD] selection:text-[#17221B]">
      
      {/* Header */}
      <div className="w-full p-6 relative z-10 flex justify-between items-center max-w-7xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-3 group">
          <div className="relative flex items-center justify-center w-10 h-10 bg-white rounded-xl border border-[#DDE3DD] text-[#17221B] shadow-sm group-hover:scale-110 transition-transform duration-300">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
          </div>
          <span className="font-extrabold text-2xl text-[#17221B] tracking-tight">TestWise</span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 w-full mx-auto">
        
        {/* Top Toggle Switcher */}
        {!role && (
          <div className="mb-8 flex justify-center">
            <div className="bg-white p-1.5 rounded-full border border-[#DDE3DD] inline-flex shadow-sm">
              <button
                onClick={() => {
                  setMode('signup')
                  setRole(null)
                }}
                className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                  mode === 'signup' 
                    ? 'bg-[#17221B] text-white shadow-md' 
                    : 'text-[#68736C] hover:text-[#17221B] hover:bg-[#F1F3EE]'
                }`}
              >
                Sign Up
              </button>
              <button
                onClick={() => {
                  setMode('signin')
                  setRole(null)
                }}
                className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                  mode === 'signin' 
                    ? 'bg-[#17221B] text-white shadow-md' 
                    : 'text-[#68736C] hover:text-[#17221B] hover:bg-[#F1F3EE]'
                }`}
              >
                Sign In
              </button>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="w-full relative">
          {role ? renderForm() : renderRoleSelection()}
        </div>

        {/* Footer Switcher */}
        <div className="mt-10 text-center w-full max-w-md mx-auto">
          {mode === 'signup' ? (
            <p className="text-[#68736C] font-medium">
              Already have an account?{' '}
              <button 
                onClick={() => {
                  setMode('signin')
                  setRole(null)
                }}
                className="font-bold text-[#17221B] hover:underline"
              >
                Sign In
              </button>
            </p>
          ) : (
            <p className="text-[#68736C] font-medium">
              Don't have an account?{' '}
              <button 
                onClick={() => {
                  setMode('signup')
                  setRole(null)
                }}
                className="font-bold text-[#17221B] hover:underline"
              >
                Sign Up
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8F7F2] flex items-center justify-center font-bold text-[#17221B]">Loading...</div>}>
      <AuthContent />
    </Suspense>
  )
}
