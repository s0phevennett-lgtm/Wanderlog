-- Run this in Supabase SQL Editor

alter table live_locations add column if not exists message text;
alter table live_locations add column if not exists status text default 'Exploring';

alter table trips add column if not exists traveller_name text;
alter table trips add column if not exists description text;
alter table trips add column if not exists share_enabled boolean default true;
alter table trips add column if not exists view_count integer default 0;

create table if not exists stop_comments (
  id uuid primary key default gen_random_uuid(),
  stop_id uuid references stops(id) on delete cascade,
  author_name text not null,
  body text not null,
  parent_id uuid references stop_comments(id) on delete cascade,
  likes integer default 0,
  created_at timestamptz default now()
);

create table if not exists polls (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references trips(id) on delete cascade,
  stop_id uuid references stops(id) on delete set null,
  question text not null,
  closed boolean default false,
  created_at timestamptz default now()
);

create table if not exists poll_options (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid references polls(id) on delete cascade,
  label text not null,
  position integer default 0
);

create table if not exists poll_votes (
  id uuid primary key default gen_random_uuid(),
  poll_option_id uuid references poll_options(id) on delete cascade,
  voter_name text,
  voter_token text not null,
  created_at timestamptz default now(),
  unique(poll_option_id, voter_token)
);

create table if not exists photo_requests (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references trips(id) on delete cascade,
  stop_id uuid references stops(id) on delete set null,
  requester_name text not null,
  description text not null,
  status text default 'pending',
  completed_photo_id uuid references photos(id) on delete set null,
  created_at timestamptz default now()
);
