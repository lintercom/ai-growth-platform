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

### Z GitHubu (doporučeno)

```bash
# Klonování repozitáře
git clone https://github.com/lintercom/ai-growth-platform.git
cd ai-growth-platform

# Instalace závislostí
pnpm install

# Build všech balíčků
pnpm -r run build

# Lokální instalace CLI (volitelné)
pnpm link -g

# Ověření instalace
aig --help
```

**Poznámka:** Pro lokální použití můžete spouštět CLI přímo:
```bash
pnpm --filter @aig/cli exec aig --help
```

Nebo přidat do `package.json` script:
```json
{
  "scripts": {
    "aig": "pnpm --filter @aig/cli exec aig"
  }
}
```

Pak spustíte: `pnpm aig --help`

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
- **[OVERVIEW.md](docs/OVERVIEW.md)** - Přehled platformy a architektura
- **[CLI.md](docs/CLI.md)** - Kompletní CLI referenční dokumentace
- **[USAGE.md](docs/USAGE.md)** - Průvodce použitím a příklady
- **[ARTIFACTS.md](docs/ARTIFACTS.md)** - Formáty a struktura artefaktů
- **[ADAPTERS_IMPLEMENTATION.md](docs/ADAPTERS_IMPLEMENTATION.md)** - Adaptační vrstvy
- **[IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md)** - Implementační plán
- **[GITHUB_SETUP.md](docs/GITHUB_SETUP.md)** - Nastavení GitHub repozitáře

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

- ✅ **Analýza webu** - SEO, UX, performance, accessibility
- ✅ **Budget management** - automatická kontrola nákladů OpenAI API
- ✅ **Audit logging** - strukturované logování všech operací
- ✅ **Export artefaktů** - Markdown reporty
- ✅ **Storage adaptéry** - File, MySQL, Postgres
- ✅ **Event tracking** - File, DB-aggregate, External webhooks
- ✅ **Vector store** - Local (SQLite), External API
- ✅ **AI-First Web Toolkit** - 12 modulů nahrazujících klasický webový stack
- 🚧 Design analýza (Design DNA) - v plánu
- 🚧 Architektura systémů a UI - v plánu
- 🚧 Interaktivní chat - v plánu

## 📄 Licence

MIT
