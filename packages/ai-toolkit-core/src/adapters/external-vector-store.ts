import type { VectorStoreAdapter } from './interfaces.js';
import type { VectorStoreHealth, VectorDocument, VectorQuery, VectorQueryResult } from '@aig/schemas';
import { VectorStoreHealthSchema, VectorQueryResultSchema } from '@aig/schemas';
import type { AdapterConfig } from './factory.js';

/**
 * ExternalVectorStoreAdapter - HTTP API placeholder
 */
export class ExternalVectorStoreAdapter implements VectorStoreAdapter {
  private endpoint: string;
  private apiKey?: string;

  constructor(config?: AdapterConfig['external']) {
    if (!config?.vectorEndpoint) {
      throw new Error('External vector endpoint is required');
    }
    this.endpoint = config.vectorEndpoint;
    this.apiKey = config.apiKey;
  }

  async init(): Promise<void> {
    // No-op
  }

  async healthCheck(): Promise<VectorStoreHealth> {
    try {
      const response = await fetch(`${this.endpoint}/health`, {
        method: 'GET',
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(5000),
      });

      const data = await response.json() as { documentCount?: number };

      return VectorStoreHealthSchema.parse({
        status: response.ok ? 'healthy' : 'degraded',
        message: `External vector store responded with ${response.status}`,
        documentCount: data.documentCount,
      });
    } catch (error) {
      return VectorStoreHealthSchema.parse({
        status: 'unhealthy',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    return headers;
  }

  private async requestWithRetry<T>(
    path: string,
    method: string,
    body?: unknown,
    retries = 3
  ): Promise<T> {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const response = await fetch(`${this.endpoint}${path}`, {
          method,
          headers: this.getHeaders(),
          body: body ? JSON.stringify(body) : undefined,
          signal: AbortSignal.timeout(30000), // 30s timeout
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json() as T;
      } catch (error) {
        if (attempt === retries - 1) {
          throw error;
        }

        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    throw new Error('Request failed after retries');
  }

  async upsert(projectId: string, document: VectorDocument): Promise<void> {
    await this.upsertBatch(projectId, [document]);
  }

  async upsertBatch(projectId: string, documents: VectorDocument[]): Promise<void> {
    await this.requestWithRetry(
      '/upsert',
      'POST',
      {
        projectId,
        documents: documents.map(doc => ({
          ...doc,
          // Redact sensitive metadata
          metadata: this.redactSensitive(doc.metadata),
        })),
      }
    );
  }

  async query(projectId: string, query: VectorQuery): Promise<VectorQueryResult> {
    const response = await this.requestWithRetry<VectorQueryResult>(
      '/query',
      'POST',
      {
        projectId,
        query: {
          ...query,
          // Don't send full text if sensitive
          text: query.text.substring(0, 1000), // Limit length
        },
      }
    );

    return VectorQueryResultSchema.parse(response);
  }

  async delete(projectId: string, documentId: string): Promise<void> {
    await this.requestWithRetry(
      '/delete',
      'POST',
      { projectId, documentId }
    );
  }

  private redactSensitive(props: Record<string, unknown>): Record<string, unknown> {
    const redacted = { ...props };
    const sensitiveKeys = ['password', 'apiKey', 'token', 'secret', 'key'];

    for (const key of Object.keys(redacted)) {
      if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
        redacted[key] = '***REDACTED***';
      }
    }

    return redacted;
  }
}
