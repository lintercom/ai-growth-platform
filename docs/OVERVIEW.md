# Přehled - AI Growth & Design Platform

Komplexní přehled platformy pro AI-powered analýzu, architekturu a design webů a e-shopů.

## 🎯 Cíl

Platforma poskytuje profesionální nástroje pro:

- **Analýzu** webů z hlediska SEO, UX, performance a accessibility
- **Architekturu** systémů a UI s AI-powered doporučeními
- **Design DNA** extrakci a analýzu designových principů
- **Export** strukturovaných artefaktů pro další zpracování

## 🏗️ Architektura

### Monorepo struktura

Platforma je rozdělena do několika balíčků v pnpm workspace:

```
packages/
├── ai-toolkit-core/    # Core engine (OpenAI wrapper, agents, orchestrator)
├── aig-cli/            # CLI nástroje
├── aig-workflows/      # Workflows (analyze, architect, export)
├── aig-schemas/        # Zod schémata artefaktů
├── aig-utils/          # Utilities (paths, config, fs)
└── aig-web-toolkit/    # AI-First Web Toolkit (12 modulů)
```

### Core Components

#### 1. OpenAI Client (`ai-toolkit-core`)

Wrapper nad OpenAI API s:
- Budget trackingem a enforcement
- Audit loggingem
- Retry logic
- Embeddings podporou

#### 2. Agent Framework

Role-based agenty:
- `analyzer` - analýza webů
- `architect` - systémová architektura
- `designer` - design principy
- `strategist` - strategické doporučení
- `general` - obecné úlohy

#### 3. Orchestrator

Sekvenční workflow execution:
- State management mezi kroky
- Error recovery
- Budget kontrolu

#### 4. Storage Adapters

Flexibilní ukládání dat:
- **File** (default) - lokální soubory
- **MySQL** - produkční databáze
- **Postgres** - produkční databáze

#### 5. Event Sink Adapters

Event tracking:
- **none** (default) - žádné eventy
- **file** - JSONL soubory
- **db-aggregate** - agregace do DB
- **external** - HTTP webhook

#### 6. Vector Store Adapters

Vektorové vyhledávání:
- **none** (default) - žádné vektory
- **local** - SQLite
- **external** - HTTP API

## 📦 Funkce

### ✅ Implementované

- **Analýza webu** - SEO, UX, performance, accessibility
- **Budget management** - automatická kontrola nákladů
- **Audit logging** - strukturované logování
- **Export artefaktů** - Markdown reporty
- **Storage adaptéry** - File, MySQL, Postgres
- **Event tracking** - File, DB-aggregate, External
- **Vector store** - Local (SQLite), External

### 🚧 V plánu

- Design analýza (Design DNA)
- Systémová architektura
- UI architektura
- Interaktivní chat
- JSON bundle export

## 🔄 Workflow

### Typický workflow

1. **Setup** - `aig setup` (nastavení API klíče)
2. **Init** - `aig init` (inicializace workspace)
3. **Create Project** - `aig project create` (vytvoření projektu)
4. **Analyze** - `aig analyze web` (analýza webu)
5. **Export** - `aig export md` (export výsledků)

### Workflow execution

```
[CLI Command]
    ↓
[Workflow Function]
    ↓
[Orchestrator]
    ↓
[Agent + Tools]
    ↓
[OpenAI API]
    ↓
[Storage Adapter]
    ↓
[Artifacts]
```

## 💰 Budget Management

Platforma automaticky sleduje náklady:

- **Budget tracking** - každý API call je zaznamenán
- **Budget enforcement** - workflow se zastaví při překročení
- **Cost report** - detailní report nákladů

**Příklad:**
```bash
aig analyze web --project demo --budget 2.0
```

## 🔐 Bezpečnost

- **API klíče** - nikdy se neukládají do artefaktů ani logů
- **Redaction** - citlivá data se automaticky maskují
- **Validace** - všechny artefakty validují přes Zod

## 📊 Artifacts

Všechny artefakty následují konvenci:

- `00_run_meta.json` - Metadata runu
- `10_analysis.json` - Analýza
- `60_cost_report.json` - Cost tracking
- `70_audit_log.json` - Audit log

Viz [ARTIFACTS.md](./ARTIFACTS.md) pro detailní dokumentaci.

## 🛠️ AI-First Web Toolkit

Platforma obsahuje 12 AI-powered modulů nahrazujících klasický webový stack:

1. Intent-Based Router
2. AI State Reasoner
3. AI Content Orchestrator
4. AI SEO Reasoning Engine
5. Conversational Data Collector
6. AI Product Reasoner
7. Contextual Personalization Engine
8. AI Event Interpreter
9. Hypothesis-Driven Optimizer
10. AI Decision Engine
11. AI Recovery Layer
12. AI System Operator

Viz [packages/aig-web-toolkit/README.md](../packages/aig-web-toolkit/README.md).

## 🔌 Adaptéry

Platforma podporuje flexibilní adaptéry pro různá prostředí:

### Storage

- **File** - lokální vývoj (default)
- **MySQL** - produkce (Hostinger)
- **Postgres** - produkce (Neon)

### Event Sink

- **none** - žádné eventy (default)
- **file** - JSONL soubory
- **db-aggregate** - agregace do DB
- **external** - HTTP webhook

### Vector Store

- **none** - žádné vektory (default)
- **local** - SQLite
- **external** - HTTP API

Viz [ADAPTERS_IMPLEMENTATION.md](./ADAPTERS_IMPLEMENTATION.md).

## 📚 Dokumentace

- [CLI.md](./CLI.md) - CLI referenční dokumentace
- [ARTIFACTS.md](./ARTIFACTS.md) - Artefakty dokumentace
- [USAGE.md](./USAGE.md) - Průvodce použitím
- [ADAPTERS_IMPLEMENTATION.md](./ADAPTERS_IMPLEMENTATION.md) - Adaptéry implementace
- [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) - Implementační plán

## 🚀 Začínáme

```bash
# Instalace
pnpm install
pnpm -r run build

# Setup
aig setup

# První analýza
aig init
aig project create demo --url https://example.com --type web --market CZ
aig analyze web --project demo
aig export md --project demo --from latest
```

Viz [USAGE.md](./USAGE.md) pro detailní průvodce.

## 📄 Licence

MIT
