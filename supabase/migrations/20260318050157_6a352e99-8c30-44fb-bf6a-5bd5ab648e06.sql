
create type public.application_stage as enum (
  'saved',
  'applied',
  'screening',
  'interview',
  'technical',
  'offer',
  'rejected',
  'accepted'
);

create table public.job_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company text not null,
  role text not null,
  stage application_stage not null default 'saved',
  url text default '',
  notes text default '',
  applied_date date,
  deadline date,
  salary_range text default '',
  location text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.job_applications enable row level security;

create policy "Users can view own applications"
  on public.job_applications for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own applications"
  on public.job_applications for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own applications"
  on public.job_applications for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can delete own applications"
  on public.job_applications for delete
  to authenticated
  using (auth.uid() = user_id);

create trigger update_job_applications_updated_at
  before update on public.job_applications
  for each row execute function public.update_updated_at_column();
