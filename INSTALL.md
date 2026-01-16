# Instalace a spuštění

## Rychlá instalace

```bash
# 1. Klonování
git clone https://github.com/<VAŠE-USERNAME>/ai-growth-platform.git
cd ai-growth-platform

# 2. Instalace závislostí
pnpm install

# 3. Build
pnpm -r run build

# 4. Lokální instalace CLI (volitelné)
pnpm link -g

# 5. Ověření
aig --help
```

## Použití bez globální instalace

Můžete používat CLI přímo z projektu pomocí pnpm scriptu:

```bash
# V root adresáři projektu
pnpm aig --help
pnpm aig setup
pnpm aig init
```

Nebo přímo:
```bash
pnpm --filter @aig/cli exec aig --help
```

## První spuštění

```bash
# Setup API klíče
aig setup

# Inicializace workspace
aig init

# Vytvoření projektu
aig project create demo --url https://example.com --type web --market CZ

# Analýza
aig analyze web --project demo
```

## Požadavky

- Node.js >= 18
- pnpm >= 8.0.0

## Troubleshooting

**Problém: `aig: command not found`**
- Pokud jste nepoužili `pnpm link -g`, použijte `pnpm aig` místo `aig`

**Problém: Workspace dependencies nejsou nalezeny**
- Ujistěte se, že jste spustili `pnpm install` v root adresáři
- Workspace dependencies fungují pouze s pnpm workspaces

**Problém: Build selhává**
- Zkontrolujte, že máte Node.js >= 18
- Zkontrolujte, že máte pnpm >= 8.0.0
- Zkuste `pnpm install --force`

Viz [docs/USAGE.md](docs/USAGE.md) pro detailní dokumentaci.
