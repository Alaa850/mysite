$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$dataDir = Join-Path $env:LOCALAPPDATA 'TecPro99'
$logDir = Join-Path $dataDir 'logs'
$tokenPath = Join-Path $dataDir 'cloudflared.token'
$cloudflaredPath = Join-Path $env:LOCALAPPDATA 'Programs\cloudflared\cloudflared.exe'
$nodePath = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
$connectorScript = Join-Path $PSScriptRoot 'crm-connector.mjs'
$envFile = Join-Path $root '.env.local'

New-Item -ItemType Directory -Force -Path $logDir | Out-Null

function Test-CommandLineProcess {
  param(
    [Parameter(Mandatory)] [string] $ProcessName,
    [Parameter(Mandatory)] [string] $CommandFragment
  )

  return $null -ne (Get-CimInstance Win32_Process -Filter "Name = '$ProcessName'" |
    Where-Object { $_.CommandLine -like "*$CommandFragment*" } |
    Select-Object -First 1)
}

if (-not (Test-Path -LiteralPath $nodePath)) {
  throw "Node.js runtime was not found at $nodePath"
}
if (-not (Test-Path -LiteralPath $cloudflaredPath)) {
  throw "cloudflared was not found at $cloudflaredPath"
}
if (-not (Test-Path -LiteralPath $tokenPath)) {
  throw "Cloudflare tunnel token was not found at $tokenPath"
}
if (-not (Test-Path -LiteralPath $envFile)) {
  throw "Connector environment file was not found at $envFile"
}

if (-not (Test-CommandLineProcess -ProcessName 'node.exe' -CommandFragment 'crm-connector.mjs')) {
  Start-Process -FilePath $nodePath `
    -ArgumentList @("--env-file=$envFile", $connectorScript) `
    -WorkingDirectory $root `
    -WindowStyle Hidden `
    -RedirectStandardOutput (Join-Path $logDir 'crm-connector.out.log') `
    -RedirectStandardError (Join-Path $logDir 'crm-connector.error.log')
}

if (-not (Test-CommandLineProcess -ProcessName 'cloudflared.exe' -CommandFragment 'tunnel run')) {
  $token = [IO.File]::ReadAllText($tokenPath).Trim()
  if (-not $token) {
    throw 'Cloudflare tunnel token is empty.'
  }

  Start-Process -FilePath $cloudflaredPath `
    -ArgumentList @('tunnel', 'run', '--token', $token) `
    -WorkingDirectory $root `
    -WindowStyle Hidden `
    -RedirectStandardOutput (Join-Path $logDir 'cloudflared.out.log') `
    -RedirectStandardError (Join-Path $logDir 'cloudflared.error.log')
}
