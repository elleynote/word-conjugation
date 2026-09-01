-- Client revision migration: Russian replaces French and AI candidates are stored
-- separately from verified production verb data.

delete from public.verb_translations where language_code = 'fr';

alter table public.verb_translations
  drop constraint if exists verb_translations_language_code_check;

alter table public.verb_translations
  add constraint verb_translations_language_code_check
  check (language_code in ('en', 'ru'));

create table if not exists public.ai_candidates (
  id bigint generated always as identity primary key,
  query text not null,
  dialect text check (dialect in ('western', 'eastern')),
  payload jsonb not null,
  model text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  review_notes text
);

create index if not exists ai_candidates_status_created_idx
  on public.ai_candidates (status, created_at desc);

alter table public.ai_candidates enable row level security;

-- Intentionally no anon/authenticated policies on ai_candidates.
-- Only the server-side service-role key may insert/read review candidates.
