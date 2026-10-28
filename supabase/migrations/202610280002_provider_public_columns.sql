-- Extend the existing explicit public column list; creator account identifiers remain private.
begin;
grant select (guidance,logo_path,reviewed_at) on public.providers to anon,authenticated;
notify pgrst,'reload schema';
commit;
