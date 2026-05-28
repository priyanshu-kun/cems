# =============================================================================
#  CEMS - setup & run engine (Windows)
#
#  Run by START.bat. For a machine with NOTHING installed:
#    1. Installs a private, portable copy of Node.js (no admin needed)
#    2. Creates the server/.env and client/.env config files if missing
#    3. Installs dependencies for the backend and the frontend
#    4. Opens two windows running the backend and frontend
#    5. Opens the app in the default browser
#
#  Re-running is safe: it reuses the portable Node and existing config.
# =============================================================================

$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

# ---- Tunables ---------------------------------------------------------------
$NodeVersion = 'v20.18.0'           # Node.js LTS bundled if the PC has no Node
$BackendPort = 4000
$FrontendPort = 5173

# Default MongoDB Atlas connection (the project's shared demo cluster).
# Edit server\.env later if you want to point at a different database.
$DefaultMongoUri = 'mongodb+srv://kasso:kasso_major_project@cluster0.cbegbyp.mongodb.net/cems_dev?appName=Cluster0&retryWrites=true&w=majority'

# ---- Paths ------------------------------------------------------------------
$Root      = $PSScriptRoot
$ServerDir = Join-Path $Root 'server'
$ClientDir = Join-Path $Root 'client'
$NodeHome  = Join-Path $Root '.node'      # portable Node lives here
$RunDir    = Join-Path $Root '.run'       # generated launcher scripts live here

function Write-Step($msg)  { Write-Host "`n==> $msg" -ForegroundColor Cyan }
function Write-Ok($msg)    { Write-Host "    OK  $msg" -ForegroundColor Green }
function Write-Warn2($msg) { Write-Host "    !   $msg" -ForegroundColor Yellow }
function Fail($msg) {
  Write-Host "`nERROR: $msg" -ForegroundColor Red
  Write-Host "Setup stopped. Please share this message if you need help." -ForegroundColor Red
  exit 1
}

Write-Host "===========================================================" -ForegroundColor White
Write-Host "  CEMS - College Event Management System" -ForegroundColor White
Write-Host "  Automatic setup for Windows" -ForegroundColor White
Write-Host "===========================================================" -ForegroundColor White

# ---- Sanity: are we in the right folder? -----------------------------------
if (-not (Test-Path $ServerDir) -or -not (Test-Path $ClientDir)) {
  Fail "Could not find the 'server' and 'client' folders next to this script. Make sure START.bat is in the project's main folder."
}

# ---- 1. Ensure Node.js is available ----------------------------------------
Write-Step "Checking for Node.js"

function Get-NodeBinDir {
  # Returns the folder containing node.exe, or $null if not usable.
  $cmd = Get-Command node -ErrorAction SilentlyContinue
  if ($cmd) {
    try {
      $ver = (& $cmd.Source -v) -replace 'v',''
      $major = [int]($ver.Split('.')[0])
      if ($major -ge 18) { return (Split-Path $cmd.Source) }
      Write-Warn2 "Found Node v$ver but it is too old (need 18+). Installing a private copy."
    } catch { }
  }
  return $null
}

$NodeBin = Get-NodeBinDir

if (-not $NodeBin) {
  # Detect CPU architecture for the right download.
  $arch = $env:PROCESSOR_ARCHITECTURE
  switch ($arch) {
    'AMD64' { $nodeArch = 'win-x64' }
    'ARM64' { $nodeArch = 'win-arm64' }
    'x86'   { $nodeArch = 'win-x86' }
    default { $nodeArch = 'win-x64' }
  }

  $folderName = "node-$NodeVersion-$nodeArch"
  $extracted  = Join-Path $NodeHome $folderName

  if (Test-Path (Join-Path $extracted 'node.exe')) {
    Write-Ok "Using portable Node.js already downloaded earlier."
    $NodeBin = $extracted
  } else {
    $zipUrl  = "https://nodejs.org/dist/$NodeVersion/$folderName.zip"
    $zipPath = Join-Path $NodeHome "$folderName.zip"

    Write-Warn2 "Node.js is not installed. Downloading a private copy (~30 MB)."
    Write-Host  "    Source: $zipUrl" -ForegroundColor DarkGray
    New-Item -ItemType Directory -Force -Path $NodeHome | Out-Null

    try {
      $ProgressPreference = 'SilentlyContinue'
      Invoke-WebRequest -Uri $zipUrl -OutFile $zipPath
    } catch {
      Fail "Could not download Node.js. Check your internet connection and try again. ($($_.Exception.Message))"
    }

    Write-Host "    Unpacking..." -ForegroundColor DarkGray
    try {
      Expand-Archive -Path $zipPath -DestinationPath $NodeHome -Force
      Remove-Item $zipPath -Force
    } catch {
      Fail "Could not unpack Node.js. ($($_.Exception.Message))"
    }

    if (-not (Test-Path (Join-Path $extracted 'node.exe'))) {
      Fail "Node.js download looked wrong - node.exe not found after unpacking."
    }
    $NodeBin = $extracted
    Write-Ok "Portable Node.js installed."
  }
} else {
  Write-Ok "Node.js is already installed on this PC."
}

# Make this Node the one used for the rest of THIS script.
$env:Path = "$NodeBin;$env:Path"
$Npm = Join-Path $NodeBin 'npm.cmd'

$nodeVerString = (& (Join-Path $NodeBin 'node.exe') -v)
Write-Ok "Node $nodeVerString ready."

# ---- 2. Create config (.env) files if missing ------------------------------
Write-Step "Checking configuration files"

$ServerEnv = Join-Path $ServerDir '.env'
if (-not (Test-Path $ServerEnv)) {
  @"
NODE_ENV=development
PORT=$BackendPort
API_PREFIX=/api/v1
BODY_LIMIT=1mb
CORS_ORIGIN=*

MONGO_URI=$DefaultMongoUri

BCRYPT_COST=12
JWT_ACCESS_SECRET=dev-access-secret-change-me-please-32chars
JWT_REFRESH_SECRET=dev-refresh-secret-change-me-please-32chars
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=7d
JWT_ISSUER=cems-backend
JWT_AUDIENCE=cems-clients

GATE_PASS_HMAC_SECRET=dev-gatepass-secret-change-me-32chars
GATE_PASS_TTL_HOURS=12
"@ | Set-Content -Path $ServerEnv -Encoding ASCII
  Write-Ok "Created server\.env (backend settings)."
} else {
  Write-Ok "server\.env already exists - leaving it untouched."
}

$ClientEnv = Join-Path $ClientDir '.env'
if (-not (Test-Path $ClientEnv)) {
  @"
VITE_API_BASE_URL=http://localhost:$BackendPort/api/v1
VITE_APP_NAME=CEMS
VITE_APP_TAGLINE=College Event Management System
VITE_COLLEGE_NAME=GLA University
VITE_BRAND_INITIAL=C
VITE_ACCESS_TOKEN_KEY=cems.access_token
VITE_REFRESH_TOKEN_KEY=cems.refresh_token
VITE_USER_KEY=cems.user
VITE_RSVPS_KEY=cems.rsvps
VITE_PASSES_KEY=cems.passes
VITE_REQUEST_TIMEOUT_MS=15000
VITE_PAGE_SIZE=20
VITE_DEPARTMENTS=CSE,ECE,ME,CE,EEE,IT,AIML,MBA
VITE_YEARS=1,2,3,4,5
VITE_ASSET_CATEGORIES=PROJECTOR,MICROPHONE,SPEAKER,CHAIR,TABLE,OTHER
VITE_DEV_PORT=$FrontendPort
"@ | Set-Content -Path $ClientEnv -Encoding ASCII
  Write-Ok "Created client\.env (frontend settings)."
} else {
  Write-Ok "client\.env already exists - leaving it untouched."
}

# ---- 3. Install dependencies ------------------------------------------------
Write-Step "Installing backend dependencies (this can take a few minutes)"
Push-Location $ServerDir
& $Npm install --no-audit --no-fund
if ($LASTEXITCODE -ne 0) { Pop-Location; Fail "Backend dependency install failed." }
Pop-Location
Write-Ok "Backend dependencies installed."

Write-Step "Installing frontend dependencies (this can take a few minutes)"
Push-Location $ClientDir
& $Npm install --no-audit --no-fund
if ($LASTEXITCODE -ne 0) { Pop-Location; Fail "Frontend dependency install failed." }
Pop-Location
Write-Ok "Frontend dependencies installed."

# ---- 4. Generate launcher scripts and start both servers -------------------
Write-Step "Starting the servers"
New-Item -ItemType Directory -Force -Path $RunDir | Out-Null

$backendBat = Join-Path $RunDir 'run-backend.bat'
@"
@echo off
title CEMS Backend (do not close)
set "PATH=$NodeBin;%PATH%"
cd /d "$ServerDir"
echo ============================================================
echo   CEMS BACKEND - running at http://localhost:$BackendPort
echo   Keep this window open. Close it to stop the backend.
echo ============================================================
call "$Npm" start
echo.
echo Backend stopped. Press any key to close.
pause >nul
"@ | Set-Content -Path $backendBat -Encoding ASCII

$frontendBat = Join-Path $RunDir 'run-frontend.bat'
@"
@echo off
title CEMS Frontend (do not close)
set "PATH=$NodeBin;%PATH%"
cd /d "$ClientDir"
echo ============================================================
echo   CEMS FRONTEND - running at http://localhost:$FrontendPort
echo   Keep this window open. Close it to stop the frontend.
echo ============================================================
call "$Npm" run dev
echo.
echo Frontend stopped. Press any key to close.
pause >nul
"@ | Set-Content -Path $frontendBat -Encoding ASCII

Start-Process -FilePath $backendBat
Write-Ok "Backend window launched (http://localhost:$BackendPort)."

# Give the backend a head start before the frontend & browser.
Start-Sleep -Seconds 4
Start-Process -FilePath $frontendBat
Write-Ok "Frontend window launched (http://localhost:$FrontendPort)."

# Wait for Vite to come up, then open the browser.
Write-Host "    Waiting for the app to be ready..." -ForegroundColor DarkGray
$ready = $false
for ($i = 0; $i -lt 30; $i++) {
  Start-Sleep -Seconds 2
  try {
    $resp = Invoke-WebRequest -Uri "http://localhost:$FrontendPort" -UseBasicParsing -TimeoutSec 3
    if ($resp.StatusCode -eq 200) { $ready = $true; break }
  } catch { }
}

if ($ready) {
  Start-Process "http://localhost:$FrontendPort"
  Write-Ok "Opened the app in your browser."
} else {
  Write-Warn2 "The app is taking longer than usual. Open this link manually in a few seconds:"
  Write-Host  "    http://localhost:$FrontendPort" -ForegroundColor White
}

Write-Host "`n===========================================================" -ForegroundColor Green
Write-Host "  CEMS is running!" -ForegroundColor Green
Write-Host "  Frontend : http://localhost:$FrontendPort" -ForegroundColor Green
Write-Host "  Backend  : http://localhost:$BackendPort/api/v1/health" -ForegroundColor Green
Write-Host "" -ForegroundColor Green
Write-Host "  Demo login:" -ForegroundColor Green
Write-Host "    student@glauniversity.in  /  password123" -ForegroundColor Green
Write-Host "    admin@glauniversity.in    /  password123" -ForegroundColor Green
Write-Host "" -ForegroundColor Green
Write-Host "  To STOP: close the two server windows that opened." -ForegroundColor Green
Write-Host "===========================================================" -ForegroundColor Green
