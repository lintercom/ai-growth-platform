import { z } from 'zod';

export const CostReportSchema = z.object({
  runId: z.string(),
  totalCostUsd: z.number(),
  totalTokens: z.object({
    input: z.number(),
    output: z.number(),
  }),
  modelBreakdown: z.array(z.object({
    model: z.string(),
    tokens: z.object({
      input: z.number(),
      output: z.number(),
    }),
    costUsd: z.number(),
  })),
  budgetLimitUsd: z.number().optional(),
  budgetExceeded: z.boolean(),
});

export type CostReport = z.infer<typeof CostReportSchema>;
