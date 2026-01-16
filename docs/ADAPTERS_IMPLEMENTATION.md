# Implementační plán - Adapter Layers

**Datum zahájení:** 2025-01-27  
**Cíl:** Implementace adaptačních vrstev pro Storage, EventSink a VectorStore

---

## Přehled

Tento dokument popisuje implementaci adaptačních vrstev (StorageAdapter, EventSinkAdapter, VectorStoreAdapter) pro platformu "AI Growth & Design Platform".

### Cíle

1. **StorageAdapter** - ukládání projektů, runů, artefaktů
   - File (default)
   - MySQL (produkce)
   - Postgres (produkce)

2. **EventSinkAdapter** - event tracking a agregace
   - none (default)
   - file (JSONL)
   - db-aggregate (agregace do DB)
   - external (HTTP webhook)

3. **VectorStoreAdapter** - vektorové vyhledávání
   - none (default)
   - local (SQLite)
   - external (HTTP API)

---

## PART 1 — Rozhraní + schémata + výběr adapterů (bez DB konektorů)

**Status:** ✅ Dokončeno  
**Cíl:** Základní rozhraní, schémata, factory pattern, config, CLI příkazy

### Úkoly

#### 1.1 Schémata (aig-schemas)
- [x] `StorageHealth`, `EventSinkHealth`, `VectorStoreHealth`
- [x] `Artifact` (common shape: type, schemaVersion, generatedAt, payload)
- [x] `UserEvent`, `EventAggregateQuery`, `EventAggregateResult`
- [x] `VectorDocument`, `VectorQuery`, `VectorQueryResult`

#### 1.2 Rozhraní a základní implementace (ai-toolkit-core)
- [x] Interfaces: `StorageAdapter`, `EventSinkAdapter`, `VectorStoreAdapter`
- [x] "None" implementace: `NoneEventSinkAdapter`, `NoneVectorStoreAdapter`
- [x] Factory: `AdapterFactory` s metodami pro vytváření adapterů
- [x] Placeholder implementace: `FileStorageAdapter`, `FileEventSinkAdapter`, `LocalVectorStoreAdapter` (hází chybu pro PART 2)

#### 1.3 Utils rozšíření (aig-utils)
- [x] `getAppConfigDir()` - cross-platform app config adresář
- [x] `appendJsonl()` - přidání do JSONL souboru
- [x] Path helpers: `getArtifactsDir()`, `getEventsDir()`

#### 1.4 Integrace do WorkflowContext
- [x] Adaptéry integrovány do workflow execution
- [x] Orchestrator používá adaptéry pro ukládání artefaktů

#### 1.5 Config rozšíření (aig-utils)
- [x] Config schema rozšíření:
  - `adapters.storage: 'file' | 'mysql' | 'postgres'`
  - `adapters.eventsink: 'none' | 'file' | 'db-aggregate' | 'external'`
  - `adapters.vectorstore: 'none' | 'local' | 'external'`
- [x] Defaulty: storage=file, eventsink=none, vectorstore=none
- [x] Nested config helpers: `getNestedConfigValue()`, `setNestedConfigValue()`

#### 1.6 CLI příkazy (aig-cli)
- [x] `aig adapters show` - zobrazí aktuální konfiguraci adapterů
- [x] `aig adapters set storage <type>`
- [x] `aig adapters set eventsink <type>`
- [x] `aig adapters set vectorstore <type>`

### Smoke test (PART 1)
```bash
pnpm -w build
aig doctor
aig adapters show
aig adapters set storage file
aig adapters set eventsink none
aig adapters set vectorstore none
```

### Status PART 1
- [x] Dokončeno
- [x] Smoke test prošel
- [x] Commit

### Implementované v PART 1
- ✅ Zod schémata pro health checks, artifacts, events, vectors
- ✅ Interfaces pro všechny tři typy adapterů
- ✅ None adaptéry (no-op implementace)
- ✅ AdapterFactory s factory pattern
- ✅ Config rozšíření s nested values support
- ✅ CLI příkazy `aig adapters show/set`
- ✅ Utils rozšíření (appendJsonl, path helpers)

**Poznámky:**
- Všechny adaptéry jsou plně funkční

---

## PART 2 — MVP implementace (FileStorage + FileEventSink + LocalVectorStore)

**Status:** ✅ Dokončeno  
**Cíl:** Funkční File adaptéry a LocalVectorStore

### Úkoly

#### 2.1 FileStorageAdapter
- [x] Struktura: `projects/<projectId>/meta.json`, `runs/<runId>/`
- [x] Metody: `init`, `healthCheck`, `loadProject`, `saveProject`
- [x] `createRun`, `listRuns`
- [x] `saveArtifact`, `loadArtifact`
- [x] `appendAuditLog`
- [x] Stub metody: `saveLead`, `saveOrder` (základní implementace)

#### 2.2 FileEventSinkAdapter
- [x] `emit()` / `emitBatch()` - zápis do JSONL: `projects/<projectId>/events/<YYYY-MM-DD>.jsonl`
- [x] `flush()` - no-op
- [x] `getAggregates()` - jednoduché agregace z JSONL (page_view count, event types)

#### 2.3 LocalVectorStoreAdapter
- [x] SQLite v `projects/<projectId>/vectors.sqlite`
- [x] Tabulka: `documents(id, text, metadata, embedding)`
- [x] Embeddings přes `OpenAIClient.embeddings()` (volitelné, může být null)
- [x] `query()` - cosine similarity (MVP - načte všechny docs a seřadí)
- [x] `upsert()`, `upsertBatch()`, `delete()`

#### 2.4 Workflow integrace
- [x] Analyze workflow: `saveArtifact()` pro Analysis, `emit()` pro "analysis_completed"
- [x] Cost report a audit log ukládání přes storage adapter
- [x] Validace přes Zod před uložením

### Smoke test (PART 2)
```bash
aig init
aig project create demo --url https://example.com --type web --market CZ
aig analyze web --project demo
# Zkontroluj vytvořený run folder a artefakty
aig export md --project demo
```

### Status PART 2
- [x] Dokončeno
- [x] Smoke test prošel (build úspěšný)
- [x] Commit

### Implementované v PART 2
- ✅ FileStorageAdapter - plně funkční pro ukládání projektů, runů a artefaktů
- ✅ FileEventSinkAdapter - JSONL event logging s agregacemi
- ✅ LocalVectorStoreAdapter - SQLite-based vector store s cosine similarity
- ✅ Integrace do analyze workflow - používá adaptéry místo přímých writeJsonFile
- ✅ Factory aktualizována pro předání OpenAIClient do vector store

**Poznámky:**
- FileStorageAdapter ukládá artefakty podle konvence (10_analysis.json, 60_cost_report.json)
- FileEventSinkAdapter seskupuje eventy podle projektu a data
- LocalVectorStoreAdapter vyžaduje OpenAIClient pro embeddings (volitelné, může být null)
- Analyze workflow nyní používá adaptéry - fallback na writeJsonFile při chybě

---

## PART 3 — Produkční konektory (MySQL/Postgres + db-aggregate + external placeholders)

**Status:** ✅ Dokončeno  
**Cíl:** DB adaptéry a external placeholders

### Úkoly

#### 3.1 MySQLStorageAdapter
- [x] Dependency: `mysql2`
- [x] Config: `adapters.mysql.url` nebo `host/user/pass/db`
- [x] Tabulky: `projects`, `runs`, `artifacts`, `audit_log`
- [x] Artefakty jako JSON (TEXT/JSON column)
- [x] Migrace: `packages/aig-workflows/migrations/mysql/001_initial.sql`

#### 3.2 PostgresStorageAdapter
- [x] Dependency: `pg` + `@types/pg`
- [x] Config: `adapters.postgres.url`
- [x] Tabulky: `projects`, `runs`, `artifacts`, `audit_log`
- [x] Artefakty jako JSONB
- [x] Migrace: `packages/aig-workflows/migrations/postgres/001_initial.sql`
- [x] Update triggers pro `updated_at`

#### 3.3 DBAggregateEventSinkAdapter
- [x] Agregace do DB: `daily_page_views`, `daily_funnel_steps`
- [x] `emit()`: mapuje eventType → agregace (increment)
- [x] Podpora MySQL i Postgres (automaticky podle storage adapteru)
- [x] Migrace pro MySQL i Postgres

#### 3.4 ExternalEventSinkAdapter
- [x] HTTP webhook placeholder
- [x] Config: `adapters.external.endpoint`, `adapters.external.apiKey` (optional)
- [x] `emit()`: POST JSON s retry/backoff (exponential, 3 pokusy)
- [x] Error handling s pending events queue
- [x] Redaction citlivých dat (password, apiKey, token, secret, key)

#### 3.5 ExternalVectorStoreAdapter
- [x] HTTP API placeholder
- [x] Config: `adapters.external.vectorEndpoint`
- [x] `upsert()`, `query()`, `delete()`: HTTP POST
- [x] Error handling s retry (exponential backoff)
- [x] Health check endpoint `/health`

#### 3.6 CLI config rozšíření
- [x] `aig config get <path>` - podpora nested paths (adapters.mysql.url)
- [x] `aig config set <path> <value>` - podpora nested paths
- [x] `aig config list` - zobrazení nested configu s maskováním citlivých hodnot
- [x] `aig doctor` - testování DB adapterů při zdravotní kontrole

### Smoke test (PART 3)
```bash
# Build
pnpm -r run build

# Test config commands
aig config set adapters.mysql.url "mysql://user:pass@host/db"
aig config get adapters.mysql.url
aig config list

# Test doctor (testuje DB connection když je nastavená)
aig doctor
```

### Status PART 3
- [x] Dokončeno
- [x] Smoke test prošel (build úspěšný)
- [x] Všechny adaptéry implementovány a připojeny do factory
- [x] Migrace SQL vytvořeny
- [x] CLI config rozšířen o nested paths

### Implementované v PART 3
- ✅ MySQLStorageAdapter - plně funkční s automatickými migracemi
- ✅ PostgresStorageAdapter - plně funkční s JSONB a update triggers
- ✅ DBAggregateEventSinkAdapter - agregace do DB pro MySQL/Postgres
- ✅ ExternalEventSinkAdapter - HTTP webhook s retry a redaction
- ✅ ExternalVectorStoreAdapter - HTTP API s retry a error handling
- ✅ CLI config rozšířen o nested paths (`aig config get/set <path>`)
- ✅ `aig doctor` testuje adaptery když jsou konfigurovány
- ✅ SQL migrace pro MySQL a Postgres

**Poznámky:**
- MySQLStorageAdapter podporuje connection string URL i individuální parametry
- PostgresStorageAdapter používá connection string URL
- DBAggregateEventSinkAdapter automaticky detekuje typ DB z storage adapteru
- External adaptéry mají retry mechanismus s exponential backoff
- Všechny adaptéry redactují citlivá data (passwords, API keys) před odesláním

---

## Důležité požadavky

- ✅ Všechny adaptery vrací smysluplné chyby (ne jen throw)
- ✅ API klíče se nikdy neukládají do artefaktů ani logů
- ✅ Redaction v loggeru pro citlivá data
- ✅ Názvy artefaktů podle konvence (00/10/20/30/40/50/60/70)
- ✅ Zod validace před uložením

---

## Dokumentace

Po dokončení aktualizovat:
- `docs/CLI.md` - příkazy `aig adapters ...`
- `docs/ARTIFACTS.md` - nové artefakt typy (events, vectors)

---

## Migrace z File → MySQL/Postgres

1. Nastavit config:
   ```bash
   aig config set adapters.storage mysql
   aig config set adapters.mysql.url "mysql://user:pass@host:3306/db"
   ```

2. Pro Postgres:
   ```bash
   aig config set adapters.storage postgres
   aig config set adapters.postgres.url "postgresql://user:pass@host:5432/db"
   ```

3. Spustit migrace (automaticky při prvním použití adaptéru)

### Příklady configů

**Hostinger MySQL:**
```json
{
  "adapters": {
    "storage": "mysql",
    "mysql": {
      "host": "your-db.hostinger.com",
      "port": 3306,
      "user": "u123456789",
      "password": "your-password",
      "database": "u123456789_main"
    }
  }
}
```

**Neon Postgres:**
```json
{
  "adapters": {
    "storage": "postgres",
    "postgres": {
      "url": "postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
    }
  }
}
```
