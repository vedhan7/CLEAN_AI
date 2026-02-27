-- Wards
CREATE TABLE wards (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  zone TEXT,
  councillor_name TEXT,
  councillor_party TEXT,
  councillor_phone TEXT,
  population INT,
  area_sqkm DECIMAL,
  door_to_door_pct DECIMAL DEFAULT 37,
  segregation_pct DECIMAL DEFAULT 26,
  processing_pct DECIMAL DEFAULT 4,
  toilet_cleanliness_pct DECIMAL DEFAULT 3,
  dumpsite_remediation_pct DECIMAL DEFAULT 25
);

-- Complaints
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE complaints (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tracking_id TEXT UNIQUE NOT NULL,
  ward_id INT REFERENCES wards(id),
  location GEOGRAPHY(POINT, 4326),
  issue_type TEXT NOT NULL CHECK (issue_type IN (
    'missed_collection', 'overflowing_bin', 'dirty_toilet',
    'pest_sighting', 'construction_debris', 'bulk_waste'
  )),
  description TEXT,
  photo_url TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('critical','high','medium','low')),
  status TEXT DEFAULT 'filed' CHECK (status IN ('filed','assigned','in_progress','resolved')),
  assigned_to UUID,
  councillor_notified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- Workers (LCV drivers)
CREATE TABLE workers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  ward_id INT REFERENCES wards(id),
  vehicle_id TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  current_location GEOGRAPHY(POINT, 4326),
  last_seen TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE complaints ADD CONSTRAINT fk_worker FOREIGN KEY (assigned_to) REFERENCES workers(id);

-- Indexes for performance
CREATE INDEX idx_complaints_ward ON complaints(ward_id);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_created ON complaints(created_at DESC);
CREATE INDEX idx_complaints_location ON complaints USING GIST(location);
CREATE INDEX idx_workers_ward ON workers(ward_id);
