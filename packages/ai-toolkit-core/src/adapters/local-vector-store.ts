import type { VectorStoreAdapter } from './interfaces.js';
import type { VectorStoreHealth, VectorDocument, VectorQuery, VectorQueryResult } from '@aig/schemas';

/**
 * LocalVectorStoreAdapter - bude plně implementován v PART 2
 * Pro PART 1 je to pouze placeholder, který hází chybu
 */
export class LocalVectorStoreAdapter implements VectorStoreAdapter {
  async init(): Promise<void> {
    throw new Error('LocalVectorStoreAdapter not yet implemented (PART 2)');
  }

  async healthCheck(): Promise<VectorStoreHealth> {
    throw new Error('LocalVectorStoreAdapter not yet implemented (PART 2)');
  }

  async upsert(_projectId: string, _document: VectorDocument): Promise<void> {
    throw new Error('LocalVectorStoreAdapter not yet implemented (PART 2)');
  }

  async upsertBatch(_projectId: string, _documents: VectorDocument[]): Promise<void> {
    throw new Error('LocalVectorStoreAdapter not yet implemented (PART 2)');
  }

  async query(_projectId: string, _query: VectorQuery): Promise<VectorQueryResult> {
    throw new Error('LocalVectorStoreAdapter not yet implemented (PART 2)');
  }

  async delete(_projectId: string, _documentId: string): Promise<void> {
    throw new Error('LocalVectorStoreAdapter not yet implemented (PART 2)');
  }
}
