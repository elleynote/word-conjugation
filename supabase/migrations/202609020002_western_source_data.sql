alter table public.verb_dialects
  add column if not exists source_name text,
  add column if not exists source_row integer,
  add column if not exists class_number integer,
  add column if not exists subclass text,
  add column if not exists regularity text,
  add column if not exists initial_segment text,
  add column if not exists regular_category text,
  add column if not exists affix text,
  add column if not exists transitivity text,
  add column if not exists verified_forms jsonb not null default '{}'::jsonb,
  add column if not exists source_metadata jsonb not null default '{}'::jsonb;

create index if not exists verb_dialects_source_idx
  on public.verb_dialects (source_name, source_row);

create index if not exists verb_dialects_class_idx
  on public.verb_dialects (dialect, class_number, subclass, initial_segment, affix);

create table if not exists public.data_sources (
  id text primary key,
  name text not null,
  source_url text not null,
  revision text,
  license text,
  citation text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.transliteration_overrides (
  id bigint generated always as identity primary key,
  verb_id text not null references public.verbs(id) on delete cascade,
  dialect text not null check (dialect in ('western', 'eastern')),
  armenian text not null,
  transliteration text not null,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (verb_id, dialect, armenian)
);

alter table public.data_sources enable row level security;
alter table public.transliteration_overrides enable row level security;

create policy "Public can read data sources"
  on public.data_sources for select to anon, authenticated using (true);

create policy "Public can read transliteration overrides"
  on public.transliteration_overrides for select to anon, authenticated using (true);

insert into public.data_sources (id, name, source_url, revision, license, citation, metadata)
values (
  'armenian-verbs-2020',
  'Armenian Verbs: Paradigms and verb lists of Western Armenian conjugation classes',
  'https://github.com/jhdeov/ArmenianVerbs',
  'd6aefd5dabbb6d0ca1c147182bbdf62aa5921153',
  'BSD-3-Clause',
  'Nisan Boyacioglu & Hossep Dolatian (2020), Armenian Verbs, Version v1.0.0, Zenodo DOI 10.5281/zenodo.4397423',
  jsonb_build_object('dialect', 'western', 'expected_lexicon_rows', 3257)
)
on conflict (id) do update set
  name = excluded.name,
  source_url = excluded.source_url,
  revision = excluded.revision,
  license = excluded.license,
  citation = excluded.citation,
  metadata = excluded.metadata,
  updated_at = now();