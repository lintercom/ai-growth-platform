import type { StorageAdapter } from './interfaces.js';
import type { StorageHealth, Artifact } from '@aig/schemas';

/**
 * FileStorageAdapter - bude plně implementován v PART 2
 * Pro PART 1 je to pouze placeholder, který hází chybu
 */
export class FileStorageAdapter implements StorageAdapter {
  async init(): Promise<void> {
    throw new Error('FileStorageAdapter not yet implemented (PART 2)');
  }

  async healthCheck(): Promise<StorageHealth> {
    throw new Error('FileStorageAdapter not yet implemented (PART 2)');
  }

  async loadProject(_projectId: string): Promise<Record<string, unknown>> {
    throw new Error('FileStorageAdapter not yet implemented (PART 2)');
  }

  async saveProject(_projectId: string, _data: Record<string, unknown>): Promise<void> {
    throw new Error('FileStorageAdapter not yet implemented (PART 2)');
  }

  async createRun(_projectId: string, _runId: string, _metadata: Record<string, unknown>): Promise<void> {
    throw new Error('FileStorageAdapter not yet implemented (PART 2)');
  }

  async listRuns(_projectId: string): Promise<string[]> {
    throw new Error('FileStorageAdapter not yet implemented (PART 2)');
  }

  async saveArtifact(_projectId: string, _runId: string, _artifactType: string, _artifact: Artifact): Promise<void> {
    throw new Error('FileStorageAdapter not yet implemented (PART 2)');
  }

  async loadArtifact(_projectId: string, _runId: string, _artifactType: string): Promise<Artifact | null> {
    throw new Error('FileStorageAdapter not yet implemented (PART 2)');
  }

  async appendAuditLog(_projectId: string, _runId: string, _entry: Record<string, unknown>): Promise<void> {
    throw new Error('FileStorageAdapter not yet implemented (PART 2)');
  }
}
