# SSL Sertifikası Oluşturma (Windows Server)
# Yönetici olarak çalıştırın!

$ErrorActionPreference = "Stop"
$serverDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$certDir = Join-Path $serverDir "certs"
$certPath = Join-Path $certDir "cert.pem"
$keyPath = Join-Path $certDir "key.pem"

# Klasörü oluştur
New-Item -ItemType Directory -Path $certDir -Force | Out-Null

Write-Host "=== SSL Sertifikası Oluşturuluyor ===" -ForegroundColor Cyan
Write-Host "IP: 212.180.120.242" -ForegroundColor Yellow
Write-Host ""

# Self-signed sertifika oluştur
Write-Host "[1/3] Sertifika oluşturuluyor..." -ForegroundColor Yellow
$cert = New-SelfSignedCertificate `
    -DnsName "212.180.120.242" `
    -CertStoreLocation "Cert:\LocalMachine\My" `
    -KeyAlgorithm RSA `
    -KeyLength 2048 `
    -NotAfter (Get-Date).AddYears(1) `
    -KeyExportPolicy Exportable `
    -TextExtension "2.5.29.17={text}IPAddress=212.180.120.242"

Write-Host "  Oluşturuldu: $($cert.Thumbprint)" -ForegroundColor Green

# Export as PFX (şifre ile)
Write-Host "[2/3] PFX'e dönüştürülüyor..." -ForegroundColor Yellow
$pfxPath = Join-Path $certDir "cert.pfx"
$password = [Guid]::NewGuid().ToString().Substring(0, 12)
$securePassword = ConvertTo-SecureString -String $password -Force -AsPlainText
Export-PfxCertificate -Cert $cert -FilePath $pfxPath -Password $securePassword | Out-Null
Write-Host "  PFX oluşturuldu: $pfxPath" -ForegroundColor Green

# OpenSSL ile PEM'e çevir
Write-Host "[3/3] PEM'e dönüştürülüyor..." -ForegroundColor Yellow

# OpenSSL yolunu bul (Git Bash ile gelen)
$opensslPaths = @(
    "C:\Program Files\Git\usr\bin\openssl.exe",
    "C:\Program Files\OpenSSL-Win64\bin\openssl.exe",
    "C:\Program Files\OpenSSL-Win32\bin\openssl.exe"
)
$openssl = $null
foreach ($p in $opensslPaths) {
    if (Test-Path $p) { $openssl = $p; break }
}

if (-not $openssl) {
    Write-Host "  OpenSSL bulunamadı! Alternatif yol deneniyor..." -ForegroundColor Yellow
    # Windows'un certutil ile export
    # Özel anahtarı export et (DER format)
    $privateKeyPath = Join-Path $certDir "private.key"
    $publicKeyPath = Join-Path $certDir "public.cer"
    
    try {
        Export-Certificate -Cert $cert -FilePath $publicKeyPath -Type CERT | Out-Null
        
        # Base64 formatına çevir
        $certBase64 = [Convert]::ToBase64String([System.IO.File]::ReadAllBytes($publicKeyPath), 'InsertLineBreaks')
        @"
-----BEGIN CERTIFICATE-----
$certBase64
-----END CERTIFICATE-----
"@ | Set-Content $certPath -Encoding ASCII
        
        Write-Host "  Sertifika kaydedildi: $certPath" -ForegroundColor Green
        Write-Host ""
        Write-Host "  !!! ÖZEL ANAHTAR (key.pem) OTOMATİK OLARAK AYIKLANAMADI !!!" -ForegroundColor Red
        Write-Host "  Şu adımları elle yap:" -ForegroundColor Yellow
        Write-Host "  1. mmc.exe aç -> Certifikalar Ekle -> Bilgisayar Hesabı -> Yerel Bilgisayar" -ForegroundColor Gray
        Write-Host "  2. Kişisel -> Sertifikalar -> 212.180.120.242 -> Tüm Görevler -> Dışa Aktar" -ForegroundColor Gray
        Write-Host "  3. Özel anahtarı dışa aktar seç -> PFX formatı" -ForegroundColor Gray
        Write-Host "  4. PFX'ten PEM çıkarmak için OpenSSL kullan" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Veya npm'den 'pem' paketi ile dene:" -ForegroundColor Yellow
        Write-Host "  cd media-server && npm install pem && node -e ""const pem=require('pem');pem.createCertificate({days:365,selfSigned:true},(e,k)=>require('fs').writeFileSync('certs/cert.pem',k.certificate+require('fs').readFileSync('certs/key.pem','utf8')))""" -ForegroundColor Gray
    } catch {
        Write-Host "  Hata: $_" -ForegroundColor Red
    }
} else {
    # OpenSSL var, PFX'ten PEM çıkar
    $env:PASS = $password
    & $openssl pkcs12 -in $pfxPath -out $certPath -nokeys -passin env:PASS 2>$null
    & $openssl pkcs12 -in $pfxPath -out $keyPath -nocerts -nodes -passin env:PASS 2>$null
    Remove-Item env:PASS
    
    Write-Host "  PEM dosyaları oluşturuldu:" -ForegroundColor Green
    Write-Host "    $certPath" -ForegroundColor White
    Write-Host "    $keyPath" -ForegroundColor White
}

Write-Host ""
Write-Host "=== TAMAMLANDI ===" -ForegroundColor Cyan
Write-Host "Sunucuyu yeniden başlat: taskkill /IM node.exe /F && node server.js" -ForegroundColor Yellow
Write-Host "Tarayıcıda HTTPS'ten aç ve 'Gelişmiş -> Devam Et' de:" -ForegroundColor Yellow
Write-Host "  https://212.180.120.242:3443/api/health" -ForegroundColor White
