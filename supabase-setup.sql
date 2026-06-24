-- Run this in Supabase SQL Editor

create table trips (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  start_date date,
  end_date date,
  admin_token uuid not null default gen_random_uuid(),
  created_at timestamptz default now()
);

create table stops (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references trips(id) on delete cascade,
  name text not null,
  lat double precision,
  lng double precision,
  arrival_date date,
  departure_date date,
  notes text default '',
  position integer default 0
);

create table photos (
  id uuid primary key default gen_random_uuid(),
  stop_id uuid references stops(id) on delete cascade,
  storage_path text not null,
  caption text default '',
  uploaded_at timestamptz default now()
);

create table reactions (
  id uuid primary key default gen_random_uuid(),
  photo_id uuid references photos(id) on delete cascade,
  emoji text not null,
  reactor_name text,
  created_at timestamptz default now()
);

create table comments (
  id uuid primary key default gen_random_uuid(),
  photo_id uuid references photos(id) on delete cascade,
  author_name text not null,
  body text not null,
  created_at timestamptz default now()
);

create table live_locations (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references trips(id) on delete cascade unique,
  stop_id uuid,
  lat double precision,
  lng double precision,
  updated_at timestamptz default now()
);
