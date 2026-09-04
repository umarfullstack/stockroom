create table if not exists companies (
  id text primary key,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists stockroom_state (
  company_id text primary key references companies(id),
  data jsonb not null,
  updated_at timestamptz not null default now()
);
