$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$dataDir = Join-Path $env:LOCALAPPDATA 'TecPro99'
$logDir = Join-Path $dataDir 'logs'
$tokenPath = Join-Path $dataDir 'cloudflared.token'
$cloudflaredPath = Join-Path $env:LOCALAPPDATA 'Programs\cloudflared\cloudflared.exe'
$nodePath = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
$configPath = Join-Path $root '.crm-connector.local.json'
$envFile = Join-Path $root '.env.local'
$supervisorLog = Join-Path $logDir 'stack-supervisor.log'

New-Item -ItemType Directory -Force -Path $logDir | Out-Null

function Write-StackLog {
  param([Parameter(Mandatory)] [string] $Message)

  Add-Content -LiteralPath $supervisorLog -Value "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') $Message"
}

function Test-CommandLineProcess {
  param(
    [Parameter(Mandatory)] [string] $ProcessName,
    [Parameter(Mandatory)] [string] $CommandFragment
  )

  return $null -ne (Get-CimInstance Win32_Process -Filter "Name = '$ProcessName'" |
    Where-Object { $_.CommandLine -like "*$CommandFragment*" } |
    Select-Object -First 1)
}

function Test-HttpEndpoint {
  param([Parameter(Mandatory)] [string] $Url)

  try {
    $response = Invoke-WebRequest -UseBasicParsing -Uri $Url -TimeoutSec 3
    return $response.StatusCode -eq 200
  }
  catch {
    return $false
  }
}

if (-not (Test-Path -LiteralPath $configPath)) {
  throw "CRM connector config was not found at $configPath"
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

$config = Get-Content -LiteralPath $configPath -Raw -Encoding UTF8 | ConvertFrom-Json
$crmRoot = [Environment]::ExpandEnvironmentVariables([string]$config.crmAppRoot)
$crmPort = [int]$config.crmPort
$crmHealthPath = [string]$config.crmHealthPath
if ([string]::IsNullOrWhiteSpace($crmRoot) -or -not (Test-Path -LiteralPath $crmRoot)) {
  throw "CRM application directory was not found. Set crmAppRoot in $configPath"
}
if ($crmPort -lt 1 -or $crmPort -gt 65535) {
  throw "CRM port is invalid in $configPath"
}
if ([string]::IsNullOrWhiteSpace($crmHealthPath) -or -not $crmHealthPath.StartsWith('/')) {
  throw "CRM health path is invalid in $configPath"
}

$crmExecutable = Join-Path $crmRoot 'bin\Debug\net8.0\TechRepairShopManagementSystem.exe'
$crmHealthUrl = "http://127.0.0.1:$crmPort$crmHealthPath"
$mutex = New-Object System.Threading.Mutex($false, 'Local\TecPro99ProductionStackSupervisor')
if (-not $mutex.WaitOne(0, $false)) {
  exit 0
}

$lastCrmReady = $null
Write-StackLog 'TecPro99 stack supervisor started.'

try {
  while ($true) {
    try {
      if (-not (Test-CommandLineProcess -ProcessName 'TechRepairShopManagementSystem.exe' -CommandFragment $crmExecutable)) {
        if (-not (Test-Path -LiteralPath $crmExecutable)) {
          throw "CRM executable was not found at $crmExecutable. Build the CRM before starting it."
        }

        $previousEnvironment = $env:ASPNETCORE_ENVIRONMENT
        try {
          $env:ASPNETCORE_ENVIRONMENT = 'Development'
          Start-Process -FilePath $crmExecutable `
            -ArgumentList @('--urls', "http://0.0.0.0:$crmPort") `
            -WorkingDirectory $crmRoot `
            -WindowStyle Hidden `
            -RedirectStandardOutput (Join-Path $logDir 'crm.out.log') `
            -RedirectStandardError (Join-Path $logDir 'crm.error.log')
        }
        finally {
          $env:ASPNETCORE_ENVIRONMENT = $previousEnvironment
        }
        Write-StackLog "CRM started on port $crmPort."
      }

      if (-not (Test-CommandLineProcess -ProcessName 'node.exe' -CommandFragment 'crm-connector.mjs')) {
        Start-Process -FilePath $nodePath `
          -ArgumentList @('--env-file=.env.local', 'scripts\crm-connector.mjs') `
          -WorkingDirectory $root `
          -WindowStyle Hidden `
          -RedirectStandardOutput (Join-Path $logDir 'crm-connector.out.log') `
          -RedirectStandardError (Join-Path $logDir 'crm-connector.error.log')
        Write-StackLog 'Website connector started.'
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
        Write-StackLog 'Cloudflare tunnel started.'
      }

      $crmReady = Test-HttpEndpoint -Url $crmHealthUrl
      if ($null -eq $lastCrmReady -or $crmReady -ne $lastCrmReady) {
        Write-StackLog $(if ($crmReady) { 'CRM readiness check is healthy.' } else { 'CRM readiness check is unavailable.' })
        $lastCrmReady = $crmReady
      }
    }
    catch {
      Write-StackLog "Supervisor check failed: $($_.Exception.Message)"
    }

    Start-Sleep -Seconds 15
  }
}
finally {
  $mutex.ReleaseMutex()
  $mutex.Dispose()
}
