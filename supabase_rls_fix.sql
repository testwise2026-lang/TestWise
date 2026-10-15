-- ==============================================================================
-- TestWise Production-Ready Database RLS & Schema Fix
-- Run this script in your Supabase Project SQL Editor (https://supabase.com/dashboard)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. PROFILES TABLE: Full access for reading and updating profiles
-- ------------------------------------------------------------------------------
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read profiles" ON profiles;
DROP POLICY IF EXISTS "Allow public read profiles" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated to read profiles" ON profiles;
DROP POLICY IF EXISTS "Allow insert own profile" ON profiles;
DROP POLICY IF EXISTS "Allow all profile insert" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Allow update own profile" ON profiles;
DROP POLICY IF EXISTS "Allow all profile update" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated insert profiles" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated update profiles" ON profiles;

CREATE POLICY "Allow read profiles" 
ON profiles FOR SELECT 
USING (true);

CREATE POLICY "Allow authenticated insert profiles" 
ON profiles FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Allow authenticated update profiles" 
ON profiles FOR UPDATE 
TO authenticated 
USING (true)
WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 2. TESTS TABLE: Full CRUD permissions for authenticated teachers/users
-- ------------------------------------------------------------------------------
ALTER TABLE IF EXISTS tests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Teachers can insert tests" ON tests;
DROP POLICY IF EXISTS "Teachers can update own tests" ON tests;
DROP POLICY IF EXISTS "Teachers can delete own tests" ON tests;
DROP POLICY IF EXISTS "Allow read tests" ON tests;
DROP POLICY IF EXISTS "Allow public read active tests" ON tests;
DROP POLICY IF EXISTS "Allow authenticated manage tests" ON tests;
DROP POLICY IF EXISTS "Allow authenticated insert tests" ON tests;
DROP POLICY IF EXISTS "Allow authenticated update tests" ON tests;
DROP POLICY IF EXISTS "Allow authenticated delete tests" ON tests;

-- Public and authenticated users can view tests
CREATE POLICY "Allow read tests" 
ON tests FOR SELECT 
USING (true);

-- Authenticated teachers and users can create tests
CREATE POLICY "Allow authenticated insert tests" 
ON tests FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Authenticated users can update tests
CREATE POLICY "Allow authenticated update tests" 
ON tests FOR UPDATE 
TO authenticated 
USING (true)
WITH CHECK (true);

-- Authenticated users can delete tests
CREATE POLICY "Allow authenticated delete tests" 
ON tests FOR DELETE 
TO authenticated 
USING (true);

-- ------------------------------------------------------------------------------
-- 3. QUESTIONS TABLE: Full CRUD permissions
-- ------------------------------------------------------------------------------
ALTER TABLE IF EXISTS questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Teachers can insert questions" ON questions;
DROP POLICY IF EXISTS "Teachers can update questions" ON questions;
DROP POLICY IF EXISTS "Teachers can delete questions" ON questions;
DROP POLICY IF EXISTS "Allow read questions" ON questions;
DROP POLICY IF EXISTS "Allow public read questions" ON questions;
DROP POLICY IF EXISTS "Allow authenticated insert questions" ON questions;
DROP POLICY IF EXISTS "Allow authenticated update questions" ON questions;
DROP POLICY IF EXISTS "Allow authenticated delete questions" ON questions;

CREATE POLICY "Allow read questions" 
ON questions FOR SELECT 
USING (true);

CREATE POLICY "Allow authenticated insert questions" 
ON questions FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Allow authenticated update questions" 
ON questions FOR UPDATE 
TO authenticated 
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated delete questions" 
ON questions FOR DELETE 
TO authenticated 
USING (true);

-- ------------------------------------------------------------------------------
-- 4. CONDITIONAL POLICIES FOR OPTIONAL/ADDITIONAL TABLES
-- (Safely applied only if the table exists, preventing relation does not exist errors)
-- ------------------------------------------------------------------------------
DO $$
BEGIN
  -- Test attempts table (if exists)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'test_attempts') THEN
    EXECUTE 'ALTER TABLE test_attempts ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "Allow read test_attempts" ON test_attempts';
    EXECUTE 'CREATE POLICY "Allow read test_attempts" ON test_attempts FOR SELECT USING (true)';
    EXECUTE 'DROP POLICY IF EXISTS "Allow authenticated insert test_attempts" ON test_attempts';
    EXECUTE 'CREATE POLICY "Allow authenticated insert test_attempts" ON test_attempts FOR INSERT TO authenticated WITH CHECK (true)';
    EXECUTE 'DROP POLICY IF EXISTS "Allow authenticated update test_attempts" ON test_attempts';
    EXECUTE 'CREATE POLICY "Allow authenticated update test_attempts" ON test_attempts FOR UPDATE TO authenticated USING (true) WITH CHECK (true)';
    EXECUTE 'DROP POLICY IF EXISTS "Allow authenticated delete test_attempts" ON test_attempts';
    EXECUTE 'CREATE POLICY "Allow authenticated delete test_attempts" ON test_attempts FOR DELETE TO authenticated USING (true)';
  END IF;

  -- Student answers table (if exists)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'student_answers') THEN
    EXECUTE 'ALTER TABLE student_answers ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "Allow read student_answers" ON student_answers';
    EXECUTE 'CREATE POLICY "Allow read student_answers" ON student_answers FOR SELECT USING (true)';
    EXECUTE 'DROP POLICY IF EXISTS "Allow authenticated insert student_answers" ON student_answers';
    EXECUTE 'CREATE POLICY "Allow authenticated insert student_answers" ON student_answers FOR INSERT TO authenticated WITH CHECK (true)';
    EXECUTE 'DROP POLICY IF EXISTS "Allow authenticated update student_answers" ON student_answers';
    EXECUTE 'CREATE POLICY "Allow authenticated update student_answers" ON student_answers FOR UPDATE TO authenticated USING (true) WITH CHECK (true)';
    EXECUTE 'DROP POLICY IF EXISTS "Allow authenticated delete student_answers" ON student_answers';
    EXECUTE 'CREATE POLICY "Allow authenticated delete student_answers" ON student_answers FOR DELETE TO authenticated USING (true)';
  END IF;

  -- Study materials table (if exists)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'study_materials') THEN
    EXECUTE 'ALTER TABLE study_materials ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "Allow read study_materials" ON study_materials';
    EXECUTE 'CREATE POLICY "Allow read study_materials" ON study_materials FOR SELECT USING (true)';
    EXECUTE 'DROP POLICY IF EXISTS "Allow authenticated insert study_materials" ON study_materials';
    EXECUTE 'CREATE POLICY "Allow authenticated insert study_materials" ON study_materials FOR INSERT TO authenticated WITH CHECK (true)';
    EXECUTE 'DROP POLICY IF EXISTS "Allow authenticated update study_materials" ON study_materials';
    EXECUTE 'CREATE POLICY "Allow authenticated update study_materials" ON study_materials FOR UPDATE TO authenticated USING (true) WITH CHECK (true)';
    EXECUTE 'DROP POLICY IF EXISTS "Allow authenticated delete study_materials" ON study_materials';
    EXECUTE 'CREATE POLICY "Allow authenticated delete study_materials" ON study_materials FOR DELETE TO authenticated USING (true)';
  END IF;

  -- Feedback table (if exists)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'feedback') THEN
    EXECUTE 'ALTER TABLE feedback ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "Allow read feedback" ON feedback';
    EXECUTE 'CREATE POLICY "Allow read feedback" ON feedback FOR SELECT USING (true)';
    EXECUTE 'DROP POLICY IF EXISTS "Allow insert feedback" ON feedback';
    EXECUTE 'CREATE POLICY "Allow insert feedback" ON feedback FOR INSERT WITH CHECK (true)';
  END IF;

  -- Cascading foreign keys for clean deletions
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'questions_test_id_fkey'
  ) THEN
    ALTER TABLE questions DROP CONSTRAINT questions_test_id_fkey;
    ALTER TABLE questions ADD CONSTRAINT questions_test_id_fkey 
      FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'test_attempts_test_id_fkey'
  ) THEN
    ALTER TABLE test_attempts DROP CONSTRAINT test_attempts_test_id_fkey;
    ALTER TABLE test_attempts ADD CONSTRAINT test_attempts_test_id_fkey 
      FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'student_answers_attempt_id_fkey'
  ) THEN
    ALTER TABLE student_answers DROP CONSTRAINT student_answers_attempt_id_fkey;
    ALTER TABLE student_answers ADD CONSTRAINT student_answers_attempt_id_fkey 
      FOREIGN KEY (attempt_id) REFERENCES test_attempts(id) ON DELETE CASCADE;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'student_answers_question_id_fkey'
  ) THEN
    ALTER TABLE student_answers DROP CONSTRAINT student_answers_question_id_fkey;
    ALTER TABLE student_answers ADD CONSTRAINT student_answers_question_id_fkey 
      FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE;
  END IF;
END $$;
