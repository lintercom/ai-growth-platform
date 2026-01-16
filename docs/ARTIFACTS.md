# Artefakty - Reference

Dokumentace formátů a struktury artefaktů generovaných platformou.

## Přehled

Všechny artefakty jsou uloženy v `projects/<project>/runs/<runId>/` a následují konvenci pojmenování podle typu:

- `00_run_meta.json` - Metadata runu
- `10_analysis.json` - Analýza webu
- `20_design_dna.json` - Design DNA
- `30_system_architecture.json` - Systémová architektura
- `40_ui_architecture.json` - UI architektura
- `50_report.md` - Markdown report (generovaný)
- `60_cost_report.json` - Cost tracking
- `70_audit_log.json` - Audit log

## Konvence pojmenování

Artefakty jsou pojmenovány podle předpony:

- `00-09` - Metadata a run informace
- `10-19` - Analýzy
- `20-29` - Design artefakty
- `30-39` - Architektura
- `40-49` - UI/UX artefakty
- `50-59` - Reporty a exporty
- `60-69` - Cost tracking a metriky
- `70-79` - Audit a logy

## Artefakty podle typu

### 00_run_meta.json

Metadata runu - obsahuje informace o spuštěném workflow.

```typescript
interface RunMeta {
  runId: string;
  projectName: string;
  workflowType: 'analyze' | 'architect' | 'export' | 'chat';
  workflowSubtype?: string; // např. 'web', 'design', 'system'
  startedAt: string; // ISO 8601
  completedAt?: string; // ISO 8601
  status: 'running' | 'completed' | 'failed';
  error?: string;
}
```

**Příklad:**
```json
{
  "runId": "1737976800000-abc123",
  "projectName": "demo",
  "workflowType": "analyze",
  "workflowSubtype": "web",
  "startedAt": "2025-01-27T10:00:00.000Z",
  "completedAt": "2025-01-27T10:05:30.000Z",
  "status": "completed"
}
```

---

### 10_analysis.json

Analýza webu - výsledky SEO, UX, performance a accessibility analýzy.

```typescript
interface Analysis {
  type: 'analysis';
  schemaVersion: '1.0.0';
  generatedAt: string; // ISO 8601
  payload: {
    summary: string;
    seo: {
      title?: string;
      metaDescription?: string;
      headings?: string[];
      issues: string[];
      recommendations: string[];
    };
    ux: {
      structure?: string;
      navigation?: string;
      issues: string[];
      recommendations: string[];
    };
    performance: {
      issues: string[];
      recommendations: string[];
    };
    accessibility: {
      issues: string[];
      recommendations: string[];
    };
  };
}
```

**Příklad:**
```json
{
  "type": "analysis",
  "schemaVersion": "1.0.0",
  "generatedAt": "2025-01-27T10:05:30.000Z",
  "payload": {
    "summary": "Web má dobré SEO základy, ale potřebuje optimalizaci performance...",
    "seo": {
      "title": "Example - Homepage",
      "metaDescription": "Example website description",
      "headings": ["H1: Welcome", "H2: Services", "H2: Contact"],
      "issues": ["Chybí alt texty na obrázcích"],
      "recommendations": ["Přidat meta description", "Optimalizovat nadpisy"]
    },
    "ux": {
      "structure": "Jednoduchá struktura s hlavní navigací",
      "navigation": "Hlavní menu v headeru",
      "issues": ["Chybí breadcrumbs"],
      "recommendations": ["Přidat breadcrumb navigaci"]
    },
    "performance": {
      "issues": ["Velké obrázky bez lazy loading"],
      "recommendations": ["Optimalizovat velikost obrázků", "Přidat lazy loading"]
    },
    "accessibility": {
      "issues": ["Chybí ARIA labely"],
      "recommendations": ["Přidat ARIA atributy"]
    }
  }
}
```

---

### 20_design_dna.json

Design DNA - principy a charakteristiky designu (bude implementováno).

```typescript
interface DesignDNA {
  type: 'design_dna';
  schemaVersion: '1.0.0';
  generatedAt: string;
  payload: {
    principles: string[];
    characteristics: {
      colors?: string[];
      typography?: string[];
      spacing?: string[];
      components?: string[];
    };
    recommendations: string[];
  };
}
```

---

### 30_system_architecture.json

Systémová architektura - blueprint systému (bude implementováno).

```typescript
interface SystemArchitecture {
  type: 'system_architecture';
  schemaVersion: '1.0.0';
  generatedAt: string;
  payload: {
    components: Array<{
      name: string;
      type: string;
      description: string;
      dependencies: string[];
    }>;
    dataFlow: string;
    recommendations: string[];
  };
}
```

---

### 40_ui_architecture.json

UI architektura - blueprint UI (bude implementováno).

```typescript
interface UIArchitecture {
  type: 'ui_architecture';
  schemaVersion: '1.0.0';
  generatedAt: string;
  payload: {
    components: Array<{
      name: string;
      type: string;
      props: Record<string, unknown>;
    }>;
    layout: string;
    recommendations: string[];
  };
}
```

---

### 50_report.md

Markdown report - generovaný report z analýzy (vytvořený exportem).

**Formát:**
- Obsahuje markdown strukturu
- Zahrnuje summary, issues, recommendations
- Generován z `10_analysis.json`

**Příklad:**
```markdown
# Analýza webu: https://example.com

**Datum:** 2025-01-27  
**Projekt:** demo  
**Run ID:** 1737976800000-abc123

## Shrnutí

Web má dobré SEO základy, ale potřebuje optimalizaci performance...

## SEO

### Issues
- Chybí alt texty na obrázcích

### Recommendations
- Přidat meta description
- Optimalizovat nadpisy

[... další sekce ...]
```

---

### 60_cost_report.json

Cost report - sledování nákladů OpenAI API calls.

```typescript
interface CostReport {
  type: 'cost_report';
  schemaVersion: '1.0.0';
  generatedAt: string;
  payload: {
    runId: string;
    totalCost: number; // USD
    budgetLimit?: number; // USD
    calls: Array<{
      timestamp: string;
      model: string;
      inputTokens: number;
      outputTokens: number;
      cost: number; // USD
    }>;
  };
}
```

**Příklad:**
```json
{
  "type": "cost_report",
  "schemaVersion": "1.0.0",
  "generatedAt": "2025-01-27T10:05:30.000Z",
  "payload": {
    "runId": "1737976800000-abc123",
    "totalCost": 0.0125,
    "budgetLimit": 2.0,
    "calls": [
      {
        "timestamp": "2025-01-27T10:00:15.000Z",
        "model": "gpt-4-turbo-preview",
        "inputTokens": 500,
        "outputTokens": 200,
        "cost": 0.0125
      }
    ]
  }
}
```

---

### 70_audit_log.json

Audit log - strukturovaný log všech operací.

```typescript
interface AuditLog {
  type: 'audit_log';
  schemaVersion: '1.0.0';
  generatedAt: string;
  payload: {
    runId: string;
    entries: Array<{
      timestamp: string;
      level: 'info' | 'warn' | 'error';
      action: string;
      details?: Record<string, unknown>;
    }>;
  };
}
```

**Příklad:**
```json
{
  "type": "audit_log",
  "schemaVersion": "1.0.0",
  "generatedAt": "2025-01-27T10:05:30.000Z",
  "payload": {
    "runId": "1737976800000-abc123",
    "entries": [
      {
        "timestamp": "2025-01-27T10:00:00.000Z",
        "level": "info",
        "action": "analyze_web_start",
        "details": {
          "url": "https://example.com",
          "mode": "balanced"
        }
      },
      {
        "timestamp": "2025-01-27T10:00:15.000Z",
        "level": "info",
        "action": "fetch_html_success",
        "details": {
          "url": "https://example.com"
        }
      },
      {
        "timestamp": "2025-01-27T10:05:30.000Z",
        "level": "info",
        "action": "analyze_web_completed",
        "details": {}
      }
    ]
  }
}
```

---

## Validace

Všechny JSON artefakty musí validovat přes Zod schémata v `packages/aig-schemas`.

**Validace při uložení:**
- Automatická validace před uložením do storage adapteru
- Chyba při nevalidním artefaktu

**Schémata:**
- `packages/aig-schemas/src/run-meta.ts` - RunMeta
- `packages/aig-schemas/src/analysis.ts` - Analysis
- `packages/aig-schemas/src/cost-report.ts` - CostReport
- `packages/aig-schemas/src/audit-log.ts` - AuditLog

---

## Storage adaptéry

### File Storage (default)

Artefakty jsou ukládány jako soubory v adresářové struktuře:

```
projects/
  <project>/
    meta.json
    runs/
      <runId>/
        00_run_meta.json
        10_analysis.json
        60_cost_report.json
        70_audit_log.json
```

### MySQL/Postgres Storage

Artefakty jsou ukládány do databáze:

- Tabulka `artifacts` obsahuje:
  - `id` - kombinace `<runId>-<artifactType>`
  - `project_id` - název projektu
  - `run_id` - ID runu
  - `artifact_type` - typ artefaktu (např. "10_analysis")
  - `artifact_data` - JSON/JSONB data artefaktu

---

## Příklady použití

### Načtení artefaktu

```typescript
import { readJsonFile } from '@aig/utils';
import { getRunDir } from '@aig/utils';

const runDir = getRunDir('demo', '1737976800000-abc123');
const analysis = await readJsonFile(`${runDir}/10_analysis.json`);
```

### Validace artefaktu

```typescript
import { AnalysisSchema } from '@aig/schemas';

const data = await readJsonFile('10_analysis.json');
const analysis = AnalysisSchema.parse(data); // throws pokud nevalidní
```

### Export artefaktů

```bash
# Export jako Markdown
aig export md --project demo --from latest

# Artefakty jsou v projects/demo/runs/<runId>/
```

---

## Poznámky

- **Citlivá data:** API klíče se nikdy neukládají do artefaktů ani logů
- **Formát:** Všechny timestampy jsou v ISO 8601 formátu
- **Versioning:** Artefakty obsahují `schemaVersion` pro budoucí migrace
- **Redundance:** RunMeta obsahuje základní informace pro rychlý přístup
