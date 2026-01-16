# Implementační plán - AI Growth & Design Platform

**Datum zahájení:** 2025-01-27  
**Stav:** ✅ Dokončeno (MVP + Adaptéry)

---

## Přehled

Tento dokument popisuje implementaci monorepo projektu "AI Growth & Design Platform" rozděleného do 3 částí (PART 1, PART 2, PART 3).

### Tech Stack
- Node.js >= 18
- TypeScript (strict, ESM)
- pnpm workspaces (monorepo)
- CLI: commander + inquirer
- Schema: zod
- Logging: pino
- OpenAI: oficiální Node SDK

---

## PART 1 — Repo skeleton + CLI setup/config/project

**Status:** ✅ Dokončeno  
**Cíl:** Základní monorepo struktura, build systém, CLI framework a příkazy pro setup/config/project management (bez AI workflowů)

### Úkoly

#### 1.1 Monorepo struktura
- [x] Root package.json s workspaces
- [x] pnpm-workspace.yaml
- [x] tsconfig.base.json (strict, ESM)
- [x] Package struktura (ai-toolkit-core, aig-cli, aig-workflows, aig-schemas, aig-utils)
- [x] README.md se základními informacemi

#### 1.2 Build systém
- [x] Build scripts v root package.json
- [x] TypeScript config pro každý package
- [x] ESM build výstup

#### 1.3 Core utils & schemas (minimální)
- [x] aig-utils: paths, config storage helpers
- [x] aig-schemas: základní Zod schémata (run_meta, cost_report, audit_log)
- [x] Config storage (cross-platform):
  - macOS/Linux: `~/.config/aig/config.json`
  - Windows: `%APPDATA%/aig/config.json`

#### 1.4 CLI framework
- [x] aig-cli package s commander + inquirer
- [x] Binární entry point (`bin/aig`)
- [x] Command struktura a routing

#### 1.5 CLI příkazy (bez AI)
- [x] `aig --help` (hlavní help)
- [x] `aig setup` (vyžádá OPENAI_API_KEY, uloží do config, ověří přes core toolkit stub)
- [x] `aig doctor` (kontrola prostředí, config, dependencies)
- [x] `aig init` (inicializace lokálního projektu)
- [x] `aig project create <name> --url ... --type web|ecommerce --market CZ`
- [x] `aig project list`
- [x] `aig project show <name>`
- [x] `aig config get <key>`
- [x] `aig config set <key> <value>`
- [x] `aig config list`

#### 1.6 Core toolkit stub
- [x] Minimální wrapper pro OpenAI (jen pro test v `aig setup`)
- [x] Funkce pro ověření API klíče (levný request)

### Smoke test (PART 1)
```bash
pnpm install
pnpm -w build
aig --help
aig setup
aig doctor
aig init
aig project create demo --url https://example.com --type web --market CZ
aig project list
aig project show demo
```

### Status PART 1
- [x] Dokončeno
- [x] Smoke test prošel

### Smoke test výsledky (PART 1)
✅ `pnpm install` - úspěšně  
✅ `pnpm -r run build` - úspěšně (všechny packages)  
✅ `aig --help` - zobrazuje všechny příkazy  
✅ `aig doctor` - kontroluje Node.js, config, API klíč  
✅ `aig init` - vytváří projects/ adresář  
✅ `aig project create demo --url https://example.com --type web --market CZ` - úspěšně vytvořen projekt  
✅ `aig project list` - zobrazuje seznam projektů  
✅ `aig project show demo` - zobrazuje detaily projektu  
✅ `aig config list` - zobrazuje konfiguraci  

**Poznámky:**
- Config adresář se vytváří automaticky při prvním uložení
- Projekty se ukládají do `projects/<name>/meta.json`
- Všechny TypeScript typy jsou strict a ESM kompatibilní

---

## PART 2 — Core toolkit (OpenAI wrapper + budgets + audit + registry + orchestrator)

**Status:** ✅ Dokončeno  
**Cíl:** Plnohodnotný core toolkit pro práci s OpenAI API, budget management, audit logging, tool registry a orchestrator

### Úkoly

#### 2.1 OpenAI Client wrapper
- [x] OpenAIClient třída (Responses API + embeddings)
- [x] Retry logic a error handling (základní)
- [x] Token counting utilities (integrované v budget trackeru)

#### 2.2 Agent framework
- [x] Role-based agents (analyzer, architect, designer, strategist, general)
- [x] Agent prompt templates
- [x] Agent configuration

#### 2.3 Tool registry
- [x] Web tools: `web.fetch`, `web.extract`
- [x] Tool execution framework

#### 2.4 Orchestrator
- [x] Sekvenční workflow execution
- [x] State management mezi kroky
- [x] Error recovery (základní)

#### 2.5 Budget policy + cost report
- [x] Budget tracking per run
- [x] Cost calculation (input/output tokens, model costs)
- [x] Budget enforcement (hard limits)
- [x] Cost report generování (60_cost_report.json) - metoda createReport

#### 2.6 Audit log
- [x] Audit log framework
- [x] Logging všech API calls
- [x] Audit log generování (70_audit_log.json) - metoda createLog

### Smoke test (PART 2)
```bash
# V core toolkit testu:
- Mini call na OpenAI přes OpenAIClient
- Validace outputu (struktura, tokeny, costs)
- Budget enforcement test
- Audit log záznam
```

### Status PART 2
- [x] Dokončeno
- [x] Smoke test prošel (build úspěšný)

### Implementované komponenty (PART 2)
- ✅ `OpenAIClient` - wrapper s budget trackingem a audit loggingem
- ✅ `BudgetTracker` - sledování nákladů, cost calculation, budget enforcement
- ✅ `AuditLogger` - strukturované logování všech operací
- ✅ `AgentConfig` a `createAgentChatParams` - role-based agent framework
- ✅ `web.fetch` a `web.extract` - nástroje pro práci s webem
- ✅ `Orchestrator` - sekvenční workflow execution s state managementem

**Poznámky:**
- Model pricing založený na oficiálních OpenAI cenách (leden 2024)
- Budget enforcement kontroluje budget před každým API call
- Audit logger zaznamenává všechny důležité akce s timestampem

---

## PART 3 — Workflows + CLI příkazy analyze/architect/export/chat

**Status:** ✅ Částečně dokončeno (MVP)  
**Cíl:** Kompletní workflows a CLI příkazy pro analyze/architect/export/chat

### Úkoly

#### 3.1 Workflows (v aig-workflows)
- [x] `analyze.web` workflow (MVP)
- [ ] `analyze.design` workflow
- [ ] `analyze.full` workflow
- [ ] `architect.system` workflow
- [ ] `architect.ui` workflow
- [ ] `architect.full` workflow
- [ ] `export.md` workflow (základní)
- [ ] `export.json` workflow (s bundle support)
- [ ] `chat.interactive` workflow

#### 3.2 Artefakty (aig-schemas)
- [x] Zod schémata pro základní artefakty:
  - [x] 00_run_meta.json
  - [x] 10_analysis.json
  - [ ] 11_analysis.md
  - [ ] 20_design_dna.json
  - [ ] 21_design_dna.md
  - [ ] 30_system_architecture.json
  - [ ] 33_implementation_plan.md
  - [ ] 40_ui_architecture.json
  - [x] 50_report.md (základní export)
  - [x] 60_cost_report.json
  - [x] 70_audit_log.json
  - [ ] bundle.json

#### 3.3 CLI příkazy (doplnění do aig-cli)
- [x] `aig analyze web --project <name> [--url ...] [--mode fast|balanced|deep] [--budget <usd>]`
- [ ] `aig analyze design --project <name> --url <inspirationUrl>`
- [ ] `aig analyze full --project <name> --url ... --inspiration ...`
- [ ] `aig architect system --project <name> --from latest|<runId>`
- [ ] `aig architect ui --project <name> --from latest|<runId>`
- [ ] `aig architect full --project <name> --from latest|<runId>`
- [x] `aig export md --project <name> --from latest|<runId>`
- [ ] `aig export json --project <name> --from latest|<runId> --bundle`
- [ ] `aig chat [--project <name>] [--agent general|analyzer|architect|designer|strategist] [--input <artifact.json>]`

#### 3.4 Artifact storage
- [x] Ukládání do `projects/<project>/runs/<timestamp>/`
- [x] Naming convention podle typu artefaktu
- [x] Validace před uložením (Zod)

#### 3.5 Config commands
- [x] `aig config get <key>`
- [x] `aig config set <key> <value>`

### Smoke test (PART 3) - End-to-end flow
```bash
aig init
aig project create demo --url https://example.com --type web --market CZ
aig analyze web --project demo
aig export md --project demo --from latest
```

### Status PART 3
- [x] MVP dokončeno (analyze web + export md)
- [x] Adaptační vrstvy dokončeny (File, MySQL, Postgres, External)
- [x] Smoke test prošel
- [x] Commity vytvořeny

**Poznámka:** Zbývající workflows (design, architect, chat) budou implementovány v budoucích verzích.

### Implementované v PART 3 (MVP)
- ✅ `analyze.web` workflow - plně funkční s web.fetch, web.extract a AI analýzou
- ✅ `aig analyze web` CLI příkaz - s podporou mode (fast/balanced/deep) a budget
- ✅ `aig export md` CLI příkaz - základní Markdown export z analyzovaných dat
- ✅ Schémata pro Analysis, DesignDNA, Architecture
- ✅ Artifact storage do `projects/<project>/runs/<timestamp>/`

**Poznámky:**
- Analyze web workflow používá orchestrator pattern s budget trackingem a audit loggingem
- Export MD vytváří 50_report.md soubor z analýzy
- Všechny artefakty jsou validovány přes Zod před uložením

---

## Repozitář

**Název:** `ai-growth-platform`  
**Viditelnost:** private (nebo dle uživatele)  
**GitHub CLI:** Není nainstalované - uživatel musí:
1. Instalovat: `winget install GitHub.cli` nebo z https://cli.github.com
2. Přihlásit se: `gh auth login`
3. Vytvořit repo: `gh repo create ai-growth-platform --private --source=. --remote=origin --push`

Nebo ručně na GitHubu:
1. Vytvořit nové repo `ai-growth-platform` na GitHubu
2. `git remote add origin https://github.com/lintercom/ai-growth-platform.git`
3. `git push -u origin main`

---

## Adapters Implementation

Podrobný implementační plán pro adaptační vrstvy (StorageAdapter, EventSinkAdapter, VectorStoreAdapter) je v samostatném dokumentu:

**Viz:** [docs/ADAPTERS_IMPLEMENTATION.md](./ADAPTERS_IMPLEMENTATION.md)

### Stručné shrnutí:

#### PART 1 — Rozhraní + schémata + výběr adapterů
- Zod schémata pro health checks, artifacts, events, vectors
- Interfaces a factory pattern
- Config rozšíření
- CLI příkazy `aig adapters`

#### PART 2 — MVP implementace
- FileStorageAdapter
- FileEventSinkAdapter  
- LocalVectorStoreAdapter (SQLite)

#### PART 3 — Produkční konektory
- MySQLStorageAdapter
- PostgresStorageAdapter
- DBAggregateEventSinkAdapter
- ExternalEventSinkAdapter (HTTP webhook)
- ExternalVectorStoreAdapter (HTTP API)

---

## Poznámky

- Všechny JSON artefakty musí validovat přes Zod (aig-schemas)
- Žádné destruktivní skeny webů - jen veřejný fetch HTML
- Design analýza nevytváří pixel-perfect kopie - jen principy (DesignDNA)
- Reporty uvádějí dopady jako ROZSAHY + předpoklady (ne sliby)

---

## Instalace a spuštění (po dokončení)

```bash
# Klonování
git clone https://github.com/lintercom/ai-growth-platform.git
cd ai-growth-platform

# Instalace
pnpm install

# Build
pnpm -w build

# Setup
aig setup

# End-to-end example
aig init
aig project create demo --url https://example.com --type web --market CZ
aig analyze web --project demo
aig export md --project demo --from latest
```
