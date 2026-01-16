import type { EventSinkAdapter } from './interfaces.js';
import type { EventSinkHealth, UserEvent, EventAggregateQuery, EventAggregateResult } from '@aig/schemas';
import { EventSinkHealthSchema, EventAggregateResultSchema } from '@aig/schemas';
import type { AdapterConfig } from './factory.js';
import type mysql from 'mysql2/promise';
import type pg from 'pg';

type DatabasePool = mysql.Pool | pg.Pool;
type DatabaseType = 'mysql' | 'postgres';

/**
 * DBAggregateEventSinkAdapter - ukládá pouze agregace do DB
 */
export class DBAggregateEventSinkAdapter implements EventSinkAdapter {
  private pool: DatabasePool | null = null;
  private dbType: DatabaseType | null = null;
  private config: AdapterConfig;

  constructor(config: AdapterConfig) {
    this.config = config;
  }

  async init(): Promise<void> {
    // Determine DB type from storage adapter
    const storageType = this.config.storage || 'file';

    if (storageType === 'mysql') {
      this.dbType = 'mysql';
      await this.initMySQL();
    } else if (storageType === 'postgres') {
      this.dbType = 'postgres';
      await this.initPostgres();
    } else {
      throw new Error('DBAggregateEventSinkAdapter requires mysql or postgres storage adapter');
    }

    await this.runMigrations();
  }

  private async initMySQL(): Promise<void> {
    if (!this.config.mysql) {
      throw new Error('MySQL config is required');
    }

    const mysqlModule = await import('mysql2/promise');
    const poolConfig: mysql.PoolOptions = this.config.mysql.url
      ? { uri: this.config.mysql.url }
      : {
          host: this.config.mysql.host || 'localhost',
          port: this.config.mysql.port || 3306,
          user: this.config.mysql.user,
          password: this.config.mysql.password,
          database: this.config.mysql.database,
        };

    this.pool = mysqlModule.createPool(poolConfig) as unknown as DatabasePool;
  }

  private async initPostgres(): Promise<void> {
    if (!this.config.postgres) {
      throw new Error('Postgres config is required');
    }

    const pgModule = await import('pg');
    const { Pool } = pgModule;

    this.pool = new Pool({
      connectionString: this.config.postgres.url,
    }) as unknown as DatabasePool;
  }

  private async runMigrations(): Promise<void> {
    if (!this.pool || !this.dbType) {
      throw new Error('Pool not initialized');
    }

    if (this.dbType === 'mysql') {
      const pool = this.pool as unknown as mysql.Pool;
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS daily_page_views (
          id BIGINT AUTO_INCREMENT PRIMARY KEY,
          project_id VARCHAR(255) NOT NULL,
          date DATE NOT NULL,
          count INT DEFAULT 0,
          UNIQUE KEY unique_project_date (project_id, date),
          INDEX idx_project_id (project_id),
          INDEX idx_date (date)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

        CREATE TABLE IF NOT EXISTS daily_funnel_steps (
          id BIGINT AUTO_INCREMENT PRIMARY KEY,
          project_id VARCHAR(255) NOT NULL,
          date DATE NOT NULL,
          step VARCHAR(255) NOT NULL,
          count INT DEFAULT 0,
          UNIQUE KEY unique_project_date_step (project_id, date, step),
          INDEX idx_project_id (project_id),
          INDEX idx_date (date)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
    } else {
      const pool = this.pool as unknown as pg.Pool;
      const client = await pool.connect();
      try {
        await client.query(`
          CREATE TABLE IF NOT EXISTS daily_page_views (
            id BIGSERIAL PRIMARY KEY,
            project_id VARCHAR(255) NOT NULL,
            date DATE NOT NULL,
            count INT DEFAULT 0,
            UNIQUE (project_id, date)
          );

          CREATE INDEX IF NOT EXISTS idx_daily_page_views_project ON daily_page_views(project_id);
          CREATE INDEX IF NOT EXISTS idx_daily_page_views_date ON daily_page_views(date);

          CREATE TABLE IF NOT EXISTS daily_funnel_steps (
            id BIGSERIAL PRIMARY KEY,
            project_id VARCHAR(255) NOT NULL,
            date DATE NOT NULL,
            step VARCHAR(255) NOT NULL,
            count INT DEFAULT 0,
            UNIQUE (project_id, date, step)
          );

          CREATE INDEX IF NOT EXISTS idx_daily_funnel_steps_project ON daily_funnel_steps(project_id);
          CREATE INDEX IF NOT EXISTS idx_daily_funnel_steps_date ON daily_funnel_steps(date);
        `);
      } finally {
        client.release();
      }
    }
  }

  async healthCheck(): Promise<EventSinkHealth> {
    try {
      if (!this.pool) {
        throw new Error('Pool not initialized');
      }

      if (this.dbType === 'mysql') {
        const pool = this.pool as unknown as mysql.Pool;
        await pool.execute('SELECT 1');
      } else {
        const pool = this.pool as unknown as pg.Pool;
        await pool.query('SELECT 1');
      }

      return EventSinkHealthSchema.parse({
        status: 'healthy',
        message: `DB Aggregate EventSink ready (${this.dbType})`,
        pendingEvents: 0,
      });
    } catch (error) {
      return EventSinkHealthSchema.parse({
        status: 'unhealthy',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async emit(event: UserEvent): Promise<void> {
    await this.emitBatch([event]);
  }

  async emitBatch(events: UserEvent[]): Promise<void> {
    if (events.length === 0 || !this.pool || !this.dbType) {
      return;
    }

    const date = new Date().toISOString().split('T')[0];

    if (this.dbType === 'mysql') {
      await this.emitBatchMySQL(events, date);
    } else {
      await this.emitBatchPostgres(events, date);
    }
  }

  private async emitBatchMySQL(events: UserEvent[], date: string): Promise<void> {
    const pool = this.pool as unknown as mysql.Pool;

    // Group by project and event type
    const groups = new Map<string, Map<string, number>>();

    for (const event of events) {
      const projectId = event.projectId || 'default';
      
      if (event.eventType === 'page_view') {
        if (!groups.has(`${projectId}:page_views`)) {
          groups.set(`${projectId}:page_views`, new Map());
        }
        const map = groups.get(`${projectId}:page_views`)!;
        map.set(date, (map.get(date) || 0) + 1);
      }

      // Map other event types to funnel steps
      if (event.eventType.startsWith('funnel_')) {
        const step = event.eventType.replace('funnel_', '');
        const key = `${projectId}:funnel:${step}`;
        if (!groups.has(key)) {
          groups.set(key, new Map([[date, 0]]));
        }
        const map = groups.get(key)!;
        map.set(date, (map.get(date) || 0) + 1);
      }
    }

    // Update aggregations
    for (const [key, counts] of groups) {
      const [projectId, type, ...stepParts] = key.split(':');
      const count = counts.get(date) || 0;

      if (type === 'page_views') {
        await pool.execute(
          `INSERT INTO daily_page_views (project_id, date, count)
           VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE count = count + ?`,
          [projectId, date, count, count]
        );
      } else if (type === 'funnel') {
        const step = stepParts.join(':');
        await pool.execute(
          `INSERT INTO daily_funnel_steps (project_id, date, step, count)
           VALUES (?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE count = count + ?`,
          [projectId, date, step, count, count]
        );
      }
    }
  }

  private async emitBatchPostgres(events: UserEvent[], date: string): Promise<void> {
    const pool = this.pool as unknown as pg.Pool;

    // Similar logic as MySQL
    const groups = new Map<string, Map<string, number>>();

    for (const event of events) {
      const projectId = event.projectId || 'default';
      
      if (event.eventType === 'page_view') {
        if (!groups.has(`${projectId}:page_views`)) {
          groups.set(`${projectId}:page_views`, new Map());
        }
        const map = groups.get(`${projectId}:page_views`)!;
        map.set(date, (map.get(date) || 0) + 1);
      }

      if (event.eventType.startsWith('funnel_')) {
        const step = event.eventType.replace('funnel_', '');
        const key = `${projectId}:funnel:${step}`;
        if (!groups.has(key)) {
          groups.set(key, new Map([[date, 0]]));
        }
        const map = groups.get(key)!;
        map.set(date, (map.get(date) || 0) + 1);
      }
    }

    for (const [key, counts] of groups) {
      const [projectId, type, ...stepParts] = key.split(':');
      const count = counts.get(date) || 0;

      if (type === 'page_views') {
        await pool.query(
          `INSERT INTO daily_page_views (project_id, date, count)
           VALUES ($1, $2, $3)
           ON CONFLICT (project_id, date) DO UPDATE SET count = daily_page_views.count + $3`,
          [projectId, date, count]
        );
      } else if (type === 'funnel') {
        const step = stepParts.join(':');
        await pool.query(
          `INSERT INTO daily_funnel_steps (project_id, date, step, count)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (project_id, date, step) DO UPDATE SET count = daily_funnel_steps.count + $4`,
          [projectId, date, step, count]
        );
      }
    }
  }

  async flush(): Promise<void> {
    // No-op - aggregations are written immediately
  }

  async getAggregates(query: EventAggregateQuery): Promise<EventAggregateResult> {
    if (!this.pool || !this.dbType) {
      throw new Error('Pool not initialized');
    }

    if (this.dbType === 'mysql') {
      return this.getAggregatesMySQL(query);
    } else {
      return this.getAggregatesPostgres(query);
    }
  }

  private async getAggregatesMySQL(query: EventAggregateQuery): Promise<EventAggregateResult> {
    const pool = this.pool as unknown as mysql.Pool;
    const results: EventAggregateResult['results'] = [];
    let totalCount = 0;

    // Get page views
    const [pageViews] = await pool.execute<mysql.RowDataPacket[]>(
      `SELECT date, SUM(count) as count
       FROM daily_page_views
       WHERE project_id = ? AND date >= ? AND date <= ?
       GROUP BY date
       ORDER BY date`,
      [query.projectId, query.startDate.split('T')[0], query.endDate.split('T')[0]]
    );

    for (const row of pageViews) {
      const count = Number(row.count) || 0;
      totalCount += count;
      results.push({
        date: row.date.toISOString().split('T')[0],
        eventType: 'page_view',
        metrics: { count },
      });
    }

    // Get funnel steps if requested
    if (query.eventTypes?.some(e => e.startsWith('funnel_'))) {
      const [funnelSteps] = await pool.execute<mysql.RowDataPacket[]>(
        `SELECT date, step, SUM(count) as count
         FROM daily_funnel_steps
         WHERE project_id = ? AND date >= ? AND date <= ?
         GROUP BY date, step
         ORDER BY date, step`,
        [query.projectId, query.startDate.split('T')[0], query.endDate.split('T')[0]]
      );

      for (const row of funnelSteps) {
        const count = Number(row.count) || 0;
        totalCount += count;
        results.push({
          date: row.date.toISOString().split('T')[0],
          eventType: `funnel_${row.step}`,
          metrics: { count },
        });
      }
    }

    return EventAggregateResultSchema.parse({
      query,
      results,
      totalCount,
    });
  }

  private async getAggregatesPostgres(query: EventAggregateQuery): Promise<EventAggregateResult> {
    const pool = this.pool as unknown as pg.Pool;
    const results: EventAggregateResult['results'] = [];
    let totalCount = 0;

    // Get page views
    const pageViewsResult = await pool.query(
      `SELECT date, SUM(count) as count
       FROM daily_page_views
       WHERE project_id = $1 AND date >= $2::date AND date <= $3::date
       GROUP BY date
       ORDER BY date`,
      [query.projectId, query.startDate.split('T')[0], query.endDate.split('T')[0]]
    );

    for (const row of pageViewsResult.rows) {
      const count = Number(row.count) || 0;
      totalCount += count;
      results.push({
        date: row.date.toISOString().split('T')[0],
        eventType: 'page_view',
        metrics: { count },
      });
    }

    // Get funnel steps
    if (query.eventTypes?.some(e => e.startsWith('funnel_'))) {
      const funnelStepsResult = await pool.query(
        `SELECT date, step, SUM(count) as count
         FROM daily_funnel_steps
         WHERE project_id = $1 AND date >= $2::date AND date <= $3::date
         GROUP BY date, step
         ORDER BY date, step`,
        [query.projectId, query.startDate.split('T')[0], query.endDate.split('T')[0]]
      );

      for (const row of funnelStepsResult.rows) {
        const count = Number(row.count) || 0;
        totalCount += count;
        results.push({
          date: row.date.toISOString().split('T')[0],
          eventType: `funnel_${row.step}`,
          metrics: { count },
        });
      }
    }

    return EventAggregateResultSchema.parse({
      query,
      results,
      totalCount,
    });
  }
}
