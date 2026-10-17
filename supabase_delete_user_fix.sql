-- ==============================================================================
-- TestWise Fix: Allow deleting users from Supabase Auth Dashboard
-- Fixes: "Failed to delete user: Database error deleting user"
-- ==============================================================================
-- 
-- WHY THIS ERROR HAPPENS:
-- When you try to delete a user in the Supabase Auth Dashboard, PostgreSQL attempts:
--   DELETE FROM auth.users WHERE id = '...';
-- If tables like 'public.profiles', 'public.tests', 'public.test_attempts' have 
-- foreign keys pointing to auth.users WITHOUT "ON DELETE CASCADE", PostgreSQL blocks
-- the deletion to prevent orphaned rows, resulting in "Database error deleting user".
--
-- Running this script adds "ON DELETE CASCADE" to all foreign keys referencing auth.users.
-- After running this, deleting users in the Supabase Dashboard will work instantly!
-- ==============================================================================

DO $$
DECLARE
    r RECORD;
BEGIN
    -- 1. Automatically find all foreign keys referencing auth.users and recreate with ON DELETE CASCADE
    FOR r IN (
        SELECT
            tc.table_schema, 
            tc.table_name, 
            kcu.column_name, 
            tc.constraint_name
        FROM 
            information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
              AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' 
          AND ccu.table_name = 'users'
          AND ccu.table_schema = 'auth'
    ) LOOP
        RAISE NOTICE 'Updating constraint % on %.% (column: %)', r.constraint_name, r.table_schema, r.table_name, r.column_name;
        EXECUTE format('ALTER TABLE %I.%I DROP CONSTRAINT IF EXISTS %I;', r.table_schema, r.table_name, r.constraint_name);
        EXECUTE format('ALTER TABLE %I.%I ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES auth.users(id) ON DELETE CASCADE;', 
                       r.table_schema, r.table_name, r.constraint_name, r.column_name);
    END LOOP;

    -- 2. Automatically find all foreign keys referencing public.profiles and recreate with ON DELETE CASCADE
    FOR r IN (
        SELECT
            tc.table_schema, 
            tc.table_name, 
            kcu.column_name, 
            tc.constraint_name
        FROM 
            information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
              AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' 
          AND ccu.table_name = 'profiles'
          AND ccu.table_schema = 'public'
    ) LOOP
        RAISE NOTICE 'Updating constraint % on %.% (column: %)', r.constraint_name, r.table_schema, r.table_name, r.column_name;
        EXECUTE format('ALTER TABLE %I.%I DROP CONSTRAINT IF EXISTS %I;', r.table_schema, r.table_name, r.constraint_name);
        EXECUTE format('ALTER TABLE %I.%I ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES public.profiles(id) ON DELETE CASCADE;', 
                       r.table_schema, r.table_name, r.constraint_name, r.column_name);
    END LOOP;

    -- 3. Explicit check for common tables to guarantee ON DELETE CASCADE
    -- PROFILES table
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
      -- Drop common fkey names if they exist
      ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
      ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;
      
      -- Re-add with CASCADE
      ALTER TABLE public.profiles 
        ADD CONSTRAINT profiles_id_fkey 
        FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;

    -- TEST_ATTEMPTS table
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'test_attempts') THEN
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'test_attempts' AND column_name = 'user_id') THEN
        ALTER TABLE public.test_attempts DROP CONSTRAINT IF EXISTS test_attempts_user_id_fkey;
        ALTER TABLE public.test_attempts ADD CONSTRAINT test_attempts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
      END IF;
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'test_attempts' AND column_name = 'student_id') THEN
        ALTER TABLE public.test_attempts DROP CONSTRAINT IF EXISTS test_attempts_student_id_fkey;
        ALTER TABLE public.test_attempts ADD CONSTRAINT test_attempts_student_id_fkey FOREIGN KEY (student_id) REFERENCES auth.users(id) ON DELETE CASCADE;
      END IF;
    END IF;

    -- FEEDBACK table
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'feedback') THEN
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'feedback' AND column_name = 'user_id') THEN
        ALTER TABLE public.feedback DROP CONSTRAINT IF EXISTS feedback_user_id_fkey;
        ALTER TABLE public.feedback ADD CONSTRAINT feedback_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
      END IF;
    END IF;

END $$;

-- Verify all foreign keys pointing to auth.users now have CASCADE
SELECT 
    tc.table_name, 
    kcu.column_name, 
    rc.delete_rule
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu 
      ON tc.constraint_name = kcu.constraint_name 
    JOIN information_schema.referential_constraints AS rc 
      ON tc.constraint_name = rc.constraint_name 
    JOIN information_schema.constraint_column_usage AS ccu 
      ON ccu.constraint_name = tc.constraint_name 
WHERE 
    tc.constraint_type = 'FOREIGN KEY' 
    AND ccu.table_name = 'users' 
    AND ccu.table_schema = 'auth';

