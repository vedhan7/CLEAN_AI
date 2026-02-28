-- =================================================================
-- Notifications System for CleanMadurai.AI
-- Run this in Supabase SQL Editor
-- =================================================================

-- 1. Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title       TEXT NOT NULL,
  message     TEXT NOT NULL,
  type        TEXT DEFAULT 'complaint' CHECK (type IN ('complaint','status_update','system','alert')),
  complaint_id UUID REFERENCES public.complaints(id) ON DELETE SET NULL,
  ward_id     INT,
  is_read     BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.notifications(created_at DESC);

-- 2. Trigger function: notify councillors when a complaint is filed in their ward
CREATE OR REPLACE FUNCTION public.notify_councillor_on_complaint()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert a notification for every admin_councillor whose ward_id matches
  INSERT INTO public.notifications (user_id, title, message, type, complaint_id, ward_id)
  SELECT
    p.id,
    'New Complaint in Ward ' || NEW.ward_id,
    COALESCE(INITCAP(REPLACE(NEW.type, '_', ' ')), 'Issue') || ' reported: ' || COALESCE(LEFT(NEW.description, 80), 'No description') || CASE WHEN LENGTH(NEW.description) > 80 THEN '...' ELSE '' END,
    'complaint',
    NEW.id,
    NEW.ward_id
  FROM public.profiles p
  WHERE p.role = 'admin_councillor'
    AND (p.ward_id = NEW.ward_id OR p.ward_id IS NULL);
  -- Also notify councillors with no ward assigned (global admins)

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Attach trigger to complaints table
DROP TRIGGER IF EXISTS trg_notify_councillor ON public.complaints;
CREATE TRIGGER trg_notify_councillor
  AFTER INSERT ON public.complaints
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_councillor_on_complaint();

-- 4. Enable RLS on notifications (each user sees only their own)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);
