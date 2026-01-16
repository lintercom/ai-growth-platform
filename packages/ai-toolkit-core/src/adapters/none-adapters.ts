import type {
  EventSinkAdapter,
  VectorStoreAdapter,
} from './interfaces.js';
import type {
  EventSinkHealth,
  VectorStoreHealth,
  UserEvent,
  VectorQuery,
  VectorQueryResult,
} from '@aig/schemas';
import { EventSinkHealthSchema, VectorStoreHealthSchema } from '@aig/schemas';

/**
 * NoneEventSinkAdapter - no-op implementace
 */
export class NoneEventSinkAdapter implements EventSinkAdapter {
  async init(): Promise<void> {
    // No-op
  }

  async healthCheck(): Promise<EventSinkHealth> {
    return EventSinkHealthSchema.parse({
      status: 'healthy',
      message: 'None adapter (events disabled)',
      pendingEvents: 0,
    });
  }

  async emit(_event: UserEvent): Promise<void> {
    // No-op
  }

  async emitBatch(_events: UserEvent[]): Promise<void> {
    // No-op
  }

  async flush(): Promise<void> {
    // No-op
  }
}

/**
 * NoneVectorStoreAdapter - vrací prázdné výsledky
 */
export class NoneVectorStoreAdapter implements VectorStoreAdapter {
  async init(): Promise<void> {
    // No-op
  }

  async healthCheck(): Promise<VectorStoreHealth> {
    return VectorStoreHealthSchema.parse({
      status: 'healthy',
      message: 'None adapter (vector store disabled)',
      documentCount: 0,
    });
  }

  async upsert(_projectId: string, _document: unknown): Promise<void> {
    // No-op
  }

  async upsertBatch(_projectId: string, _documents: unknown[]): Promise<void> {
    // No-op
  }

  async query(_projectId: string, _query: VectorQuery): Promise<VectorQueryResult> {
    return {
      query: _query,
      results: [],
      totalFound: 0,
    };
  }

  async delete(_projectId: string, _documentId: string): Promise<void> {
    // No-op
  }
}
