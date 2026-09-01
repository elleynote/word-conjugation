-- Remove only the legacy Western starter dialect rows. Keep the shared lexical
-- records/translations and Eastern starter rows intact.
delete from public.irregular_overrides
where dialect = 'western'
  and verb_id in ('write', 'read', 'be');

delete from public.verb_dialects
where dialect = 'western'
  and verb_id in ('write', 'read', 'be');
