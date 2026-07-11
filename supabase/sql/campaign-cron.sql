-- Agendador das Campanhas (Fase 2) — rode UMA vez no SQL Editor do Supabase.
--
-- Pré-requisitos:
--   1) Secret CAMPAIGN_RUNNER_SECRET criado em Edge Functions → Secrets
--      (um valor forte, aleatório). Troque <SECRET> abaixo pelo MESMO valor.
--   2) A Edge Function campaign-runner já deployada.
--
-- O job chama o campaign-runner a cada minuto; a função processa as campanhas
-- vencidas (scheduled_at <= now) enviando os templates server-side.
--
-- SEGURANÇA: o <SECRET> abaixo fica gravado em cron.job.command (texto puro,
-- legível apenas por superusuário/postgres e capturado em backups). É um token
-- de baixo valor (apenas dispara o runner). Para endurecer, guarde-o no Supabase
-- Vault e faça o lookup dentro do comando agendado em vez de inliná-lo.

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- (Re)cria o job idempotentemente.
select cron.unschedule('campaign-runner')
where exists (select 1 from cron.job where jobname = 'campaign-runner');

select cron.schedule(
  'campaign-runner',
  '* * * * *',
  $$
  select net.http_post(
    url := 'https://juvwfxnlusrnvcarkrmc.supabase.co/functions/v1/campaign-runner',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-campaign-secret', '<SECRET>'
    ),
    body := '{}'::jsonb
  );
  $$
);

-- Para conferir: select * from cron.job;
-- Para remover:  select cron.unschedule('campaign-runner');
