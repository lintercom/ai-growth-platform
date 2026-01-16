#!/bin/bash
# AI Growth Platform - Instalační skript pro Linux/macOS

set -e

echo "========================================"
echo "AI Growth Platform - Instalace"
echo "========================================"
echo ""

# Kontrola Node.js
echo "[1/6] Kontrola Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js není nainstalován!"
    echo "   Instalujte Node.js z: https://nodejs.org/"
    exit 1
fi
NODE_VERSION=$(node --version)
echo "   ✓ Node.js $NODE_VERSION"

# Kontrola pnpm
echo "[2/6] Kontrola pnpm..."
if ! command -v pnpm &> /dev/null; then
    echo "   pnpm není nainstalován, instaluji..."
    npm install -g pnpm
    if [ $? -ne 0 ]; then
        echo "❌ Instalace pnpm selhala!"
        exit 1
    fi
fi
PNPM_VERSION=$(pnpm --version)
echo "   ✓ pnpm $PNPM_VERSION"

# Klonování (pokud už neexistuje)
PROJECT_DIR="ai-growth-platform"
if [ ! -d "$PROJECT_DIR" ]; then
    echo "[3/6] Klonování repozitáře..."
    git clone https://github.com/lintercom/ai-growth-platform.git
    if [ $? -ne 0 ]; then
        echo "❌ Klonování selhalo!"
        exit 1
    fi
    echo "   ✓ Repozitář naklonován"
else
    echo "[3/6] Adresář $PROJECT_DIR již existuje"
    echo "   ✓ Přeskakuji klonování"
fi

cd "$PROJECT_DIR"

# Instalace závislostí
echo "[4/6] Instalace závislostí..."
pnpm install
if [ $? -ne 0 ]; then
    echo "❌ Instalace závislostí selhala!"
    exit 1
fi
echo "   ✓ Závislosti nainstalovány"

# Build
echo "[5/6] Build projektu..."
pnpm -r run build
if [ $? -ne 0 ]; then
    echo "❌ Build selhal!"
    exit 1
fi
echo "   ✓ Projekt zbuildován"

# Globální instalace CLI
echo "[6/6] Globální instalace CLI..."
cd packages/aig-cli
pnpm link --global
cd ../..
echo "   ✓ CLI nainstalováno globálně"

echo ""
echo "========================================"
echo "✅ Instalace dokončena!"
echo "========================================"
echo ""
echo "Nyní můžete spustit:"
echo "  aig setup     - Nastavení OpenAI API klíče"
echo "  aig doctor    - Kontrola prostředí"
echo "  aig init      - Inicializace workspace"
echo ""
echo "Nebo zkuste: aig --help"
echo ""
