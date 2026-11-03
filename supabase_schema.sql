-- =========================================================================
-- Marksheet Helper - Supabase PostgreSQL Database Schema
-- Designed for Madrasa & School Marksheet Management (150+ Students)
-- Compatible with SKIMVB (Samastha Kerala Islam Matha Vidyabhyasa Board)
-- =========================================================================

-- 1. Enable UUID Extension (standard in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Classes Table: Stores class metadata, subjects, students list, and mark matrix
CREATE TABLE IF NOT EXISTS public.classes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL DEFAULT 'default_user',
    madrasa_name TEXT DEFAULT 'മദ്റസ',
    place TEXT DEFAULT '',
    skimvb_reg_no TEXT DEFAULT '',
    class_name TEXT NOT NULL,
    exam_name TEXT DEFAULT 'വാർഷിക പരീക്ഷ',
    term TEXT DEFAULT 'വാർഷിക പരീക്ഷ',
    academic_year TEXT DEFAULT '2025-2026',
    pass_percentage NUMERIC DEFAULT 36,
    topics JSONB DEFAULT '[]'::jsonb,
    students JSONB DEFAULT '[]'::jsonb,
    marks JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Madrasa Students Table: Relational index for 150+ students queries, ranks, and exports
CREATE TABLE IF NOT EXISTS public.madrasa_students (
    id TEXT PRIMARY KEY,
    class_id TEXT NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    roll_no TEXT,
    name TEXT NOT NULL,
    gender TEXT DEFAULT 'boy',
    attendance TEXT DEFAULT '',
    total_scored NUMERIC DEFAULT 0,
    total_max NUMERIC DEFAULT 0,
    rank TEXT DEFAULT '-',
    status TEXT DEFAULT '-',
    marks JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Madrasa Global Profile / Institution Settings
CREATE TABLE IF NOT EXISTS public.madrasa_profile (
    id TEXT PRIMARY KEY DEFAULT 'primary_madrasa',
    madrasa_name TEXT DEFAULT 'മദ്റസ',
    place TEXT DEFAULT '',
    skimvb_reg_no TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    headmaster_name TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Performance Indexes for fast queries across large student cohorts (150+ students)
CREATE INDEX IF NOT EXISTS idx_classes_user_id ON public.classes(user_id);
CREATE INDEX IF NOT EXISTS idx_students_class_id ON public.madrasa_students(class_id);
CREATE INDEX IF NOT EXISTS idx_students_gender ON public.madrasa_students(gender);
CREATE INDEX IF NOT EXISTS idx_students_status ON public.madrasa_students(status);

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.madrasa_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.madrasa_profile ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies: Allow Read, Insert, Update, Delete for Anon Key
-- Note: You can customize policies later to restrict by auth.uid() if using Supabase Auth.
DROP POLICY IF EXISTS "Anon public access for classes" ON public.classes;
CREATE POLICY "Anon public access for classes"
    ON public.classes
    FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Anon public access for students" ON public.madrasa_students;
CREATE POLICY "Anon public access for students"
    ON public.madrasa_students
    FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Anon public access for profile" ON public.madrasa_profile;
CREATE POLICY "Anon public access for profile"
    ON public.madrasa_profile
    FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- 8. Auto-update updated_at timestamp trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_classes_updated_at ON public.classes;
CREATE TRIGGER trigger_classes_updated_at
    BEFORE UPDATE ON public.classes
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_students_updated_at ON public.madrasa_students;
CREATE TRIGGER trigger_students_updated_at
    BEFORE UPDATE ON public.madrasa_students
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

