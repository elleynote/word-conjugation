insert into public.verbs (id, aliases) values
  ('write', array['writing','grel']),
  ('read', array['reading','kartal','gardal']),
  ('be', array['linel','ellal','to be'])
on conflict (id) do update set aliases = excluded.aliases, updated_at = now();

insert into public.verb_translations (verb_id, language_code, value, is_primary) values
  ('write','en','write',true), ('write','ru','писать',true),
  ('read','en','read',true), ('read','ru','читать',true),
  ('be','en','be',true), ('be','ru','быть',true)
on conflict (verb_id, language_code, value) do update set is_primary = excluded.is_primary;

-- Starter rows are Eastern-only. Western Armenian is sourced from the pinned
-- ArmenianVerbs corpus imported by scripts/import-western-source.mjs.
insert into public.verb_dialects (
  verb_id, dialect, lemma, transliteration, conjugation_group, root, conjugation_class, is_irregular,
  base, particule, present_participle, perfect_participle, past_participle, mediative_participle,
  future_participle, negative_participle, imperfect_non_personal, subject_participle,
  imperative_singular, imperative_plural, probable_future, continuous_forms, mediative_forms
) values
  ('write','eastern','գրել','grel','-ել','գր','el',false,
   'գրել','գրում','գրում','գրել','գրել','գրելով','գրելու','գրի','գրում','գրող','գրի՛ր','գրե՛ք',
   '{"firstSingular":"գրելու եմ","secondSingular":"գրելու ես","thirdSingular":"գրելու է","firstPlural":"գրելու ենք","secondPlural":"գրելու եք","thirdPlural":"գրելու են"}'::jsonb,
   '{"firstSingular":"գրում եմ","secondSingular":"գրում ես","thirdSingular":"գրում է","firstPlural":"գրում ենք","secondPlural":"գրում եք","thirdPlural":"գրում են"}'::jsonb,
   '{"firstSingular":"գրելով եմ","secondSingular":"գրելով ես","thirdSingular":"գրելով է","firstPlural":"գրելով ենք","secondPlural":"գրելով եք","thirdPlural":"գրելով են"}'::jsonb),
  ('read','eastern','կարդալ','kardal','-ալ','կարդ','al',false,
   'կարդալ','կարդում','կարդում','կարդացել','կարդացել',null,'կարդալու','կարդա','կարդում',null,'կարդա՛','կարդացե՛ք','{}'::jsonb,'{}'::jsonb,'{}'::jsonb),
  ('be','eastern','լինել','linel','irregular','լին','irregular',true,
   'լինել','լինում','լինում','եղել','եղել',null,'լինելու','լինի','լինում',null,'եղի՛ր','եղե՛ք','{}'::jsonb,'{}'::jsonb,'{}'::jsonb)
on conflict (verb_id, dialect) do update set
  lemma = excluded.lemma,
  transliteration = excluded.transliteration,
  conjugation_group = excluded.conjugation_group,
  root = excluded.root,
  conjugation_class = excluded.conjugation_class,
  is_irregular = excluded.is_irregular,
  base = excluded.base,
  particule = excluded.particule,
  present_participle = excluded.present_participle,
  perfect_participle = excluded.perfect_participle,
  past_participle = excluded.past_participle,
  mediative_participle = excluded.mediative_participle,
  future_participle = excluded.future_participle,
  negative_participle = excluded.negative_participle,
  imperfect_non_personal = excluded.imperfect_non_personal,
  subject_participle = excluded.subject_participle,
  imperative_singular = excluded.imperative_singular,
  imperative_plural = excluded.imperative_plural,
  probable_future = excluded.probable_future,
  continuous_forms = excluded.continuous_forms,
  mediative_forms = excluded.mediative_forms;

insert into public.irregular_overrides (verb_id, dialect, polarity, tense, person, value) values
  ('be','eastern','affirmative','present','firstSingular','եմ'),
  ('be','eastern','affirmative','present','secondSingular','ես'),
  ('be','eastern','affirmative','present','thirdSingular','է'),
  ('be','eastern','affirmative','present','firstPlural','ենք'),
  ('be','eastern','affirmative','present','secondPlural','եք'),
  ('be','eastern','affirmative','present','thirdPlural','են')
on conflict (verb_id, dialect, polarity, tense, person) do update set value = excluded.value;
