-- Reestrutura de papéis: separa ÁREA COMERCIAL (time de vendas) de MARKETING
-- (operador técnico). 'diretor' deixa de existir e vira 'admin' — o admin é o
-- operador que vê comercial + marketing (campanhas/criativos/roteiro/agregadores).
-- gestor/vendedor passam a ver apenas a área comercial.

-- 1) Remove o CHECK antigo ANTES dos updates (senão gravar 'admin' viola a constraint).
alter table public.profiles drop constraint if exists profiles_role_check;

-- 2) 'diretor' vira 'admin'.
update public.profiles set role = 'admin' where role = 'diretor';

-- 3) Admin da plataforma = o primeiro usuário (operador técnico), definido por
--    e-mail (fonte da verdade: auth.users). Os demais mantêm gestor/vendedor.
--    Obs.: roda como postgres no SQL Editor (auth.uid() nulo), então o trigger
--    profiles_protect_role NÃO bloqueia este update.
update public.profiles p
  set role = 'admin'
  from auth.users u
  where u.id = p.id
    and lower(u.email) = 'leonardoferrazbrasil@gmail.com';

-- 4) Novo CHECK do role.
alter table public.profiles
  add constraint profiles_role_check check (role in ('admin', 'gestor', 'vendedor'));

-- 5) social_integrations (conectar/publicar Instagram) = marketing → só admin.
--    Sem isto, após o rename o admin ficaria SEM acesso (as policies citavam 'diretor').
drop policy if exists "Apenas admins podem ler integrations" on public.social_integrations;
drop policy if exists "Apenas admins podem gerenciar integrations" on public.social_integrations;

create policy "Apenas admins podem ler integrations"
  on public.social_integrations for select
  using (auth.uid() in (select id from public.profiles where role = 'admin'));

create policy "Apenas admins podem gerenciar integrations"
  on public.social_integrations for all
  using (auth.uid() in (select id from public.profiles where role = 'admin'));
