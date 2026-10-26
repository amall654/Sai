-- Private account pictures. Each student can read/write only their own object.
begin;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('account-avatars','account-avatars',false,262144,array['image/webp']);
create policy account_avatar_read on storage.objects for select to authenticated
using(bucket_id='account-avatars' and name=(select auth.uid())::text||'/avatar.webp');
create policy account_avatar_insert on storage.objects for insert to authenticated
with check(bucket_id='account-avatars' and name=(select auth.uid())::text||'/avatar.webp');
create policy account_avatar_update on storage.objects for update to authenticated
using(bucket_id='account-avatars' and name=(select auth.uid())::text||'/avatar.webp')
with check(bucket_id='account-avatars' and name=(select auth.uid())::text||'/avatar.webp');
commit;
