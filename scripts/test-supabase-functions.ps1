$ErrorActionPreference = "Stop"

$FunctionPort = 8000
$FunctionBaseUrl = "http://127.0.0.1:$FunctionPort"

function Assert-Equal {
  param(
    [string]$Label,
    [object]$Actual,
    [object]$Expected
  )

  if ($Actual -ne $Expected) {
    throw "$Label falhou. Esperado: $Expected. Recebido: $Actual."
  }

  Write-Host "ok - $Label"
}

function Wait-FunctionPort {
  param([int]$ProcessId)

  for ($attempt = 1; $attempt -le 30; $attempt += 1) {
    $process = Get-Process -Id $ProcessId -ErrorAction SilentlyContinue
    if (-not $process) {
      throw "Processo da Edge Function encerrou antes de abrir a porta $FunctionPort."
    }

    $listener = Get-NetTCPConnection -LocalPort $FunctionPort -State Listen -ErrorAction SilentlyContinue
    if ($listener) {
      return
    }

    Start-Sleep -Milliseconds 250
  }

  throw "Timeout aguardando Edge Function na porta $FunctionPort."
}

function Wait-FunctionPortFree {
  for ($attempt = 1; $attempt -le 40; $attempt += 1) {
    $listener = Get-NetTCPConnection -LocalPort $FunctionPort -State Listen -ErrorAction SilentlyContinue
    if (-not $listener) {
      return
    }

    Start-Sleep -Milliseconds 250
  }

  throw "Porta $FunctionPort permaneceu em uso apos encerrar a Edge Function."
}

function Start-EdgeFunction {
  param([string]$Path)

  $busy = Get-NetTCPConnection -LocalPort $FunctionPort -State Listen -ErrorAction SilentlyContinue
  if ($busy) {
    throw "Porta $FunctionPort ja esta em uso."
  }

  $process = Start-Process `
    -FilePath deno `
    -ArgumentList @("run", "--no-lock", "--allow-net", "--allow-env", $Path) `
    -PassThru `
    -WindowStyle Hidden

  Wait-FunctionPort -ProcessId $process.Id
  return $process
}

function Stop-EdgeFunction {
  param([System.Diagnostics.Process]$Process)

  if ($Process -and -not $Process.HasExited) {
    Stop-Process -Id $Process.Id -Force
    Wait-Process -Id $Process.Id -Timeout 5 -ErrorAction SilentlyContinue
  }

  Wait-FunctionPortFree
}

function Invoke-JsonRequest {
  param(
    [string]$Uri,
    [string]$Body
  )

  try {
    $response = Invoke-WebRequest `
      -UseBasicParsing `
      -Method Post `
      -Uri $Uri `
      -ContentType "application/json" `
      -Body $Body

    return [pscustomobject]@{
      Status = [int]$response.StatusCode
      Body = $response.Content
    }
  } catch {
    $response = $_.Exception.Response
    if (-not $response) {
      throw
    }

    $reader = [System.IO.StreamReader]::new($response.GetResponseStream())
    try {
      return [pscustomobject]@{
        Status = [int]$response.StatusCode
        Body = $reader.ReadToEnd()
      }
    } finally {
      $reader.Dispose()
    }
  }
}

$env:SUPABASE_URL = "http://127.0.0.1:54321"
$env:SUPABASE_SERVICE_ROLE_KEY = "local-test-service-role"
$env:META_WEBHOOK_VERIFY_TOKEN = "verify-test"
$env:FUNIL_WEBHOOK_SECRET = "funil-test"

$inboundProcess = $null
try {
  $inboundProcess = Start-EdgeFunction -Path "supabase/functions/whatsapp-inbound/index.ts"

  $challenge = Invoke-WebRequest `
    -UseBasicParsing `
    -Uri "$FunctionBaseUrl/?hub.mode=subscribe&hub.verify_token=verify-test&hub.challenge=ok-123"
  Assert-Equal "whatsapp-inbound challenge status" ([int]$challenge.StatusCode) 200
  Assert-Equal "whatsapp-inbound challenge body" $challenge.Content "ok-123"

  $ignoredPayload = '{"object":"whatsapp_business_account","entry":[{"changes":[{"value":{"statuses":[{"id":"wamid.status"}]}}]}]}'
  $ignored = Invoke-JsonRequest -Uri "$FunctionBaseUrl/?token=funil-test" -Body $ignoredPayload
  Assert-Equal "whatsapp-inbound ignora status-only" $ignored.Status 200
  if ($ignored.Body -notmatch '"ignored":true') {
    throw "whatsapp-inbound status-only nao retornou ignored=true."
  }
  Write-Host "ok - whatsapp-inbound status-only body"

  $unauthorized = Invoke-JsonRequest -Uri "$FunctionBaseUrl/?token=wrong-token" -Body '{"from":"5511999999999","message":"teste"}'
  Assert-Equal "whatsapp-inbound bloqueia token invalido" $unauthorized.Status 401
} finally {
  Stop-EdgeFunction -Process $inboundProcess
}

$sendProcess = $null
try {
  $sendProcess = Start-EdgeFunction -Path "supabase/functions/whatsapp-send/index.ts"

  $sendUnauthorized = Invoke-JsonRequest -Uri "$FunctionBaseUrl/" -Body '{"phone":"5511999999999","message":"Teste"}'
  Assert-Equal "whatsapp-send exige usuario autenticado" $sendUnauthorized.Status 401
} finally {
  Stop-EdgeFunction -Process $sendProcess
}

Write-Host "Smoke tests das Edge Functions concluidos."
