# CLI Reference - AI Growth Platform

Kompletní referenční dokumentace pro všechny CLI příkazy.

## Obsah

- [Setup & Config](#setup--config)
- [Projekty](#projekty)
- [Analýza](#analýza)
- [Export](#export)
- [Adaptéry](#adaptéry)

---

## Setup & Config

### `aig setup`

Nastavení OpenAI API klíče a ověření konfigurace.

```bash
aig setup
```

**Chování:**
- Vyžádá `OPENAI_API_KEY` interaktivně (nebo použije `OPENAI_API_KEY` environment variable)
- Uloží klíč do konfigurace (`~/.config/aig/config.json` nebo `%APPDATA%/aig/config.json`)
- Ověří klíč levným requestem na OpenAI API

**Příklad:**
```bash
$ aig setup
🔑 Nastavení OpenAI API klíče...
Zadejte OpenAI API klíč (nebo stiskněte Enter pro použití env var): sk-...
⏳ Ověřování API klíče...
✓ OpenAI API klíč je platný a uložen
```

---

### `aig doctor`

Kontrola prostředí, konfigurace a zdraví adapterů.

```bash
aig doctor
```

**Zobrazí:**
- Node.js verzi (vyžadováno >= 18)
- Config adresář a soubor
- Validitu OpenAI API klíče
- Projekty adresář
- Zdraví DB adapterů (pokud jsou konfigurovány)

**Příklad výstupu:**
```
🔍 AI Growth Platform - Doctor

✓ Node.js v20.11.0
✓ Config adresář: C:\Users\573\AppData\Roaming\aig
✓ Config soubor načten
⏳ Ověřování API klíče...
✓ OpenAI API klíč je platný
✓ Projekty adresář: C:\Users\573\Desktop\SEO\AI\projects

🔌 Testování adapterů...
⏳ Testování storage adapteru: mysql...
✓ Storage adapter (mysql) je zdravý

✓ Vše v pořádku!
```

---

### `aig config`

Správa konfigurace.

#### `aig config get <key>`

Zobrazí hodnotu jednoduchého konfiguračního klíče.

```bash
aig config get openaiApiKey
aig config get defaultMarket
aig config get defaultBudget
```

#### `aig config get <path>`

Zobrazí hodnotu nested konfiguračního klíče.

```bash
aig config get adapters.storage
aig config get adapters.mysql.url
aig config get adapters.postgres.url
```

**Poznámka:** Citlivé hodnoty (API klíče, passwords, URLs) jsou automaticky maskovány.

#### `aig config set <key> <value>`

Nastaví hodnotu jednoduchého konfiguračního klíče.

```bash
aig config set defaultMarket CZ
aig config set defaultBudget 5.0
```

#### `aig config set <path> <value>`

Nastaví hodnotu nested konfiguračního klíče.

```bash
aig config set adapters.storage mysql
aig config set adapters.mysql.url "mysql://user:pass@host:3306/db"
```

**Poznámka:** Hodnoty jsou automaticky parsovány jako JSON, pokud to je možné.

#### `aig config list`

Zobrazí všechny konfigurační hodnoty.

```bash
aig config list
```

**Příklad výstupu:**
```
Konfigurace:
  openaiApiKey: sk-...abcd
  defaultMarket: CZ
  defaultBudget: 5
  adapters:
    storage: mysql
    eventsink: file
    vectorstore: local
    mysql:
      url: mysql://...abcd
```

---

## Projekty

### `aig init`

Inicializace lokálního workspace.

```bash
aig init
```

**Chování:**
- Vytvoří `projects/` adresář v aktuálním adresáři
- Připraví strukturu pro ukládání projektů a runů

---

### `aig project create <name>`

Vytvoří nový projekt.

```bash
aig project create <name> [--url <url>] [--type web|ecommerce] [--market <market>]
```

**Parametry:**
- `<name>` - Název projektu (povinný)
- `--url <url>` - URL projektu (volitelné)
- `--type <type>` - Typ projektu: `web` nebo `ecommerce` (default: `web`)
- `--market <market>` - Trh (např. `CZ`, `SK`) (default: `CZ`)

**Příklad:**
```bash
aig project create my-website --url https://mywebsite.com --type web --market CZ
```

**Vytvoří:**
- `projects/my-website/meta.json` - metadata projektu
- `projects/my-website/runs/` - adresář pro runy

---

### `aig project list`

Zobrazí seznam všech projektů.

```bash
aig project list
```

**Příklad výstupu:**
```
Projekty:

  demo (web) - CZ
    URL: https://example.com
  my-website (ecommerce) - CZ
    URL: https://mywebsite.com
```

---

### `aig project show <name>`

Zobrazí detaily projektu.

```bash
aig project show <name>
```

**Příklad výstupu:**
```
📁 Projekt: demo

  Typ: web
  Trh: CZ
  URL: https://example.com
  Vytvořen: 2025-01-27T10:00:00.000Z
  Počet runů: 3
```

---

## Analýza

### `aig analyze web`

Analyzuje web z hlediska SEO, UX, performance a accessibility.

```bash
aig analyze web --project <name> [--url <url>] [--mode fast|balanced|deep] [--budget <usd>]
```

**Parametry:**
- `--project <name>` - Název projektu (povinný)
- `--url <url>` - URL k analýze (pokud se liší od projektu)
- `--mode <mode>` - Režim analýzy:
  - `fast` - gpt-3.5-turbo, rychlejší, levnější
  - `balanced` - gpt-4-turbo-preview, vyvážený (default)
  - `deep` - gpt-4-turbo-preview, hlubší analýza s více tokeny
- `--budget <usd>` - Budget limit v USD (volitelné)

**Příklad:**
```bash
aig analyze web --project demo --mode balanced --budget 2.0
```

**Vytvoří:**
- `projects/<project>/runs/<runId>/00_run_meta.json` - metadata runu
- `projects/<project>/runs/<runId>/10_analysis.json` - výsledky analýzy
- `projects/<project>/runs/<runId>/60_cost_report.json` - cost tracking
- `projects/<project>/runs/<runId>/70_audit_log.json` - audit log

---

## Export

### `aig export md`

Exportuje výsledky analýzy jako Markdown.

```bash
aig export md --project <name> [--from latest|<runId>]
```

**Parametry:**
- `--project <name>` - Název projektu (povinný)
- `--from <source>` - Zdroj dat:
  - `latest` - poslední run (default)
  - `<runId>` - konkrétní run ID

**Příklad:**
```bash
aig export md --project demo --from latest
```

**Vytvoří:**
- `projects/<project>/runs/<runId>/50_report.md` - Markdown report

---

## Adaptéry

### `aig adapters show`

Zobrazí aktuální konfiguraci adapterů.

```bash
aig adapters show
```

**Příklad výstupu:**
```
Konfigurace adapterů:

  Storage: file (default)
  EventSink: none (default)
  VectorStore: none (default)
```

---

### `aig adapters set storage <type>`

Nastaví storage adapter.

```bash
aig adapters set storage <file|mysql|postgres>
```

**Typy:**
- `file` - ukládání do souborů (default)
- `mysql` - MySQL databáze
- `postgres` - PostgreSQL databáze

**Příklad:**
```bash
aig adapters set storage mysql
```

**Poznámka:** Pro MySQL/Postgres je potřeba nastavit connection string přes `aig config set adapters.mysql.url` nebo `aig config set adapters.postgres.url`.

---

### `aig adapters set eventsink <type>`

Nastaví event sink adapter.

```bash
aig adapters set eventsink <none|file|db-aggregate|external>
```

**Typy:**
- `none` - žádné eventy (default)
- `file` - ukládání do JSONL souborů
- `db-aggregate` - agregace do DB (vyžaduje MySQL/Postgres storage)
- `external` - HTTP webhook

**Příklad:**
```bash
aig adapters set eventsink file
```

---

### `aig adapters set vectorstore <type>`

Nastaví vector store adapter.

```bash
aig adapters set vectorstore <none|local|external>
```

**Typy:**
- `none` - žádné vektorové ukládání (default)
- `local` - lokální SQLite databáze
- `external` - externí HTTP API

**Příklad:**
```bash
aig adapters set vectorstore local
```

---

## Příklad end-to-end workflow

```bash
# 1. Setup
aig setup

# 2. Inicializace
aig init

# 3. Vytvoření projektu
aig project create demo --url https://example.com --type web --market CZ

# 4. Analýza
aig analyze web --project demo --mode balanced --budget 2.0

# 5. Export
aig export md --project demo --from latest

# 6. Kontrola
aig doctor
```

---

## Konfigurace adaptérů pro produkci

### MySQL (Hostinger)

```bash
aig adapters set storage mysql
aig config set adapters.mysql.host "your-db.hostinger.com"
aig config set adapters.mysql.port 3306
aig config set adapters.mysql.user "u123456789"
aig config set adapters.mysql.password "your-password"
aig config set adapters.mysql.database "u123456789_main"
```

### PostgreSQL (Neon)

```bash
aig adapters set storage postgres
aig config set adapters.postgres.url "postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

### External Event Sink

```bash
aig adapters set eventsink external
aig config set adapters.external.endpoint "https://your-webhook.com/events"
aig config set adapters.external.apiKey "your-api-key"
```

---

## Troubleshooting

### Chyba: "OpenAI API klíč není nastaven"

```bash
aig setup
```

### Chyba: "Projekt neexistuje"

```bash
aig project list  # zkontroluj dostupné projekty
aig project create <name> --url <url> --type web --market CZ
```

### Chyba: "Budget překročen"

Zvyšte budget limit nebo použijte `--mode fast`:

```bash
aig analyze web --project demo --mode fast --budget 5.0
```

### Testování DB připojení

```bash
aig doctor  # automaticky testuje DB adaptery
```
