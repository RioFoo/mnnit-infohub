create table if not exists public.timetable_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  day text not null,
  start_time text not null,
  end_time text not null,
  subject_name text not null,
  class_type text default 'Lecture',
  venue text,
  color text default 'blue',
  notify_minutes int default 10,
  is_active boolean default true,
  created_at timestamptz default now()
);

alter table public.timetable_entries enable row level security;

create policy "Users can view own timetable" on public.timetable_entries
  for select using (auth.uid() = user_id);

create policy "Users can insert own timetable" on public.timetable_entries
  for insert with check (auth.uid() = user_id);

create policy "Users can update own timetable" on public.timetable_entries
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can delete own timetable" on public.timetable_entries
  for delete using (auth.uid() = user_id);

create index if not exists timetable_entries_user_id_idx on public.timetable_entries(user_id);