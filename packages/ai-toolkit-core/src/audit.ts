import { z } from 'zod';
import { AuditLogEntrySchema, AuditLogSchema } from '@aig/schemas';

export type AuditLogEntry = z.infer<typeof AuditLogEntrySchema>;
export type AuditLog = z.infer<typeof AuditLogSchema>;

/**
 * Audit logger pro sledování všech akcí během runu
 */
export class AuditLogger {
  private entries: AuditLogEntry[] = [];

  /**
   * Přidá audit log entry
   */
  log(level: 'info' | 'warning' | 'error', action: string, details?: Record<string, unknown>, error?: string): void {
    this.entries.push({
      timestamp: new Date().toISOString(),
      level,
      action,
      details,
      error,
    });
  }

  /**
   * Info log
   */
  info(action: string, details?: Record<string, unknown>): void {
    this.log('info', action, details);
  }

  /**
   * Warning log
   */
  warn(action: string, details?: Record<string, unknown>): void {
    this.log('warning', action, details);
  }

  /**
   * Error log
   */
  error(action: string, error: string, details?: Record<string, unknown>): void {
    this.log('error', action, details, error);
  }

  /**
   * Vytvoří audit log pro uložení
   */
  createLog(runId: string): AuditLog {
    return {
      runId,
      entries: [...this.entries],
    };
  }

  /**
   * Vrátí všechny entries
   */
  getEntries(): AuditLogEntry[] {
    return [...this.entries];
  }
}
