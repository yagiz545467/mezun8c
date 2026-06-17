# 8C Media Server - Deploy Script (VDS'te çalıştır)
# Önce git'i yokla, yoksa GitHub'dan indir

$ErrorActionPreference = "Stop"
$serverDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "=== 8C Media Server Deploy ===" -ForegroundColor Cyan

# Repo root (media-server'in parent'ı olan proje root'u)
$repoDir = Resolve-Path "$serverDir\.."

# 1. Projeyi build et
Write-Host "`n[1/4] Frontend build alınıyor..." -ForegroundColor Yellow
Set-Location $repoDir
npm run build
if (-not $?) { throw "Build başarısız" }

# 2. dist'i media-server'a kopyala
Write-Host "`n[2/4] dist/ kopyalanıyor..." -ForegroundColor Yellow
$distDir = Join-Path $serverDir "dist"
if (Test-Path $distDir) { Remove-Item -Recurse -Force $distDir }
Copy-Item -Recurse (Join-Path $repoDir "dist") $distDir
Write-Host "dist/ -> $distDir" -ForegroundColor Green

# 3. media-server bağımlılıklarını yükle
Write-Host "`n[3/4] Sunucu bağımlılıkları yükleniyor..." -ForegroundColor Yellow
Set-Location $serverDir
npm install
if (-not $?) { throw "npm install başarısız" }

# 4. Eski Node processlerini temizle
Write-Host "`n[4/4] Eski server durduruluyor..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
Write-Host "Eski process'ler temizlendi" -ForegroundColor Green

# 5. Başlat
Write-Host "`n=== Sunucu başlatılıyor: http://212.180.120.242:3001 ===" -ForegroundColor Cyan
Write-Host "Uygulama: http://212.180.120.242:3001" -ForegroundColor White
Write-Host "Health:   http://212.180.120.242:3001/api/health" -ForegroundColor Gray
Write-Host "Upload:   http://212.180.120.242:3001/api/upload" -ForegroundColor Gray

# Windows Defender istisnası
try {
    Add-MpPreference -ExclusionPath $serverDir -ErrorAction SilentlyContinue
} catch {}

node server.js
