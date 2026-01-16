# Implementační plán - AI Growth & Design Platform

**Datum zahájení:** 2025-01-27  
**Stav:** V přípravě

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
- [ ] Commit a push do repo

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

**Status:** ⏳ Čeká na PART 1  
**Cíl:** Plnohodnotný core toolkit pro práci s OpenAI API, budget management, audit logging, tool registry a orchestrator

### Úkoly

#### 2.1 OpenAI Client wrapper
- [ ] OpenAIClient třída (Responses API + embeddings)
- [ ] Retry logic a error handling
- [ ] Token counting utilities

#### 2.2 Agent framework
- [ ] Role-based agents (analyzer, architect, designer, strategist, general)
- [ ] Agent prompt templates
- [ ] Agent configuration

#### 2.3 Tool registry
- [ ] Web tools: `web.fetch`, `web.extract`
- [ ] Export helpers
- [ ] Tool execution framework

#### 2.4 Orchestrator
- [ ] Sekvenční workflow execution
- [ ] State management mezi kroky
- [ ] Error recovery

#### 2.5 Budget policy + cost report
- [ ] Budget tracking per run
- [ ] Cost calculation (input/output tokens, model costs)
- [ ] Budget enforcement (hard limits)
- [ ] Cost report generování (60_cost_report.json)

#### 2.6 Audit log
- [ ] Audit log framework
- [ ] Logging všech API calls
- [ ] Audit log generování (70_audit_log.json)

### Smoke test (PART 2)
```bash
# V core toolkit testu:
- Mini call na OpenAI přes OpenAIClient
- Validace outputu (struktura, tokeny, costs)
- Budget enforcement test
- Audit log záznam
```

### Status PART 2
- [ ] Dokončeno
- [ ] Smoke test prošel
- [ ] Commit a push do repo

---

## PART 3 — Workflows + CLI příkazy analyze/architect/export/chat

**Status:** ⏳ Čeká na PART 2  
**Cíl:** Kompletní workflows a CLI příkazy pro analyze/architect/export/chat

### Úkoly

#### 3.1 Workflows (v aig-workflows)
- [ ] `analyze.web` workflow
- [ ] `analyze.design` workflow
- [ ] `analyze.full` workflow
- [ ] `architect.system` workflow
- [ ] `architect.ui` workflow
- [ ] `architect.full` workflow
- [ ] `export.md` workflow
- [ ] `export.json` workflow (s bundle support)
- [ ] `chat.interactive` workflow

#### 3.2 Artefakty (aig-schemas)
- [ ] Zod schémata pro všechny artefakty:
  - 00_run_meta.json
  - 10_analysis.json
  - 11_analysis.md
  - 20_design_dna.json
  - 21_design_dna.md
  - 30_system_architecture.json
  - 33_implementation_plan.md
  - 40_ui_architecture.json
  - 50_report.md
  - 60_cost_report.json
  - 70_audit_log.json
  - bundle.json

#### 3.3 CLI příkazy (doplnění do aig-cli)
- [ ] `aig analyze web --project <name> [--url ...] [--mode fast|balanced|deep] [--budget <usd>]`
- [ ] `aig analyze design --project <name> --url <inspirationUrl>`
- [ ] `aig analyze full --project <name> --url ... --inspiration ...`
- [ ] `aig architect system --project <name> --from latest|<runId>`
- [ ] `aig architect ui --project <name> --from latest|<runId>`
- [ ] `aig architect full --project <name> --from latest|<runId>`
- [ ] `aig export md --project <name> --from latest|<runId>`
- [ ] `aig export json --project <name> --from latest|<runId> --bundle`
- [ ] `aig chat [--project <name>] [--agent general|analyzer|architect|designer|strategist] [--input <artifact.json>]`

#### 3.4 Artifact storage
- [ ] Ukládání do `projects/<project>/runs/<timestamp>/`
- [ ] Naming convention podle typu artefaktu
- [ ] Validace před uložením (Zod)

#### 3.5 Config commands
- [ ] `aig config get <key>`
- [ ] `aig config set <key> <value>`

### Smoke test (PART 3) - End-to-end flow
```bash
aig init
aig project create demo --url https://example.com --type web --market CZ
aig analyze web --project demo
aig export md --project demo --from latest
```

### Status PART 3
- [ ] Dokončeno
- [ ] Smoke test prošel
- [ ] Commit a push do repo

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
2. `git remote add origin https://github.com/<username>/ai-growth-platform.git`
3. `git push -u origin main`

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
git clone https://github.com/<username>/ai-growth-platform.git
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
