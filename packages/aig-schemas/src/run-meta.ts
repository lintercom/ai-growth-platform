import { z } from 'zod';

export const RunMetaSchema = z.object({
  runId: z.string(),
  projectName: z.string(),
  workflowType: z.enum(['analyze', 'architect', 'export', 'chat']),
  workflowSubtype: z.string().optional(),
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
  status: z.enum(['running', 'completed', 'failed']),
  error: z.string().optional(),
});

export type RunMeta = z.infer<typeof RunMetaSchema>;
