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
- [ ] Rozšířit `WorkflowContext` o adaptéry (bude v PART 2, když budou funkční)
- [ ] Orchestrator: `init()` a `healthCheck()` (bude v PART 2)

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
- File adaptéry jsou placeholdery - budou implementovány v PART 2
- WorkflowContext integrace bude v PART 2, když budou adaptéry funkční

---

## PART 2 — MVP implementace (FileStorage + FileEventSink + LocalVectorStore)

**Status:** ⏳ Čeká na PART 1  
**Cíl:** Funkční File adaptéry a LocalVectorStore

### Úkoly

#### 2.1 FileStorageAdapter
- [ ] Struktura: `projects/<projectId>/project.json`, `runs/<runId>/`
- [ ] Metody: `init`, `healthCheck`, `loadProject`, `saveProject`
- [ ] `createRun`, `listRuns`
- [ ] `saveArtifact`, `loadArtifact`
- [ ] `appendAuditLog`
- [ ] Stub metody: `saveLead`, `saveOrder` (TODO pro budoucí rozšíření)

#### 2.2 FileEventSinkAdapter
- [ ] `emit()` / `emitBatch()` - zápis do JSONL: `projects/<projectId>/events/<YYYY-MM-DD>.jsonl`
- [ ] `flush()` - no-op
- [ ] `getAggregates()` - jednoduché agregace z JSONL (page_view count, funnel steps)

#### 2.3 LocalVectorStoreAdapter
- [ ] SQLite v `projects/<projectId>/vectors.sqlite`
- [ ] Tabulka: `documents(id, text, metadata, embedding)`
- [ ] Embeddings přes `OpenAIClient.embeddings()` (nebo stub s chybou)
- [ ] `query()` - cosine similarity (MVP omezeno na menší množství docs)
- [ ] `upsert()`, `upsertBatch()`, `delete()`

#### 2.4 Workflow integrace
- [ ] Analyze workflow: `saveArtifact()` pro AnalysisReport, `emit()` pro "analysis_completed"
- [ ] Design workflow: uložit DesignDNA
- [ ] Architect workflow: uložit blueprinty
- [ ] Export workflow: uložit report.md jako artifact
- [ ] Validace přes Zod před uložením

### Smoke test (PART 2)
```bash
aig init
aig project create demo --url https://example.com --type web --market CZ
aig analyze web --project demo
# Zkontroluj vytvořený run folder a artefakty
aig export md --project demo
```

### Status PART 2
- [ ] Dokončeno
- [ ] Smoke test prošel
- [ ] Commit

---

## PART 3 — Produkční konektory (MySQL/Postgres + db-aggregate + external placeholders)

**Status:** ⏳ Čeká na PART 2  
**Cíl:** DB adaptéry a external placeholders

### Úkoly

#### 3.1 MySQLStorageAdapter
- [ ] Dependency: `mysql2`
- [ ] Config: `adapters.mysql.url` nebo `host/user/pass/db`
- [ ] Tabulky: `projects`, `runs`, `artifacts`, `audit_log`
- [ ] Artefakty jako JSON (TEXT/JSON column)
- [ ] Migrace: `packages/aig-workflows/migrations/mysql/*.sql`

#### 3.2 PostgresStorageAdapter
- [ ] Dependency: `pg`
- [ ] Config: `adapters.postgres.url`
- [ ] Tabulky: `projects`, `runs`, `artifacts`, `audit_log`
- [ ] Artefakty jako JSONB
- [ ] Migrace: `packages/aig-workflows/migrations/postgres/*.sql`

#### 3.3 DBAggregateEventSinkAdapter
- [ ] Agregace do DB: `daily_page_views`, `daily_funnel_steps`
- [ ] `emit()`: mapuje eventType → agregace (increment)
- [ ] Migrace pro MySQL i Postgres

#### 3.4 ExternalEventSinkAdapter
- [ ] HTTP webhook placeholder
- [ ] Config: `adapters.external.endpoint`, `adapters.external.apiKey` (optional)
- [ ] `emit()`: POST JSON s retry/backoff (MVP simple)
- [ ] Error handling

#### 3.5 ExternalVectorStoreAdapter
- [ ] HTTP API placeholder
- [ ] Config: `adapters.external.vectorEndpoint`
- [ ] `upsert()`, `query()`: HTTP POST
- [ ] Error handling s retry

#### 3.6 CLI config
- [ ] `aig config set adapters.mysql.url "..."`  
- [ ] `aig config set adapters.postgres.url "..."`
- [ ] `aig config set adapters.external.endpoint "..."`

### Smoke test (PART 3)
```bash
# Dry-run režim
aig doctor --dry-run
# Test DB connection (když je nastavená)
aig doctor
```

### Status PART 3
- [ ] Dokončeno
- [ ] Smoke test prošel
- [ ] Commit

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

3. Spustit migrace (TODO: migrační script)

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
