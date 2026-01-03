-- initial schema for GlobalTrotters Travel Planner

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  language_preference TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  cover_image TEXT,
  is_public BOOLEAN DEFAULT false,
  budget_limit DECIMAL(10, 2),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  city_name TEXT NOT NULL,
  country_name TEXT,
  arrival_date DATE,
  departure_date DATE,
  "order" INTEGER NOT NULL,
  lat DECIMAL(9, 6),
  lng DECIMAL(9, 6),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stop_id UUID REFERENCES stops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  start_time TIME,
  end_time TIME,
  cost DECIMAL(10, 2) DEFAULT 0.00,
  category TEXT, -- 'sightseeing', 'food', 'transport', 'lodging'
  "order" INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS shared_trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  shared_with_email TEXT NOT NULL,
  permission TEXT DEFAULT 'view', -- 'view', 'edit'
  created_at TIMESTAMPTZ DEFAULT now()
);
