-- Bucket de avatares (foto de perfil). O front (uploadAvatar) faz upload em um
-- bucket PÚBLICO chamado 'avatars' e usa getPublicUrl; o nome do arquivo é
-- prefixado pelo id do usuário: '{uid}-{random}.ext'. Sem o bucket/policies, o
-- upload falha com "Bucket not found".

-- 1) Bucket público 'avatars'
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

-- 2) Leitura pública (o bucket é público; libera SELECT dos objetos)
drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- 3) Escrita apenas pelo dono — arquivos nomeados '{uid}-...'
drop policy if exists "avatars_owner_insert" on storage.objects;
create policy "avatars_owner_insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and name like auth.uid()::text || '-%');

drop policy if exists "avatars_owner_update" on storage.objects;
create policy "avatars_owner_update"
  on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and name like auth.uid()::text || '-%')
  with check (bucket_id = 'avatars' and name like auth.uid()::text || '-%');

drop policy if exists "avatars_owner_delete" on storage.objects;
create policy "avatars_owner_delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and name like auth.uid()::text || '-%');
