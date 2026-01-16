import type { VectorStoreAdapter } from './interfaces.js';
import type { VectorStoreHealth, VectorDocument, VectorQuery, VectorQueryResult } from '@aig/schemas';
import { VectorStoreHealthSchema, VectorQueryResultSchema } from '@aig/schemas';
import { getProjectDir, ensureDir } from '@aig/utils';
import { join } from 'node:path';
import Database from 'better-sqlite3';
import type { OpenAIClient } from '../client.js';

/**
 * LocalVectorStoreAdapter - SQLite-based vector store
 */
export class LocalVectorStoreAdapter implements VectorStoreAdapter {
  private db: Database.Database | null = null;
  private dbPath: string | null = null;
  private client: OpenAIClient | null = null;

  /**
   * Set OpenAI client for embeddings (volitelné, může být null)
   */
  setClient(client: OpenAIClient): void {
    this.client = client;
  }

  async init(): Promise<void> {
    // Database se otevře při prvním použití
  }

  private async ensureDb(projectId: string): Promise<Database.Database> {
    if (this.db && this.dbPath === this.getDbPath(projectId)) {
      return this.db;
    }

    // Close previous DB if exists
    if (this.db) {
      this.db.close();
    }

    const dbPath = this.getDbPath(projectId);
    const projectDir = getProjectDir(projectId);
    await ensureDir(projectDir);

    this.db = new Database(dbPath);
    this.dbPath = dbPath;

    // Create table if not exists
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        text TEXT NOT NULL,
        metadata TEXT NOT NULL,
        embedding TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE INDEX IF NOT EXISTS idx_created_at ON documents(created_at);
    `);

    return this.db;
  }

  private getDbPath(projectId: string): string {
    const projectDir = getProjectDir(projectId);
    return join(projectDir, 'vectors.sqlite');
  }

  async healthCheck(): Promise<VectorStoreHealth> {
    try {
      let documentCount = 0;
      
      if (this.db) {
        const stmt = this.db.prepare('SELECT COUNT(*) as count FROM documents');
        const result = stmt.get() as { count: number };
        documentCount = result.count;
      }

      return VectorStoreHealthSchema.parse({
        status: 'healthy',
        message: 'Local vector store ready',
        documentCount,
      });
    } catch (error) {
      return VectorStoreHealthSchema.parse({
        status: 'unhealthy',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  private async getEmbedding(text: string): Promise<number[]> {
    if (!this.client) {
      throw new Error('OpenAIClient not set. Call setClient() before using vector store.');
    }

    const response = await this.client.embeddings({
      model: 'text-embedding-ada-002',
      input: text,
    });

    const embedding = response.data[0]?.embedding;
    if (!embedding) {
      throw new Error('Failed to generate embedding');
    }

    return embedding;
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      return 0;
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator === 0 ? 0 : dotProduct / denominator;
  }

  async upsert(projectId: string, document: VectorDocument): Promise<void> {
    await this.upsertBatch(projectId, [document]);
  }

  async upsertBatch(projectId: string, documents: VectorDocument[]): Promise<void> {
    if (documents.length === 0) {
      return;
    }

    // Generate embeddings for documents that don't have them
    const documentsWithEmbeddings = await Promise.all(
      documents.map(async (doc) => {
        if (!doc.embedding || doc.embedding.length === 0) {
          if (!this.client) {
            throw new Error('OpenAIClient not set and embedding not provided. Call setClient() or provide embedding.');
          }
          const embedding = await this.getEmbedding(doc.text);
          return { ...doc, embedding };
        }
        return doc;
      })
    );

    const db = await this.ensureDb(projectId);
    const insertStmt = db.prepare(`
      INSERT OR REPLACE INTO documents (id, text, metadata, embedding)
      VALUES (?, ?, ?, ?)
    `);

    // SQLite transaction must be sync, so we prepare data before
    const insertMany = db.transaction((docs: VectorDocument[]) => {
      for (const doc of docs) {
        insertStmt.run(
          doc.id,
          doc.text,
          JSON.stringify(doc.metadata || {}),
          JSON.stringify(doc.embedding || [])
        );
      }
    });

    insertMany(documentsWithEmbeddings);
  }

  async query(projectId: string, query: VectorQuery): Promise<VectorQueryResult> {
    const db = await this.ensureDb(projectId);

    // Get query embedding
    const queryEmbedding = await this.getEmbedding(query.text);

    // Get all documents (MVP: simple approach, pro produkci by bylo potřeba indexování)
    const stmt = db.prepare('SELECT id, text, metadata, embedding FROM documents');
    const rows = stmt.all() as Array<{
      id: string;
      text: string;
      metadata: string;
      embedding: string;
    }>;

    // Calculate similarities
    const scored = rows.map(row => {
      const embedding = JSON.parse(row.embedding) as number[];
      const score = this.cosineSimilarity(queryEmbedding, embedding);
      
      return {
        document: {
          id: row.id,
          text: row.text,
          metadata: JSON.parse(row.metadata) as Record<string, unknown>,
          embedding,
        },
        score,
      };
    });

    // Filter by threshold if specified
    const filtered = query.threshold !== undefined
      ? scored.filter(item => item.score >= query.threshold!)
      : scored;

    // Sort by score descending
    filtered.sort((a, b) => b.score - a.score);

    // Take topK
    const topResults = filtered.slice(0, query.topK);

    return VectorQueryResultSchema.parse({
      query,
      results: topResults,
      totalFound: filtered.length,
    });
  }

  async delete(projectId: string, documentId: string): Promise<void> {
    const db = await this.ensureDb(projectId);
    const stmt = db.prepare('DELETE FROM documents WHERE id = ?');
    stmt.run(documentId);
  }
}
