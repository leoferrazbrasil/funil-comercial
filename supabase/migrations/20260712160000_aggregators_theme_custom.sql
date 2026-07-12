-- Tema personalizado do agregador (cores extraídas do site do cliente).
-- Guarda {accent, bg?, text?}; usado quando theme = 'custom'.

alter table public.aggregators
  add column if not exists theme_custom jsonb;
