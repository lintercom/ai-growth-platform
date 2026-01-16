# Instalace AI Growth Platform CLI

## Z GitHubu (lokální instalace)

```bash
# Klonování repozitáře
git clone https://github.com/lintercom/ai-growth-platform.git
cd ai-growth-platform

# Instalace závislostí
pnpm install

# Build všech balíčků
pnpm -r run build

# Lokální instalace CLI
pnpm link -g

# Ověření instalace
aig --help
```

## Jako npm balíček (po publikování)

```bash
npm install -g @aig/cli
```

Nebo lokálně:
```bash
npm install @aig/cli
npx aig --help
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
- pnpm >= 8.0.0 (pro lokální instalaci z Git)
- OpenAI API klíč

Viz [docs/USAGE.md](docs/USAGE.md) pro detailní dokumentaci.
