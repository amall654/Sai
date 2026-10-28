-- Transactional tests: no provider or storage object remains after rollback.
begin;
do $$
declare owner_id uuid; target uuid; payload jsonb; rejected boolean;
begin
 select user_id into owner_id from sai_private.owner_account;
 if owner_id is null then raise exception 'Owner missing'; end if;
 perform set_config('request.jwt.claim.sub',owner_id::text,true);
 payload:='{"name":"Owner workflow test","description":"Temporary transactional test","official_url":"https://example.com/learning","details":"Test learning areas","language":"Arabic","cost":"Free","content_types":["دورات"],"status":"draft","fields":["software"],"guidance":{"levels":["beginner"],"languages":["ar"],"cost":"free"}}'::jsonb;
 target:=public.sai_owner_save_provider(payload);
 perform set_config('sai.test_provider',target::text,true);
 if not exists(select 1 from public.providers where id=target and reviewed_at is not null and guidance->>'cost'='free') then raise exception 'Provider save failed'; end if;
 if not exists(select 1 from public.provider_fields where provider_id=target and field_id='software') then raise exception 'Field save failed'; end if;
 payload:=payload||jsonb_build_object('id',target,'updated_at','1970-01-01T00:00:00Z');
 rejected:=false;
 begin perform public.sai_owner_save_provider(payload); exception when serialization_failure then rejected:=true; end;
 if not rejected then raise exception 'Stale write accepted'; end if;
 payload:=payload||jsonb_build_object('updated_at',(select updated_at from public.providers where id=target));
 rejected:=false;
 begin perform public.sai_owner_save_provider(payload||'{"guidance":{"levels":["invalid"],"languages":["ar"],"cost":"free"}}'); exception when raise_exception then rejected:=true; end;
 if not rejected then raise exception 'Invalid guidance accepted'; end if;
 rejected:=false;
 begin perform public.sai_owner_save_provider(payload||'{"logo_path":"logos/00000000-0000-4000-8000-000000000099.webp"}'); exception when raise_exception then rejected:=true; end;
 if not rejected then raise exception 'Missing logo accepted'; end if;
 perform set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000099',true);
 rejected:=false;
 begin perform public.sai_owner_save_provider(payload); exception when insufficient_privilege then rejected:=true; end;
 if not rejected then raise exception 'Non-owner write accepted'; end if;
 perform set_config('request.jwt.claim.sub',owner_id::text,true);
 perform set_config('sai.test_payload',payload::text,true);
end;$$;
set local role anon;
do $$ begin
 if exists(select 1 from public.providers where id=current_setting('sai.test_provider')::uuid) then raise exception 'Draft visible to guest'; end if;
end;$$;
reset role;
select public.sai_owner_save_provider(current_setting('sai.test_payload')::jsonb||'{"status":"published"}');
set local role anon;
do $$ begin
 if not exists(select 1 from public.providers where id=current_setting('sai.test_provider')::uuid and guidance->>'cost'='free' and logo_path is null and reviewed_at is not null) then raise exception 'Published provider unavailable'; end if;
end;$$;
reset role;
select public.sai_owner_save_provider(current_setting('sai.test_payload')::jsonb||'{"status":"hidden"}');
set local role anon;
do $$ begin
 if exists(select 1 from public.providers where id=current_setting('sai.test_provider')::uuid) then raise exception 'Hidden provider visible'; end if;
end;$$;
reset role;
set local role authenticated;
insert into storage.objects(bucket_id,name) values('provider-logos','logos/00000000-0000-4000-8000-000000000001.webp');
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000099',true);
do $$ declare rejected boolean:=false; begin
 begin insert into storage.objects(bucket_id,name) values('provider-logos','logos/00000000-0000-4000-8000-000000000002.webp'); exception when insufficient_privilege then rejected:=true; end;
 if not rejected then raise exception 'Non-owner logo upload accepted'; end if;
end;$$;
reset role;
select 'PASS: save, fields, stale writes, invalid guidance, missing logo, non-owner denial, draft privacy and storage owner policy' as result;
rollback;
