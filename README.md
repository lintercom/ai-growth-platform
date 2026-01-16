# AI Growth & Design Platform

Profesionální platforma pro AI-powered analýzu, architekturu a design webů a e-shopů.

## 🎯 Přehled

Monorepo obsahující:
- **ai-toolkit-core**: Core engine nad OpenAI platformou
- **aig-cli**: CLI nástroje (`aig` command)
- **aig-workflows**: Analyzer/Architect/Export workflows
- **aig-schemas**: Zod schémata artefaktů
- **aig-utils**: Utility funkce (paths, config storage, fs helpers)
- **aig-web-toolkit**: AI-First Web Toolkit (12 modulů nahrazujících klasický webový stack)

## 🚀 Instalace

```bash
# Klonování repo
git clone https://github.com/<username>/ai-growth-platform.git
cd ai-growth-platform

# Instalace závislostí
pnpm install

# Build
pnpm -w build
```

## 📋 Požadavky

- Node.js >= 18
- pnpm >= 8.0.0

## 🛠️ Setup

```bash
# První spuštění - konfigurace
aig setup

# Ověření prostředí
aig doctor
```

## 📖 Dokumentace

Viz [docs/](./docs/):
- `OVERVIEW.md` - Přehled platformy
- `CLI.md` - CLI příkazy reference
- `ARTIFACTS.md` - Formáty artefaktů
- `IMPLEMENTATION_PLAN.md` - Implementační plán

## 📦 Struktura

```
.
├── packages/
│   ├── ai-toolkit-core/    # Core toolkit (OpenAI wrapper, agents, orchestrator)
│   ├── aig-cli/            # CLI aplikace
│   ├── aig-workflows/      # Workflows (analyze, architect, export, chat)
│   ├── aig-schemas/        # Zod schémata
│   └── aig-utils/          # Utilities
├── examples/               # Demo příklady
├── docs/                   # Dokumentace
└── projects/               # Lokální projekty (generované)
```

## 🎨 Funkce

- ✅ Analýza webů a designu
- ✅ Architektura systémů a UI
- ✅ Export artefaktů (MD, JSON)
- ✅ Interaktivní chat s agenty
- ✅ Budget management a cost tracking
- ✅ Audit logging

## 📄 Licence

MIT
