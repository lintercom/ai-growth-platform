import type {
  StorageAdapter,
  EventSinkAdapter,
  VectorStoreAdapter,
} from './interfaces.js';
import { NoneEventSinkAdapter, NoneVectorStoreAdapter } from './none-adapters.js';

export type StorageAdapterType = 'file' | 'mysql' | 'postgres';
export type EventSinkAdapterType = 'none' | 'file' | 'db-aggregate' | 'external';
export type VectorStoreAdapterType = 'none' | 'local' | 'external';

export interface AdapterConfig {
  storage?: StorageAdapterType;
  eventsink?: EventSinkAdapterType;
  vectorstore?: VectorStoreAdapterType;
  // Storage configs
  mysql?: {
    url?: string;
    host?: string;
    port?: number;
    user?: string;
    password?: string;
    database?: string;
  };
  postgres?: {
    url?: string;
  };
  // External configs
  external?: {
    endpoint?: string;
    apiKey?: string;
    vectorEndpoint?: string;
  };
}

/**
 * Factory pro vytváření adapterů
 */
export class AdapterFactory {
  /**
   * Vytvoří StorageAdapter
   */
  static async createStorageAdapter(
    config: AdapterConfig
  ): Promise<StorageAdapter> {
    const type = config.storage || 'file';

    switch (type) {
      case 'file':
        const { FileStorageAdapter } = await import('./file-storage.js');
        return new FileStorageAdapter();
      case 'mysql':
        const { MySQLStorageAdapter } = await import('./mysql-storage.js');
        return new MySQLStorageAdapter(config.mysql);
      case 'postgres':
        const { PostgresStorageAdapter } = await import('./postgres-storage.js');
        return new PostgresStorageAdapter(config.postgres);
      default:
        throw new Error(`Unknown storage adapter type: ${type}`);
    }
  }

  /**
   * Vytvoří EventSinkAdapter
   */
  static async createEventSinkAdapter(
    config: AdapterConfig
  ): Promise<EventSinkAdapter> {
    const type = config.eventsink || 'none';

    switch (type) {
      case 'none':
        return new NoneEventSinkAdapter();
      case 'file':
        const { FileEventSinkAdapter } = await import('./file-event-sink.js');
        return new FileEventSinkAdapter();
      case 'db-aggregate':
        const { DBAggregateEventSinkAdapter } = await import('./db-aggregate-event-sink.js');
        return new DBAggregateEventSinkAdapter(config);
      case 'external':
        const { ExternalEventSinkAdapter } = await import('./external-event-sink.js');
        return new ExternalEventSinkAdapter(config.external);
      default:
        throw new Error(`Unknown event sink adapter type: ${type}`);
    }
  }

  /**
   * Vytvoří VectorStoreAdapter
   */
  static async createVectorStoreAdapter(
    config: AdapterConfig,
    client?: import('../client.js').OpenAIClient
  ): Promise<VectorStoreAdapter> {
    const type = config.vectorstore || 'none';

    switch (type) {
      case 'none':
        return new NoneVectorStoreAdapter();
      case 'local':
        const { LocalVectorStoreAdapter } = await import('./local-vector-store.js');
        const adapter = new LocalVectorStoreAdapter();
        if (client) {
          adapter.setClient(client);
        }
        return adapter;
      case 'external':
        const { ExternalVectorStoreAdapter } = await import('./external-vector-store.js');
        return new ExternalVectorStoreAdapter(config.external);
      default:
        throw new Error(`Unknown vector store adapter type: ${type}`);
    }
  }
}
