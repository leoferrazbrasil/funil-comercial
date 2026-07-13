-- Motivo da perda: registrado quando a oportunidade é marcada como 'Perdido'
-- (pelo botão do painel ou ao arrastar o card para a coluna Perdido). Nulo por padrão.
alter table public.opportunities
  add column if not exists motivo_perda text;
