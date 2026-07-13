-- Campos sociais opcionais para contatos: site, Instagram e LinkedIn.
-- Nulos por padrão; o app grava/edita via ContactModal (create/updateContact).
alter table contacts
  add column if not exists site text,
  add column if not exists instagram text,
  add column if not exists linkedin text;
