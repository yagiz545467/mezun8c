# Cloudflare Tunnel ile HTTPS
# Ücretsiz, domain gerekmez. Çıkan HTTPS URL'i VITE_VDS_URL'e yazın.

$ErrorActionPreference = "Stop"
$serverDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$cfPath = Join-Path $serverDir "cloudflared.exe"

# cloudflared yoksa indir
if (-not (Test-Path $cfPath)) {
    Write-Host "cloudflared indiriliyor..." -ForegroundColor Yellow
    $url = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"
    Invoke-WebRequest -Uri $url -OutFile $cfPath -UseBasicParsing
}

# Media server'ı arka planda başlat
Start-Process -FilePath "node" -ArgumentList "server.js" -WorkingDirectory $serverDir -NoNewWindow

Write-Host "=== HTTPS URL'iniz aşağıda ===" -ForegroundColor Cyan
Write-Host "https://XXXXX.trycloudflare.com şeklinde olacak" -ForegroundColor White
Write-Host "Çıkan URL'i .env'e yaz: VITE_VDS_URL=https://..." -ForegroundColor Yellow
Write-Host "Çıkmak için Ctrl+C`n" -ForegroundColor Gray

& $cfPath tunnel --url http://localhost:3001
