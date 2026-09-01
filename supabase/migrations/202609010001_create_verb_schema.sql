create table if not exists public.verbs (
  id text primary key,
  aliases text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.verb_translations (
  id bigint generated always as identity primary key,
  verb_id text not null references public.verbs(id) on delete cascade,
  language_code text not null check (language_code in ('en', 'ru')),
  value text not null,
  is_primary boolean not null default false,
  unique (verb_id, language_code, value)
);

create table if not exists public.verb_dialects (
  id bigint generated always as identity primary key,
  verb_id text not null references public.verbs(id) on delete cascade,
  dialect text not null check (dialect in ('western', 'eastern')),
  lemma text not null,
  transliteration text not null,
  conjugation_group text not null,
  root text not null,
  conjugation_class text not null check (conjugation_class in ('el', 'al', 'irregular')),
  is_irregular boolean not null default false,
  base text,
  particule text,
  present_participle text,
  perfect_participle text,
  past_participle text,
  mediative_participle text,
  future_participle text,
  negative_participle text,
  imperfect_non_personal text,
  subject_participle text,
  imperative_singular text,
  imperative_plural text,
  probable_future jsonb not null default '{}'::jsonb,
  continuous_forms jsonb not null default '{}'::jsonb,
  mediative_forms jsonb not null default '{}'::jsonb,
  unique (verb_id, dialect)
);

create table if not exists public.irregular_overrides (
  id bigint generated always as identity primary key,
  verb_id text not null references public.verbs(id) on delete cascade,
  dialect text not null check (dialect in ('western', 'eastern')),
  polarity text not null check (polarity in ('affirmative', 'negative')),
  tense text not null check (tense in ('present', 'imperfect', 'preterite', 'presentPerfect', 'pluperfect', 'future', 'conditional', 'imperative')),
  person text not null check (person in ('firstSingular', 'secondSingular', 'thirdSingular', 'firstPlural', 'secondPlural', 'thirdPlural')),
  value text not null,
  unique (verb_id, dialect, polarity, tense, person)
);

create index if not exists verb_translations_lookup_idx on public.verb_translations (language_code, lower(value));
create index if not exists verb_dialects_lemma_idx on public.verb_dialects (dialect, lemma);

alter table public.verbs enable row level security;
alter table public.verb_translations enable row level security;
alter table public.verb_dialects enable row level security;
alter table public.irregular_overrides enable row level security;

create policy "Public can read verbs" on public.verbs for select to anon, authenticated using (true);
create policy "Public can read translations" on public.verb_translations for select to anon, authenticated using (true);
create policy "Public can read dialect records" on public.verb_dialects for select to anon, authenticated using (true);
create policy "Public can read overrides" on public.irregular_overrides for select to anon, authenticated using (true);
