-- ============================================================
-- CleanMadurai.AI — Complete Supabase Schema (Merged)
-- Run this ONCE in the SQL Editor of your new Supabase project.
-- ============================================================

-- 1. Wards table (must come first — others reference it)
CREATE TABLE IF NOT EXISTS public.wards (
  id               SERIAL PRIMARY KEY,
  name             TEXT NOT NULL,
  zone             TEXT,
  councillor_name  TEXT,
  councillor_party TEXT,
  councillor_phone TEXT,
  councillor_email TEXT,
  population       INT,
  area_sqkm        DECIMAL,
  -- Swachh Survekshan KPI percentages (from reference project)
  door_to_door_pct         DECIMAL DEFAULT 37,
  segregation_pct          DECIMAL DEFAULT 26,
  processing_pct           DECIMAL DEFAULT 4,
  toilet_cleanliness_pct   DECIMAL DEFAULT 3,
  dumpsite_remediation_pct DECIMAL DEFAULT 25,
  center_lat       FLOAT,
  center_lng       FLOAT,
  boundary_polygon JSONB,
  scores           JSONB DEFAULT '{}'
);

-- 2. Profiles table (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  display_name TEXT,
  role TEXT CHECK (role IN ('admin_councillor', 'citizen')) DEFAULT 'citizen',
  ward_id INT REFERENCES public.wards(id),
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Complaints table
CREATE TABLE IF NOT EXISTS public.complaints (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tracking_id TEXT UNIQUE,
  user_id     UUID REFERENCES public.profiles(id),
  ward_id     INT REFERENCES public.wards(id),
  type        TEXT NOT NULL CHECK (type IN (
    'overflowing_bin','bulk_waste','missed_collection',
    'dirty_toilet','dead_animal','pest_sighting',
    'construction_debris','other'
  )),
  description TEXT,
  priority    TEXT DEFAULT 'medium' CHECK (priority IN ('critical','high','medium','low')),
  status      TEXT DEFAULT 'pending' CHECK (status IN ('pending','filed','assigned','dispatched','in_progress','resolved','escalated')),
  latitude    FLOAT,
  longitude   FLOAT,
  address     TEXT,
  photo_urls  TEXT[] DEFAULT '{}',
  photo_url   TEXT,
  assigned_lcv TEXT,
  assigned_to  UUID,
  councillor_notified BOOLEAN DEFAULT FALSE,
  resolution_photo_url TEXT,
  resolution_notes TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Auto-generate tracking IDs (e.g., CM-0001)
CREATE OR REPLACE FUNCTION public.generate_tracking_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.tracking_id := 'CM-' || LPAD(NEXTVAL('complaints_tracking_seq')::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS complaints_tracking_seq START 1;
CREATE TRIGGER set_tracking_id BEFORE INSERT ON public.complaints
  FOR EACH ROW WHEN (NEW.tracking_id IS NULL)
  EXECUTE FUNCTION public.generate_tracking_id();

-- 4. Timeline entries
CREATE TABLE IF NOT EXISTS public.complaint_timeline (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE NOT NULL,
  status       TEXT NOT NULL,
  message      TEXT,
  actor_id     UUID REFERENCES public.profiles(id),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 5. LCV Drivers / Workers
CREATE TABLE IF NOT EXISTS public.lcv_drivers (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name           TEXT NOT NULL,
  phone          TEXT,
  vehicle_number TEXT,
  ward_id        INT REFERENCES public.wards(id),
  assigned_zone  TEXT,
  status         TEXT DEFAULT 'available' CHECK (status IN ('available','dispatched','off_duty')),
  is_available   BOOLEAN DEFAULT TRUE,
  last_updated   TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Daily analytics (populated by edge function cron)
CREATE TABLE IF NOT EXISTS public.analytics_daily (
  report_date          DATE PRIMARY KEY DEFAULT CURRENT_DATE,
  total_complaints     INT DEFAULT 0,
  resolved_complaints  INT DEFAULT 0,
  avg_resolution_hours FLOAT DEFAULT 0,
  by_type              JSONB DEFAULT '{}',
  by_ward              JSONB DEFAULT '{}',
  by_priority          JSONB DEFAULT '{}'
);

-- 7. App config (key-value store for admin settings)
CREATE TABLE IF NOT EXISTS public.app_config (
  key        TEXT PRIMARY KEY,
  value      JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Performance Indexes (from reference project)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_complaints_ward ON public.complaints(ward_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON public.complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_created ON public.complaints(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_complaints_user ON public.complaints(user_id);

-- ============================================================
-- Auto-assign role trigger: first user = admin, rest = citizen
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_count INT;
  assigned_role TEXT;
BEGIN
  SELECT COUNT(*) INTO user_count FROM public.profiles;

  IF user_count = 0 THEN
    assigned_role := 'admin_councillor';
  ELSE
    assigned_role := 'citizen';
  END IF;

  INSERT INTO public.profiles (id, email, display_name, role, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    assigned_role,
    NOW()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Enable Realtime for complaints (live dashboard updates)
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.complaints;

-- ============================================================
-- Row Level Security (RLS) Policies
-- ============================================================

-- Create a secure function to get the current user's role without recursing into profiles policies
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admin reads all profiles" ON public.profiles FOR SELECT USING (
  public.get_my_role() = 'admin_councillor'
);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Complaints
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authed can read complaints" ON public.complaints FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Citizens create complaints" ON public.complaints FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Admin updates complaints" ON public.complaints FOR UPDATE USING (
  public.get_my_role() = 'admin_councillor'
);
CREATE POLICY "Citizens update own complaints" ON public.complaints FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admin deletes complaints" ON public.complaints FOR DELETE USING (
  public.get_my_role() = 'admin_councillor'
);

-- Complaint Timeline
ALTER TABLE public.complaint_timeline ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authed can read timeline" ON public.complaint_timeline FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Anyone authed can insert timeline" ON public.complaint_timeline FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Wards: public read
ALTER TABLE public.wards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read wards" ON public.wards FOR SELECT USING (true);
CREATE POLICY "Admin manages wards" ON public.wards FOR ALL USING (
  public.get_my_role() = 'admin_councillor'
);

-- LCV Drivers: admin only
ALTER TABLE public.lcv_drivers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manages drivers" ON public.lcv_drivers FOR ALL USING (
  public.get_my_role() = 'admin_councillor'
);

-- Analytics: admin read
ALTER TABLE public.analytics_daily ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin reads analytics" ON public.analytics_daily FOR SELECT USING (
  public.get_my_role() = 'admin_councillor'
);

-- ============================================================
-- Storage Bucket for complaint photos
-- ============================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('complaint-images', 'complaint-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Anyone can view complaint images" ON storage.objects;
CREATE POLICY "Anyone can view complaint images" ON storage.objects
  FOR SELECT USING (bucket_id = 'complaint-images');

DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
CREATE POLICY "Authenticated users can upload images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'complaint-images' AND auth.uid() IS NOT NULL);
