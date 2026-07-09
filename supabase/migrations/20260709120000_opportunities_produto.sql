-- Adiciona o produto/serviço tratado na oportunidade (Site, Google Meu Negócio,
-- Tráfego Pago, Social Media/Criativos...). Aditiva e nullable — oportunidades
-- existentes ficam com produto NULL (sem impacto).
alter table public.opportunities
  add column if not exists produto text;
