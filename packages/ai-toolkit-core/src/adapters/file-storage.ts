import type { StorageAdapter } from './interfaces.js';
import type { StorageHealth as StorageHealthType, Artifact } from '@aig/schemas';
import { StorageHealthSchema } from '@aig/schemas';
import { 
  getProjectDir, 
  getProjectsDir,
  getRunDir, 
  getRunsDir, 
  ensureDir, 
  writeJsonFile, 
  readJsonFile, 
  fileExists, 
  dirExists,
  appendJsonl,
} from '@aig/utils';

/**
 * FileStorageAdapter - ukládání projektů, runů, artefaktů na disk
 */
export class FileStorageAdapter implements StorageAdapter {
  async init(): Promise<void> {
    // Zajistíme, že projects adresář existuje
    const projectsDir = getProjectsDir();
    await ensureDir(projectsDir);
  }

  async healthCheck(): Promise<StorageHealthType> {
    try {
      const projectsDir = getProjectsDir();
      
      // Kontrola jestli můžeme vytvořit/číst projects adresář
      if (!dirExists(projectsDir)) {
        await ensureDir(projectsDir);
      }

      return StorageHealthSchema.parse({
        status: 'healthy',
        message: 'File storage accessible',
        details: {
          projectsDir: projectsDir,
          writable: true,
        },
      });
    } catch (error) {
      return StorageHealthSchema.parse({
        status: 'unhealthy',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async loadProject(projectId: string): Promise<Record<string, unknown>> {
    const projectDir = getProjectDir(projectId);
    const metaPath = `${projectDir}/meta.json`;

    if (!fileExists(metaPath)) {
      throw new Error(`Project ${projectId} not found`);
    }

    return readJsonFile<Record<string, unknown>>(metaPath);
  }

  async saveProject(projectId: string, data: Record<string, unknown>): Promise<void> {
    const projectDir = getProjectDir(projectId);
    await ensureDir(projectDir);
    
    const metaPath = `${projectDir}/meta.json`;
    await writeJsonFile(metaPath, data);
  }

  async createRun(projectId: string, runId: string, metadata: Record<string, unknown>): Promise<void> {
    const runDir = getRunDir(projectId, runId);
    await ensureDir(runDir);

    // Uložíme run metadata jako 00_run_meta.json
    const metaPath = `${runDir}/00_run_meta.json`;
    await writeJsonFile(metaPath, metadata);
  }

  async listRuns(projectId: string): Promise<string[]> {
    const runsDir = getRunsDir(projectId);
    
    if (!dirExists(runsDir)) {
      return [];
    }

    const { readdir } = await import('node:fs/promises');
    const entries = await readdir(runsDir, { withFileTypes: true });
    
    // Vrátíme jen adresáře (runy)
    return entries
      .filter(entry => entry.isDirectory())
      .map(entry => entry.name);
  }

  async saveArtifact(
    projectId: string,
    runId: string,
    artifactType: string,
    artifact: Artifact
  ): Promise<void> {
    const runDir = getRunDir(projectId, runId);
    await ensureDir(runDir);

    // Artifact naming: prefix_number_artifactType.json
    // Pro existující konvenci: 10_analysis.json, 20_design_dna.json atd.
    // Pokud artifactType už obsahuje prefix, použijeme ho, jinak použijeme výchozí
    const filename = artifactType.includes('_') 
      ? `${artifactType}.json`
      : `${artifactType}.json`;
    
    const artifactPath = `${runDir}/${filename}`;
    await writeJsonFile(artifactPath, artifact);
  }

  async loadArtifact(
    projectId: string,
    runId: string,
    artifactType: string
  ): Promise<Artifact | null> {
    const runDir = getRunDir(projectId, runId);
    
    const filename = artifactType.includes('.json') 
      ? artifactType 
      : `${artifactType}.json`;
    
    const artifactPath = `${runDir}/${filename}`;

    if (!fileExists(artifactPath)) {
      return null;
    }

    return readJsonFile<Artifact>(artifactPath);
  }

  async appendAuditLog(
    projectId: string,
    runId: string,
    entry: Record<string, unknown>
  ): Promise<void> {
    const runDir = getRunDir(projectId, runId);
    await ensureDir(runDir);

    // Audit log jako JSONL v 70_audit_log.jsonl (doplňující k JSON)
    const logPath = `${runDir}/70_audit_log.jsonl`;
    await appendJsonl(logPath, {
      ...entry,
      timestamp: new Date().toISOString(),
    });
  }

  async saveLead?(projectId: string, lead: Record<string, unknown>): Promise<void> {
    // TODO: Implementovat v budoucím rozšíření
    // Mělo by ukládat lead do leads/ adresáře v projektu
    const projectDir = getProjectDir(projectId);
    await ensureDir(`${projectDir}/leads`);
    
    const leadId = lead.id as string || `lead-${Date.now()}`;
    const leadPath = `${projectDir}/leads/${leadId}.json`;
    await writeJsonFile(leadPath, {
      ...lead,
      createdAt: new Date().toISOString(),
    });
  }

  async saveOrder?(projectId: string, order: Record<string, unknown>): Promise<void> {
    // TODO: Implementovat v budoucím rozšíření
    // Mělo by ukládat order do orders/ adresáře v projektu
    const projectDir = getProjectDir(projectId);
    await ensureDir(`${projectDir}/orders`);
    
    const orderId = order.id as string || `order-${Date.now()}`;
    const orderPath = `${projectDir}/orders/${orderId}.json`;
    await writeJsonFile(orderPath, {
      ...order,
      createdAt: new Date().toISOString(),
    });
  }
}
