-- ==============================================================================
-- TestWise: Teacher Class Cohorts & Multi-Institution Roster Schema
-- Run this in Supabase SQL Editor to enable database-backed student roster management.
-- ==============================================================================

-- 1. Create teacher_institutions table (Supports Multi-College teaching: Full-time + Part-time)
CREATE TABLE IF NOT EXISTS public.teacher_institutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT,
    location TEXT,
    type TEXT DEFAULT 'Full-Time',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create teacher_classes table (Stream, Branch, Year, Section per institution)
CREATE TABLE IF NOT EXISTS public.teacher_classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    institution_id UUID REFERENCES public.teacher_institutions(id) ON DELETE CASCADE,
    stream TEXT NOT NULL,
    branch TEXT NOT NULL,
    year TEXT NOT NULL,
    section TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_teacher_class_section UNIQUE(teacher_id, institution_id, stream, branch, year, section)
);

-- 3. Create class_students table (Students enrolled in each section)
CREATE TABLE IF NOT EXISTS public.class_students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES public.teacher_classes(id) ON DELETE CASCADE,
    roll_number TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    student_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_student_per_class UNIQUE(class_id, roll_number)
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.teacher_institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_students ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
DROP POLICY IF EXISTS "Teachers can manage their institutions" ON public.teacher_institutions;
CREATE POLICY "Teachers can manage their institutions" 
    ON public.teacher_institutions FOR ALL 
    USING (auth.uid() = teacher_id) 
    WITH CHECK (auth.uid() = teacher_id);

DROP POLICY IF EXISTS "Teachers can manage their classes" ON public.teacher_classes;
CREATE POLICY "Teachers can manage their classes" 
    ON public.teacher_classes FOR ALL 
    USING (auth.uid() = teacher_id) 
    WITH CHECK (auth.uid() = teacher_id);

DROP POLICY IF EXISTS "Teachers can manage students in their classes" ON public.class_students;
CREATE POLICY "Teachers can manage students in their classes" 
    ON public.class_students FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.teacher_classes tc 
            WHERE tc.id = class_students.class_id AND tc.teacher_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.teacher_classes tc 
            WHERE tc.id = class_students.class_id AND tc.teacher_id = auth.uid()
        )
    );

-- 6. Indexes for fast query lookup
CREATE INDEX IF NOT EXISTS idx_teacher_classes_teacher ON public.teacher_classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_class_students_roll ON public.class_students(roll_number);
CREATE INDEX IF NOT EXISTS idx_class_students_class ON public.class_students(class_id);

