import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vlcwfakfskdiyynjwjpa.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsY3dmYWtmc2tkaXl5bmp3anBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTExNzQ1NDEsImV4cCI6MjEwNjc1MDU0MX0.cw3ZCM_50GMfEyoZWSoNHDF7cRFlBp2sifq0E-7rCwA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)