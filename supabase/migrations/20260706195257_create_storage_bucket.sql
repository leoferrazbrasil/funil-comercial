-- Create the storage bucket for temporary social media images
insert into storage.buckets (id, name, public)
values ('social_media_temp', 'social_media_temp', true)
on conflict (id) do nothing;

-- Create policies to allow public read and authenticated write
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'social_media_temp' );

create policy "Authenticated Users can upload media"
  on storage.objects for insert
  with check ( bucket_id = 'social_media_temp' );

create policy "Authenticated Users can delete media"
  on storage.objects for delete
  using ( bucket_id = 'social_media_temp' );
