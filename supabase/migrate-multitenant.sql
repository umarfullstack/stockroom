create table if not exists companies (
  id text primary key,
  name text not null,
  created_at timestamptz not null default now()
);

alter table stockroom_state rename column id to company_id;
