-- =================================================================
-- Sample Data for CleanMadurai.AI
-- Run this in Supabase SQL Editor AFTER:
--   1. Running the initial schema migration
--   2. Running the ward seed (seed_wards.sql)
--   3. Having at least 1 user signed up (so a profile exists)
-- =================================================================

-- Use the first existing profile as the reporter for sample complaints
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id FROM public.profiles LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No profiles found. Sign up at least one user first!';
  END IF;

  -- Insert 25 sample complaints spread across wards, types, priorities, statuses
  INSERT INTO public.complaints (user_id, ward_id, type, description, priority, status, latitude, longitude, address) VALUES
  -- Pending complaints (new, unhandled)
  (v_user_id, 1,  'overflowing_bin',     'Large community bin overflowing near Meenakshi Temple entrance. Waste spilling onto the road.',               'critical', 'pending',    9.9195, 78.1193, 'East Masi St, Ward 1'),
  (v_user_id, 3,  'bulk_waste',          'Construction debris dumped on the roadside near Anna Nagar junction.',                                         'high',     'pending',    9.9302, 78.1245, 'Anna Nagar, Ward 3'),
  (v_user_id, 7,  'missed_collection',   'Garbage collection truck has not arrived for 3 days in this area.',                                            'high',     'pending',    9.9350, 78.1100, 'KK Nagar Main Rd, Ward 7'),
  (v_user_id, 12, 'dirty_toilet',        'Public toilet near the bus stand is extremely dirty and non-functional.',                                      'critical', 'pending',    9.9180, 78.1350, 'Periyar Bus Stand, Ward 12'),
  (v_user_id, 15, 'pest_sighting',       'Large rat colony spotted near the market drain. Health risk for nearby residents.',                            'high',     'pending',    9.9220, 78.1150, 'Vilakku Thoon, Ward 15'),
  (v_user_id, 22, 'overflowing_bin',     'Bin near school gate is always full by morning. Kids have to walk through garbage.',                           'medium',   'pending',    9.9100, 78.1250, 'School Lane, Ward 22'),
  (v_user_id, 28, 'construction_debris', 'Tiles and cement bags dumped illegally at the corner of the residential area.',                                'medium',   'pending',    9.9400, 78.1050, 'Thiruparankundram Rd, Ward 28'),

  -- Assigned / Dispatched complaints (being handled)
  (v_user_id, 5,  'overflowing_bin',     'Multiple bins overflowing outside the vegetable market. Strong odour reported by residents.',                  'critical', 'dispatched', 9.9250, 78.1200, 'South Masi St, Ward 5'),
  (v_user_id, 9,  'dead_animal',         'Dead stray dog found near the park entrance. Needs immediate removal.',                                       'critical', 'dispatched', 9.9330, 78.1180, 'Tallakulam Park, Ward 9'),
  (v_user_id, 14, 'missed_collection',   'Door-to-door collection missed for the entire street for 2 days.',                                            'high',     'assigned',   9.9210, 78.1280, 'South Gate, Ward 14'),
  (v_user_id, 18, 'bulk_waste',          'Old furniture and mattresses dumped on the pavement blocking pedestrian path.',                                'medium',   'dispatched', 9.9380, 78.1320, 'Bypass Rd, Ward 18'),
  (v_user_id, 25, 'dirty_toilet',        'Community toilet block has blocked drains and no running water.',                                              'high',     'assigned',   9.9150, 78.1100, 'Alanganallur Rd, Ward 25'),
  (v_user_id, 31, 'other',              'Stagnant water accumulation near garbage dump attracting mosquitoes.',                                          'high',     'dispatched', 9.9280, 78.1350, 'Corporation Colony, Ward 31'),

  -- In-progress complaints (crew is on-site)
  (v_user_id, 2,  'overflowing_bin',     'Crew is clearing the overflowing skip bin near the temple. Expected to finish by evening.',                    'high',     'in_progress',9.9260, 78.1210, 'North Masi St, Ward 2'),
  (v_user_id, 10, 'bulk_waste',          'Cleanup crew removing construction waste from residential area.',                                              'medium',   'in_progress',9.9310, 78.1090, 'Gomathipuram, Ward 10'),
  (v_user_id, 20, 'pest_sighting',       'Corporation pest control team has been dispatched. Fogging in progress.',                                      'high',     'in_progress',9.9170, 78.1300, 'Teppakulam, Ward 20'),

  -- Resolved complaints (completed)
  (v_user_id, 4,  'missed_collection',   'Garbage truck schedule restored after citizen complaint. Collection is now regular.',                          'medium',   'resolved',   9.9290, 78.1160, 'SS Colony, Ward 4'),
  (v_user_id, 8,  'overflowing_bin',     'Additional bin installed at the hotspot location. Area cleaned thoroughly.',                                   'high',     'resolved',   9.9240, 78.1230, 'West Masi St, Ward 8'),
  (v_user_id, 11, 'dirty_toilet',        'Public toilet renovated with new plumbing and daily cleaning schedule established.',                           'critical', 'resolved',   9.9320, 78.1070, 'Mattuthavani, Ward 11'),
  (v_user_id, 16, 'dead_animal',         'Animal carcass removed and area sanitized by corporation health team.',                                        'medium',   'resolved',   9.9200, 78.1140, 'Palanganatham, Ward 16'),
  (v_user_id, 19, 'construction_debris', 'Fine issued to the violator. Debris cleared by corporation workers within 24 hours.',                          'low',      'resolved',   9.9360, 78.1260, 'Sellur, Ward 19'),
  (v_user_id, 23, 'overflowing_bin',     'Replaced damaged bin with new 660L bin. Waste clearance frequency increased to twice daily.',                  'medium',   'resolved',   9.9130, 78.1180, 'Simmakal, Ward 23'),
  (v_user_id, 30, 'bulk_waste',          'Illegal dumping site cleared. CCTV camera installed to prevent recurrence.',                                   'high',     'resolved',   9.9390, 78.1300, 'Vilangudi, Ward 30'),
  (v_user_id, 35, 'missed_collection',   'Root cause was vehicle breakdown. Backup LCV assigned permanently to this route.',                             'low',      'resolved',   9.9160, 78.1220, 'Pudur, Ward 35'),
  (v_user_id, 42, 'other',              'Stagnant water drained and area treated with anti-larval spray.',                                               'medium',   'resolved',   9.9270, 78.1170, 'Arasaradi, Ward 42');

  -- Insert sample LCV drivers
  INSERT INTO public.lcv_drivers (name, phone, vehicle_number, ward_id, status) VALUES
  ('Muthu Kumar',       '+91 9842101234', 'TN-59-AB-1234', 1,  'available'),
  ('Selva Ganesh',      '+91 9842105678', 'TN-59-CD-5678', 5,  'dispatched'),
  ('Ravi Chandran',     '+91 9842109012', 'TN-59-EF-9012', 9,  'available'),
  ('Karthik Raja',      '+91 9842103456', 'TN-59-GH-3456', 14, 'dispatched'),
  ('Senthil Nathan',    '+91 9842107890', 'TN-59-IJ-7890', 20, 'available'),
  ('Bala Murugan',      '+91 9842102345', 'TN-59-KL-2345', 25, 'off_duty'),
  ('Durai Pandian',     '+91 9842106789', 'TN-59-MN-6789', 30, 'available'),
  ('Arjun Raj',         '+91 9842100123', 'TN-59-OP-0123', 35, 'dispatched'),
  ('Vignesh Kumar',     '+91 9842104567', 'TN-59-QR-4567', 42, 'available'),
  ('Manikandan',        '+91 9842108901', 'TN-59-ST-8901', 50, 'available')
  ON CONFLICT DO NOTHING;

  -- Insert timeline entries for dispatched/in_progress/resolved complaints
  INSERT INTO public.complaint_timeline (complaint_id, status, message, actor_id)
  SELECT c.id, c.status,
    CASE c.status
      WHEN 'dispatched'  THEN 'LCV dispatched to location'
      WHEN 'assigned'    THEN 'Assigned to ward sanitary inspector'
      WHEN 'in_progress' THEN 'Crew on site, cleanup in progress'
      WHEN 'resolved'    THEN 'Issue resolved and verified'
      ELSE 'Status updated'
    END,
    v_user_id
  FROM public.complaints c
  WHERE c.status != 'pending';

  RAISE NOTICE 'Successfully seeded % complaints, 10 LCV drivers, and timeline entries.', (SELECT COUNT(*) FROM public.complaints);
END $$;
