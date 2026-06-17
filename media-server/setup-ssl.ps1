# 8C Media Server - Cloudflare Tunnel Kurulumu
# HTTPS sorununu ücretsiz çözer. Yönetici olarak çalıştırın!

$ErrorActionPreference = "Stop"
$serverDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "=== Cloudflare Tunnel Kurulumu ===" -ForegroundColor Cyan
Write-Host "Bu yöntemle HTTPS ücretsiz, domain gerekmez.`n"

$cfPath = Join-Path $serverDir "cloudflared.exe"

if (-not (Test-Path $cfPath)) {
    Write-Host "[1/2] cloudflared indiriliyor..." -ForegroundColor Yellow
    $url = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"
    try {
        Invoke-WebRequest -Uri $url -OutFile $cfPath -UseBasicParsing -ErrorAction Stop
        Write-Host "  İndirildi: $cfPath" -ForegroundColor Green
    } catch {
        Write-Host "  İndirme başarısız, manuel indir:" -ForegroundColor Red
        Write-Host "  $url" -ForegroundColor Gray
        Write-Host "  Dosyayı $serverDir klasörüne koy." -ForegroundColor Gray
        exit 1
    }
}

# Önce eski server varsa durdur
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force

Write-Host "[2/2] Tunnel başlatılıyor..." -ForegroundColor Yellow
Write-Host ""
Write-Host "=== HTTPS URL'iniz aşağıda görünecek (trycloudflare.com) ===" -ForegroundColor Cyan
Write-Host "Şu formatta olacak: https://XXXXX.trycloudflare.com" -ForegroundColor White
Write-Host ""
Write-Host "Bu URL'i CameraTab.tsx'teki VDS_URL olarak kullanın." -ForegroundColor Yellow
Write-Host "Veya .env dosyasına yazın: VITE_VDS_URL=https://XXXXX.trycloudflare.com" -ForegroundColor Yellow
Write-Host ""
Write-Host "Not: Tunnel'ı kapatmak için Ctrl+C" -ForegroundColor Gray
Write-Host ""

# Media server'ı arka planda başlat
$job = Start-Process -FilePath "node" -ArgumentList "server.js" -WorkingDirectory $serverDir -NoNewWindow -PassThru

# Tunnel'ı başlat
& $cfPath tunnel --url http://localhost:3001

# Temizlik
$job | Stop-Process -Force
