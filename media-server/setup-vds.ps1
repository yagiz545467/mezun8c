# 8C Media Server - VDS Kurulum ve Başlatma Scripti
# Yönetici olarak çalıştırın (Run as Administrator)

Write-Host "=== 8C Media Server Kurulumu ===" -ForegroundColor Cyan

# Node.js kontrolü
try {
    $nodeVersion = node --version
    Write-Host "Node.js bulundu: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Node.js bulunamadı! https://nodejs.org adresinden indirin." -ForegroundColor Red
    exit 1
}

# Proje dizinine git
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

# Bağımlılıkları yükle
Write-Host "`nBağımlılıklar yükleniyor..." -ForegroundColor Yellow
npm install

# Windows Defender istisnası (media klasörü taramasın)
try {
    $mediaPath = Join-Path $scriptDir "media"
    if (-not (Test-Path $mediaPath)) {
        New-Item -ItemType Directory -Path $mediaPath -Force | Out-Null
    }
    Add-MpPreference -ExclusionPath $mediaPath -ErrorAction SilentlyContinue
    Write-Host "Windows Defender istisnası eklendi" -ForegroundColor Green
} catch {
    Write-Host "Defender istisnası eklenemedi (yönetici yetkisi gerekli olabilir)" -ForegroundColor Yellow
}

# Firewall kuralı (port 3001)
try {
    New-NetFirewallRule -DisplayName "8C Media Server (3001)" -Direction Inbound -Protocol TCP -LocalPort 3001 -Action Allow -ErrorAction SilentlyContinue
    Write-Host "Firewall kuralı eklendi (port 3001)" -ForegroundColor Green
} catch {
    Write-Host "Firewall kuralı eklenemedi" -ForegroundColor Yellow
}

# Servis olarak çalıştırmak için PM2 yükle
Write-Host "`nPM2 yükleniyor (process manager)..." -ForegroundColor Yellow
npm install -g pm2

# Servisi başlat
Write-Host "`nMedia server başlatılıyor..." -ForegroundColor Green
pm2 start server.js --name "8c-media-server"
pm2 save

Write-Host "`n=== KURULUM TAMAMLANDI ===" -ForegroundColor Cyan
Write-Host "Media server çalışıyor: http://localhost:3001" -ForegroundColor White
Write-Host "" -ForegroundColor White

# Sunucu IP'sini göster
$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notlike '*Loopback*' -and $_.PrefixOrigin -ne 'WellKnown' }).IPAddress
Write-Host "Dışarıdan erişim için IP adresleriniz:" -ForegroundColor Yellow
foreach ($addr in $ip) {
    Write-Host "  http://$addr`:3001" -ForegroundColor White
}

Write-Host "`nFrontend'de CameraTab.tsx içindeki VDS_URL sabitini güncelleyin:" -ForegroundColor Yellow
Write-Host "  const VDS_URL = 'http://<sunucu-ip:3001>';" -ForegroundColor White
Write-Host "`nPM2 komutları:" -ForegroundColor Yellow
Write-Host "  pm2 status            - Durum görüntüle" -ForegroundColor Gray
Write-Host "  pm2 logs 8c-media-server - Logları izle" -ForegroundColor Gray
Write-Host "  pm2 restart 8c-media-server - Yeniden başlat" -ForegroundColor Gray
Write-Host "  pm2 stop 8c-media-server   - Durdur" -ForegroundColor Gray
