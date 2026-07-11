-- Foto de perfil: a tabela profiles não tinha a coluna avatar_url, então
-- updateProfile({ avatar_url }) falhava (PGRST204) e a foto (que subia para o
-- Storage) nunca era persistida no banco — revertia ao recarregar a página.

alter table public.profiles
  add column if not exists avatar_url text;
