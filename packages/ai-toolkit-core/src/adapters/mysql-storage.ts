import type { StorageAdapter } from './interfaces.js';
import type { StorageHealth as StorageHealthType, Artifact } from '@aig/schemas';
import { StorageHealthSchema } from '@aig/schemas';
import type { AdapterConfig } from './factory.js';
import mysql from 'mysql2/promise';

/**
 * MySQLStorageAdapter - ukládání do MySQL databáze
 */
export class MySQLStorageAdapter implements StorageAdapter {
  private pool: mysql.Pool | null = null;
  private config: AdapterConfig['mysql'];

  constructor(config?: AdapterConfig['mysql']) {
    this.config = config;
  }

  async init(): Promise<void> {
    if (!this.config) {
      throw new Error('MySQL config is required');
    }

    const poolConfig: mysql.PoolOptions = this.config.url
      ? { uri: this.config.url }
      : {
          host: this.config.host || 'localhost',
          port: this.config.port || 3306,
          user: this.config.user,
          password: this.config.password,
          database: this.config.database,
        };

    this.pool = mysql.createPool(poolConfig);

    // Run migrations
    await this.runMigrations();
  }

  private async runMigrations(): Promise<void> {
    if (!this.pool) {
      throw new Error('Pool not initialized');
    }

    await this.pool.execute(`
      CREATE TABLE IF NOT EXISTS projects (
        id VARCHAR(255) PRIMARY KEY,
        data JSON NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      CREATE TABLE IF NOT EXISTS runs (
        id VARCHAR(255) PRIMARY KEY,
        project_id VARCHAR(255) NOT NULL,
        metadata JSON NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_project_id (project_id),
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      CREATE TABLE IF NOT EXISTS artifacts (
        id VARCHAR(255) PRIMARY KEY,
        project_id VARCHAR(255) NOT NULL,
        run_id VARCHAR(255) NOT NULL,
        artifact_type VARCHAR(255) NOT NULL,
        artifact_data JSON NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_project_run (project_id, run_id),
        INDEX idx_type (artifact_type),
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      CREATE TABLE IF NOT EXISTS audit_log (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        project_id VARCHAR(255) NOT NULL,
        run_id VARCHAR(255) NOT NULL,
        entry_data JSON NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_project_run (project_id, run_id),
        INDEX idx_created_at (created_at),
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  }

  async healthCheck(): Promise<StorageHealthType> {
    try {
      if (!this.pool) {
        throw new Error('Pool not initialized');
      }

      await this.pool.execute('SELECT 1');
      
      return StorageHealthSchema.parse({
        status: 'healthy',
        message: 'MySQL connection OK',
        details: {
          host: this.config?.host || 'from URL',
          database: this.config?.database || 'from URL',
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
    if (!this.pool) {
      throw new Error('Pool not initialized');
    }

    const [rows] = await this.pool.execute<mysql.RowDataPacket[]>(
      'SELECT data FROM projects WHERE id = ?',
      [projectId]
    );

    if (rows.length === 0) {
      throw new Error(`Project ${projectId} not found`);
    }

    return rows[0]!.data as Record<string, unknown>;
  }

  async saveProject(projectId: string, data: Record<string, unknown>): Promise<void> {
    if (!this.pool) {
      throw new Error('Pool not initialized');
    }

    await this.pool.execute(
      'INSERT INTO projects (id, data) VALUES (?, ?) ON DUPLICATE KEY UPDATE data = ?, updated_at = CURRENT_TIMESTAMP',
      [projectId, JSON.stringify(data), JSON.stringify(data)]
    );
  }

  async createRun(projectId: string, runId: string, metadata: Record<string, unknown>): Promise<void> {
    if (!this.pool) {
      throw new Error('Pool not initialized');
    }

    await this.pool.execute(
      'INSERT INTO runs (id, project_id, metadata) VALUES (?, ?, ?)',
      [runId, projectId, JSON.stringify(metadata)]
    );
  }

  async listRuns(projectId: string): Promise<string[]> {
    if (!this.pool) {
      throw new Error('Pool not initialized');
    }

    const [rows] = await this.pool.execute<mysql.RowDataPacket[]>(
      'SELECT id FROM runs WHERE project_id = ? ORDER BY created_at DESC',
      [projectId]
    );

    return rows.map(row => row.id as string);
  }

  async saveArtifact(
    projectId: string,
    runId: string,
    artifactType: string,
    artifact: Artifact
  ): Promise<void> {
    if (!this.pool) {
      throw new Error('Pool not initialized');
    }

    const artifactId = `${runId}-${artifactType}`;

    await this.pool.execute(
      'INSERT INTO artifacts (id, project_id, run_id, artifact_type, artifact_data) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE artifact_data = ?',
      [
        artifactId,
        projectId,
        runId,
        artifactType,
        JSON.stringify(artifact),
        JSON.stringify(artifact),
      ]
    );
  }

  async loadArtifact(
    projectId: string,
    runId: string,
    artifactType: string
  ): Promise<Artifact | null> {
    if (!this.pool) {
      throw new Error('Pool not initialized');
    }

    const artifactId = `${runId}-${artifactType}`;

    const [rows] = await this.pool.execute<mysql.RowDataPacket[]>(
      'SELECT artifact_data FROM artifacts WHERE id = ? AND project_id = ?',
      [artifactId, projectId]
    );

    if (rows.length === 0) {
      return null;
    }

    return rows[0]!.artifact_data as Artifact;
  }

  async appendAuditLog(
    projectId: string,
    runId: string,
    entry: Record<string, unknown>
  ): Promise<void> {
    if (!this.pool) {
      throw new Error('Pool not initialized');
    }

    await this.pool.execute(
      'INSERT INTO audit_log (project_id, run_id, entry_data) VALUES (?, ?, ?)',
      [projectId, runId, JSON.stringify({ ...entry, timestamp: new Date().toISOString() })]
    );
  }
}
