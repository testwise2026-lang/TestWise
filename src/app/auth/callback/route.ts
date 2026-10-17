import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const role = searchParams.get('role')

  // Derive the public base URL (handling Vercel proxy headers)
  const forwardedHost = request.headers.get('x-forwarded-host')
  const isLocalEnv = process.env.NODE_ENV === 'development'
  const baseUrl = isLocalEnv ? origin : (forwardedHost ? `https://${forwardedHost}` : origin)

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The `setAll` method was called from a Server Component.
            }
          },
        },
      }
    )
    
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && session?.user) {
      // Check if user already has a profile
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()
        
      let finalRole = existingProfile?.role
      
      // If no profile or role exists, and a role was passed in the URL, set it
      if (!finalRole && role && (role === 'student' || role === 'teacher')) {
        const { error: insertError } = await supabase
          .from('profiles')
          .upsert({ 
            id: session.user.id,
            role: role,
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email || ''
          })
          
        if (!insertError) {
          finalRole = role
        } else {
          console.error('Failed to insert profile:', insertError)
        }
      }
      
      // Check if redirect destination is provided
      const next = searchParams.get('next') || searchParams.get('redirect')
      if (next && next.startsWith('/')) {
        return NextResponse.redirect(`${baseUrl}${next}`)
      }

      // Redirect to appropriate dashboard based on role
      if (finalRole === 'teacher') {
        return NextResponse.redirect(`${baseUrl}/teacher/dashboard`)
      } else if (finalRole === 'student') {
        return NextResponse.redirect(`${baseUrl}/student/dashboard`)
      }
    } else if (error) {
      console.error('OAuth code exchange error:', error)
    }
  }

  // Fallback redirect if something went wrong or no specific role could be determined
  return NextResponse.redirect(`${baseUrl}/`)
}
