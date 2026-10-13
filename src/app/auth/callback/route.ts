import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const role = searchParams.get('role')

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set(name, value, options)
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.delete(name)
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
      
      // Redirect to appropriate dashboard based on role
      if (finalRole === 'teacher') {
        return NextResponse.redirect(`${origin}/teacher/dashboard`)
      } else if (finalRole === 'student') {
        return NextResponse.redirect(`${origin}/student/dashboard`)
      }
    }
  }

  // Fallback redirect if something went wrong or no specific role could be determined
  return NextResponse.redirect(`${origin}/`)
}
