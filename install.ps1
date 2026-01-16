# AI Growth Platform - Instalační skript pro Windows (PowerShell)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "AI Growth Platform - Instalace" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Kontrola Node.js
Write-Host "[1/6] Kontrola Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if (-not $nodeVersion) {
    Write-Host "❌ Node.js není nainstalován!" -ForegroundColor Red
    Write-Host "   Instalujte Node.js z: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}
Write-Host "   ✓ Node.js $nodeVersion" -ForegroundColor Green

# Kontrola pnpm
Write-Host "[2/6] Kontrola pnpm..." -ForegroundColor Yellow
$pnpmVersion = pnpm --version 2>$null
if (-not $pnpmVersion) {
    Write-Host "   pnpm není nainstalován, instaluji..." -ForegroundColor Yellow
    npm install -g pnpm
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Instalace pnpm selhala!" -ForegroundColor Red
        exit 1
    }
}
Write-Host "   ✓ pnpm $pnpmVersion" -ForegroundColor Green

# Klonování (pokud už neexistuje)
$projectDir = "ai-growth-platform"
if (-not (Test-Path $projectDir)) {
    Write-Host "[3/6] Klonování repozitáře..." -ForegroundColor Yellow
    git clone https://github.com/lintercom/ai-growth-platform.git
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Klonování selhalo!" -ForegroundColor Red
        exit 1
    }
    Write-Host "   ✓ Repozitář naklonován" -ForegroundColor Green
} else {
    Write-Host "[3/6] Adresář $projectDir již existuje" -ForegroundColor Yellow
    Write-Host "   ✓ Přeskakuji klonování" -ForegroundColor Green
}

Set-Location $projectDir

# Instalace závislostí
Write-Host "[4/6] Instalace závislostí..." -ForegroundColor Yellow
pnpm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Instalace závislostí selhala!" -ForegroundColor Red
    exit 1
}
Write-Host "   ✓ Závislosti nainstalovány" -ForegroundColor Green

# Build
Write-Host "[5/6] Build projektu..." -ForegroundColor Yellow
pnpm -r run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build selhal!" -ForegroundColor Red
    exit 1
}
Write-Host "   ✓ Projekt zbuildován" -ForegroundColor Green

# Globální instalace CLI (volitelné)
Write-Host "[6/6] Globální instalace CLI..." -ForegroundColor Yellow
Set-Location packages/aig-cli
pnpm link --global
Set-Location ../..
Write-Host "   ✓ CLI nainstalováno globálně" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ Instalace dokončena!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Nyní můžete spustit:" -ForegroundColor Cyan
Write-Host "  aig setup     - Nastavení OpenAI API klíče" -ForegroundColor White
Write-Host "  aig doctor    - Kontrola prostředí" -ForegroundColor White
Write-Host "  aig init      - Inicializace workspace" -ForegroundColor White
Write-Host ""
Write-Host "Nebo zkuste: aig --help" -ForegroundColor Yellow
Write-Host ""
