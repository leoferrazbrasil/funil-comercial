param(
  [string]$ProjectRef = "dtdtewojmyhiegwmgmte",
  [switch]$UseApi,
  [switch]$SkipDenoCheck
)

$ErrorActionPreference = "Stop"

$ExpectedProjectRef = "dtdtewojmyhiegwmgmte"
if ($ProjectRef -ne $ExpectedProjectRef) {
  throw "ProjectRef recusado. Esperado: $ExpectedProjectRef"
}

function Invoke-Checked {
  param([string[]]$CommandParts)

  $command = $CommandParts[0]
  $arguments = @()
  if ($CommandParts.Length -gt 1) {
    $arguments = $CommandParts[1..($CommandParts.Length - 1)]
  }

  & $command @arguments
  if ($LASTEXITCODE -ne 0) {
    throw "Comando falhou: $($CommandParts -join ' ')"
  }
}

$accessToken =
  [Environment]::GetEnvironmentVariable("SUPABASE_ACCESS_TOKEN", "Process")
if ([string]::IsNullOrWhiteSpace($accessToken)) {
  $accessToken =
    [Environment]::GetEnvironmentVariable("SUPABASE_ACCESS_TOKEN", "User")
}
if ([string]::IsNullOrWhiteSpace($accessToken)) {
  throw "SUPABASE_ACCESS_TOKEN=missing"
}

Invoke-Checked @("npx", "--yes", "supabase", "--version")

$projectsJson = & npx --yes supabase projects list --output json
if ($LASTEXITCODE -ne 0) {
  throw "Nao foi possivel listar projetos Supabase com o token atual."
}

$projects = $projectsJson | ConvertFrom-Json
$project = $projects | Where-Object { $_.ref -eq $ProjectRef } | Select-Object -First 1
if (-not $project) {
  throw "Token Supabase atual nao tem acesso ao projeto $ProjectRef."
}
if ($LASTEXITCODE -ne 0) {
  throw "Nao foi possivel listar projetos Supabase com o token atual."
}

$projects = $projectsJson | ConvertFrom-Json
$project = $projects | Where-Object { $_.ref -eq $ProjectRef } | Select-Object -First 1
if (-not $project) {
  throw "Token Supabase atual nao tem acesso ao projeto $ProjectRef."
}

if (-not $SkipDenoCheck) {
  Invoke-Checked @(
    "deno",
    "check",
    "--no-lock",
    "supabase/functions/whatsapp-inbound/index.ts",
    "supabase/functions/whatsapp-qr-inbound/index.ts",
    "supabase/functions/whatsapp-send/index.ts"
  )
}

$deploySharedFlags = @("--project-ref", $ProjectRef)
if ($UseApi) {
  $deploySharedFlags += "--use-api"
}

$deployInbound = @(
  "npx",
  "--yes",
  "supabase",
  "functions",
  "deploy",
  "whatsapp-inbound",
  "--no-verify-jwt"
) + $deploySharedFlags
Invoke-Checked $deployInbound

$deploySend = @(
  "npx",
  "--yes",
  "supabase",
  "functions",
  "deploy",
  "whatsapp-send"
) + $deploySharedFlags
Invoke-Checked $deploySend

$deployQrInbound = @(
  "npx",
  "--yes",
  "supabase",
  "functions",
  "deploy",
  "whatsapp-qr-inbound",
  "--no-verify-jwt"
) + $deploySharedFlags
Invoke-Checked $deployQrInbound

Write-Host "Edge Functions publicadas no projeto $ProjectRef."
