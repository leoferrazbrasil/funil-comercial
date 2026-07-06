# Script para facilitar o deploy dos robôs (Edge Functions) da Meta no Supabase
# Este script requer que você já esteja logado no Supabase CLI (`supabase login`) e com o projeto linkado (`supabase link --project-ref SEU_PROJETO`).

$APP_ID = "1011596071464906"
$APP_SECRET = "262bdf2988c86289b381f87149833ac1"

Write-Host "Injetando Credenciais Oficiais da Meta (Segredos) de Forma Criptografada..." -ForegroundColor Cyan
npx supabase@latest secrets set META_APP_ID=$APP_ID --project-ref dtdtewojmyhiegwmgmte
npx supabase@latest secrets set META_APP_SECRET=$APP_SECRET --project-ref dtdtewojmyhiegwmgmte

Write-Host "Fazendo o Deploy da Função de Autenticação (meta-auth)..." -ForegroundColor Cyan
npx supabase@latest functions deploy meta-auth --no-verify-jwt --project-ref dtdtewojmyhiegwmgmte

Write-Host "Fazendo o Deploy da Função de Publicação (meta-publish)..." -ForegroundColor Cyan
npx supabase@latest functions deploy meta-publish --no-verify-jwt --project-ref dtdtewojmyhiegwmgmte

Write-Host "Feito! Os robôs já estão operando na nuvem do Supabase." -ForegroundColor Green
