# Použití AI Growth Platform

## Instalace

```bash
# Klonování
git clone <repository-url>
cd ai-growth-platform

# Instalace závislostí
pnpm install

# Build
pnpm -r run build
```

## První spuštění

### 1. Setup

```bash
# Nastavení OpenAI API klíče
aig setup
```

Nebo můžete použít environment variable:
```bash
export OPENAI_API_KEY=sk-...
```

### 2. Inicializace workspace

```bash
aig init
```

### 3. Vytvoření projektu

```bash
aig project create demo --url https://example.com --type web --market CZ
```

### 4. Analýza webu

```bash
# Rychlá analýza (gpt-3.5-turbo)
aig analyze web --project demo --mode fast

# Vyvážená analýza (gpt-4-turbo-preview, default)
aig analyze web --project demo --mode balanced

# Hluboká analýza (gpt-4-turbo-preview, více tokenů)
aig analyze web --project demo --mode deep

# S budget limitem
aig analyze web --project demo --budget 1.0
```

### 5. Export výsledků

```bash
# Export posledního runu jako Markdown
aig export md --project demo --from latest

# Export konkrétního runu
aig export md --project demo --from 1234567890-abcdefgh
```

## Příkazy

### Config & Setup
- `aig setup` - Nastavení API klíčů
- `aig doctor` - Kontrola prostředí (včetně testování adapterů)
- `aig config get <key>` - Zobrazí config hodnotu
- `aig config set <key> <value>` - Nastaví config hodnotu
- `aig config get <path>` - Zobrazí nested config hodnotu (např. `adapters.mysql.url`)
- `aig config set <path> <value>` - Nastaví nested config hodnotu
- `aig config list` - Zobrazí všechny config hodnoty

### Adaptéry
- `aig adapters show` - Zobrazí aktuální konfiguraci adapterů
- `aig adapters set storage <file|mysql|postgres>` - Nastaví storage adapter
- `aig adapters set eventsink <none|file|db-aggregate|external>` - Nastaví event sink adapter
- `aig adapters set vectorstore <none|local|external>` - Nastaví vector store adapter

### Projekty
- `aig init` - Inicializace workspace
- `aig project create <name> --url <url> --type web|ecommerce --market <market>` - Vytvoří projekt
- `aig project list` - Seznam projektů
- `aig project show <name>` - Detaily projektu

### Analýza
- `aig analyze web --project <name> [--url <url>] [--mode fast|balanced|deep] [--budget <usd>]` - Analýza webu

### Export
- `aig export md --project <name> [--from latest|<runId>]` - Export jako Markdown

## Struktura artefaktů

Všechny runy se ukládají do `projects/<project>/runs/<runId>/`:

```
projects/
  demo/
    runs/
      1234567890-abcdefgh/
        00_run_meta.json      # Metadata runu
        10_analysis.json       # Analýza webu
        50_report.md           # Markdown report (po exportu)
        60_cost_report.json    # Cost tracking
        70_audit_log.json      # Audit log
```

## Budget management

Budget se kontroluje automaticky před každým API call. Pokud je překročen, workflow se zastaví.

```bash
# Nastavení defaultního budgetu v configu
aig config set defaultBudget 5.0

# Nebo přímo při analýze
aig analyze web --project demo --budget 1.0
```

## Příklady

### End-to-end flow

```bash
# 1. Setup
aig setup

# 2. Init
aig init

# 3. Vytvoř projekt
aig project create my-website --url https://mywebsite.com --type web --market CZ

# 4. Analyzuj
aig analyze web --project my-website --mode balanced --budget 2.0

# 5. Exportuj
aig export md --project my-website --from latest
```

### Kontrola prostředí

```bash
aig doctor
```

Zobrazí:
- Node.js verzi
- Config adresář
- OpenAI API klíč (validace)
- Projekty adresář
