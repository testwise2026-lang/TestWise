'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase'

export default function ProtectedRoute({ children, allowedRole }: { children: React.ReactNode, allowedRole: 'student' | 'teacher' }) {
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          router.push('/login')
          return
        }

        // Fast path: Check cached role in sessionStorage
        const cachedRole = sessionStorage.getItem(`user_role_${session.user.id}`)
        const requiredDbRole = allowedRole === 'teacher' ? 'teacher' : 'student'

        if (cachedRole === requiredDbRole) {
          setLoading(false)
          return
        }

        // Fetch profile to check role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .maybeSingle()
        
        // If no profile exists at all (e.g., failed signup), log them out so they can sign in and trigger the auto-fix
        if (!profile) {
          await supabase.auth.signOut()
          router.push('/login')
          return
        }

        // Cache valid role in session storage for fast transitions
        sessionStorage.setItem(`user_role_${session.user.id}`, profile.role)
        
        if (profile.role !== requiredDbRole) {
          // Wrong role, redirect to their proper dashboard
          if (profile.role === 'teacher') router.push('/teacher/dashboard')
          else if (profile.role === 'student') router.push('/student/dashboard')
          else router.push('/login')
          return
        }

        setLoading(false)
      } catch (error) {
        console.error('Error checking auth:', error)
        await supabase.auth.signOut()
        router.push('/login')
      }
    }

    checkAuth()
  }, [router, allowedRole])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F7F2] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-600 font-medium">Verifying access...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

