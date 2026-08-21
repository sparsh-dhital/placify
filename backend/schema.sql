create extension if not exists pgcrypto;

create table if not exists students (
  id text primary key,
  name text not null,
  roll_no text default '',
  branch text default '',
  cgpa numeric(3,2) default 0,
  backlogs integer default 0,
  graduation_year integer,
  created_at timestamptz default now()
);
create table if not exists resumes (
  id uuid primary key default gen_random_uuid(), student_id text not null references students(id) on delete cascade,
  file_name text not null, mime_type text, raw_text text not null, created_at timestamptz default now()
);
create table if not exists student_skills (
  student_id text references students(id) on delete cascade, skill_name text not null, proficiency integer, source text default 'resume',
  primary key (student_id, skill_name)
);
create table if not exists jobs (
  id uuid primary key default gen_random_uuid(), company text not null, role text not null, description text not null,
  location text default '', salary text default '', min_cgpa numeric(3,2) default 0, max_backlogs integer default 0,
  eligible_branches text[] default '{}', status text default 'draft', created_at timestamptz default now()
);
create table if not exists job_skills (
  job_id uuid references jobs(id) on delete cascade, skill_name text not null, skill_type text not null check (skill_type in ('mandatory', 'preferred')),
  primary key (job_id, skill_name)
);
create table if not exists eligibility_results (
  job_id uuid references jobs(id) on delete cascade, student_id text references students(id) on delete cascade,
  eligible boolean not null, reasons jsonb default '[]', diagnostics jsonb default '{}', evaluated_at timestamptz default now(),
  primary key (job_id, student_id)
);
create index if not exists eligibility_job_eligible_idx on eligibility_results(job_id, eligible);
create table if not exists shortlist_decisions (
  job_id uuid references jobs(id) on delete cascade, student_id text references students(id) on delete cascade,
  action text not null check (action in ('approve', 'reject')), override_reason text, created_at timestamptz default now(),
  primary key (job_id, student_id)
);
create table if not exists interviews (
  id uuid primary key default gen_random_uuid(), student_id text references students(id), job_id uuid references jobs(id),
  panelist_id text, room text, start_time timestamptz, end_time timestamptz, status text default 'proposed'
);
create table if not exists interview_feedback (
  id uuid primary key default gen_random_uuid(), interview_id uuid references interviews(id) on delete cascade,
  technical_score integer check (technical_score between 0 and 5), communication_score integer check (communication_score between 0 and 5),
  problem_solving_score integer check (problem_solving_score between 0 and 5), overall_result text, comments text default '', created_at timestamptz default now()
);

insert into students (id, name, roll_no, branch, cgpa, backlogs)
values
  ('s1', 'Aarav Mehta', '23CSE001', 'CSE', 8.7, 0),
  ('s2', 'Ananya Sharma', '23CSE002', 'CSE', 9.1, 0)
on conflict (id) do nothing;
insert into student_skills (student_id, skill_name, source)
values
  ('s1', 'Python', 'seed'), ('s1', 'SQL', 'seed'), ('s1', 'Git', 'seed'), ('s1', 'React', 'seed'),
  ('s2', 'Python', 'seed'), ('s2', 'SQL', 'seed'), ('s2', 'Git', 'seed')
on conflict (student_id, skill_name) do nothing;
insert into jobs (id, company, role, description, min_cgpa, max_backlogs, status)
values ('20000000-0000-0000-0000-000000000001', 'TechNova Solutions', 'Software Engineer', 'Python SQL Git mandatory; React preferred.', 7.5, 0, 'approved')
on conflict (id) do nothing;
insert into job_skills (job_id, skill_name, skill_type)
values
  ('20000000-0000-0000-0000-000000000001', 'Python', 'mandatory'),
  ('20000000-0000-0000-0000-000000000001', 'SQL', 'mandatory'),
  ('20000000-0000-0000-0000-000000000001', 'Git', 'mandatory'),
  ('20000000-0000-0000-0000-000000000001', 'React', 'preferred')
on conflict (job_id, skill_name) do nothing;
