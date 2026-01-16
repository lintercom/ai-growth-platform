import { z } from 'zod';

export const AuditLogEntrySchema = z.object({
  timestamp: z.string().datetime(),
  level: z.enum(['info', 'warning', 'error']),
  action: z.string(),
  details: z.record(z.unknown()).optional(),
  error: z.string().optional(),
});

export const AuditLogSchema = z.object({
  runId: z.string(),
  entries: z.array(AuditLogEntrySchema),
});

export type AuditLogEntry = z.infer<typeof AuditLogEntrySchema>;
export type AuditLog = z.infer<typeof AuditLogSchema>;
