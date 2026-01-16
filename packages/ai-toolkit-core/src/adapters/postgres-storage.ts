import type { StorageAdapter } from './interfaces.js';
import type { StorageHealth as StorageHealthType, Artifact } from '@aig/schemas';
import { StorageHealthSchema } from '@aig/schemas';
import type { AdapterConfig } from './factory.js';
import type pg from 'pg';
import { Pool } from 'pg';

/**
 * PostgresStorageAdapter - ukládání do PostgreSQL databáze
 */
export class PostgresStorageAdapter implements StorageAdapter {
  private pool: pg.Pool | null = null;
  private config: AdapterConfig['postgres'];

  constructor(config?: AdapterConfig['postgres']) {
    this.config = config;
  }

  async init(): Promise<void> {
    if (!this.config) {
      throw new Error('Postgres config is required');
    }

    this.pool = new Pool({
      connectionString: this.config.url,
    });

    // Run migrations
    await this.runMigrations();
  }

  private async runMigrations(): Promise<void> {
    if (!this.pool) {
      throw new Error('Pool not initialized');
    }

    const client = await this.pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS projects (
          id VARCHAR(255) PRIMARY KEY,
          data JSONB NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);

        CREATE TABLE IF NOT EXISTS runs (
          id VARCHAR(255) PRIMARY KEY,
          project_id VARCHAR(255) NOT NULL,
          metadata JSONB NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_runs_project_id ON runs(project_id);
        CREATE INDEX IF NOT EXISTS idx_runs_created_at ON runs(created_at);

        CREATE TABLE IF NOT EXISTS artifacts (
          id VARCHAR(255) PRIMARY KEY,
          project_id VARCHAR(255) NOT NULL,
          run_id VARCHAR(255) NOT NULL,
          artifact_type VARCHAR(255) NOT NULL,
          artifact_data JSONB NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_artifacts_project_run ON artifacts(project_id, run_id);
        CREATE INDEX IF NOT EXISTS idx_artifacts_type ON artifacts(artifact_type);

        CREATE TABLE IF NOT EXISTS audit_log (
          id BIGSERIAL PRIMARY KEY,
          project_id VARCHAR(255) NOT NULL,
          run_id VARCHAR(255) NOT NULL,
          entry_data JSONB NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_audit_log_project_run ON audit_log(project_id, run_id);
        CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);

        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
        END;
        $$ language 'plpgsql';

        DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
        CREATE TRIGGER update_projects_updated_at
          BEFORE UPDATE ON projects
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();

        DROP TRIGGER IF EXISTS update_runs_updated_at ON runs;
        CREATE TRIGGER update_runs_updated_at
          BEFORE UPDATE ON runs
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
      `);
    } finally {
      client.release();
    }
  }

  async healthCheck(): Promise<StorageHealthType> {
    try {
      if (!this.pool) {
        throw new Error('Pool not initialized');
      }

      await this.pool.query('SELECT 1');
      
      return StorageHealthSchema.parse({
        status: 'healthy',
        message: 'PostgreSQL connection OK',
        details: {
          url: this.config?.url ? 'configured' : 'not set',
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

    const result = await this.pool.query(
      'SELECT data FROM projects WHERE id = $1',
      [projectId]
    );

    if (result.rows.length === 0) {
      throw new Error(`Project ${projectId} not found`);
    }

    return result.rows[0]!.data as Record<string, unknown>;
  }

  async saveProject(projectId: string, data: Record<string, unknown>): Promise<void> {
    if (!this.pool) {
      throw new Error('Pool not initialized');
    }

    await this.pool.query(
      `INSERT INTO projects (id, data) VALUES ($1, $2)
       ON CONFLICT (id) DO UPDATE SET data = $2, updated_at = CURRENT_TIMESTAMP`,
      [projectId, JSON.stringify(data)]
    );
  }

  async createRun(projectId: string, runId: string, metadata: Record<string, unknown>): Promise<void> {
    if (!this.pool) {
      throw new Error('Pool not initialized');
    }

    await this.pool.query(
      'INSERT INTO runs (id, project_id, metadata) VALUES ($1, $2, $3)',
      [runId, projectId, JSON.stringify(metadata)]
    );
  }

  async listRuns(projectId: string): Promise<string[]> {
    if (!this.pool) {
      throw new Error('Pool not initialized');
    }

    const result = await this.pool.query(
      'SELECT id FROM runs WHERE project_id = $1 ORDER BY created_at DESC',
      [projectId]
    );

    return result.rows.map((row: pg.QueryResultRow) => row.id as string);
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

    await this.pool.query(
      `INSERT INTO artifacts (id, project_id, run_id, artifact_type, artifact_data)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE SET artifact_data = $5`,
      [
        artifactId,
        projectId,
        runId,
        artifactType,
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

    const result = await this.pool.query(
      'SELECT artifact_data FROM artifacts WHERE id = $1 AND project_id = $2',
      [artifactId, projectId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0]!.artifact_data as Artifact;
  }

  async appendAuditLog(
    projectId: string,
    runId: string,
    entry: Record<string, unknown>
  ): Promise<void> {
    if (!this.pool) {
      throw new Error('Pool not initialized');
    }

    await this.pool.query(
      'INSERT INTO audit_log (project_id, run_id, entry_data) VALUES ($1, $2, $3)',
      [projectId, runId, JSON.stringify({ ...entry, timestamp: new Date().toISOString() })]
    );
  }
}
