import { z } from 'zod';

/**
 * Ceny modelů za token (USD)
 * Zdroj: https://openai.com/api/pricing/ (leden 2024)
 */
export const MODEL_PRICING = {
  // GPT-4 Turbo
  'gpt-4-turbo-preview': { input: 0.01 / 1000, output: 0.03 / 1000 },
  'gpt-4-0125-preview': { input: 0.01 / 1000, output: 0.03 / 1000 },
  'gpt-4-1106-preview': { input: 0.01 / 1000, output: 0.03 / 1000 },
  'gpt-4-turbo': { input: 0.01 / 1000, output: 0.03 / 1000 },
  
  // GPT-4
  'gpt-4': { input: 0.03 / 1000, output: 0.06 / 1000 },
  'gpt-4-32k': { input: 0.06 / 1000, output: 0.12 / 1000 },
  
  // GPT-3.5 Turbo
  'gpt-3.5-turbo': { input: 0.0005 / 1000, output: 0.0015 / 1000 },
  'gpt-3.5-turbo-16k': { input: 0.003 / 1000, output: 0.004 / 1000 },
  
  // Embeddings
  'text-embedding-ada-002': { input: 0.0001 / 1000, output: 0 },
} as const;

export type ModelName = keyof typeof MODEL_PRICING;

/**
 * Vypočítá cenu za použití modelu
 */
export function calculateCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const pricing = MODEL_PRICING[model as ModelName];
  if (!pricing) {
    // Default fallback pro neznámé modely
    return (inputTokens + outputTokens) * 0.001 / 1000;
  }
  
  return inputTokens * pricing.input + outputTokens * pricing.output;
}

/**
 * Budget policy
 */
export const BudgetPolicySchema = z.object({
  maxUsd: z.number().positive().optional(),
  warnThreshold: z.number().min(0).max(1).default(0.8), // 80% budgetu
});

export type BudgetPolicy = z.infer<typeof BudgetPolicySchema>;

/**
 * Budget tracker pro sledování nákladů během runu
 */
export class BudgetTracker {
  private totalCost = 0;
  private modelBreakdown: Map<string, { input: number; output: number; cost: number }> = new Map();
  private policy: BudgetPolicy;

  constructor(policy: Partial<BudgetPolicy> = {}) {
    this.policy = BudgetPolicySchema.parse({ warnThreshold: 0.8, ...policy });
  }

  /**
   * Přidá použití modelu do trackingu
   */
  addUsage(model: string, inputTokens: number, outputTokens: number): void {
    const cost = calculateCost(model, inputTokens, outputTokens);
    this.totalCost += cost;

    const existing = this.modelBreakdown.get(model) || { input: 0, output: 0, cost: 0 };
    this.modelBreakdown.set(model, {
      input: existing.input + inputTokens,
      output: existing.output + outputTokens,
      cost: existing.cost + cost,
    });
  }

  /**
   * Zkontroluje jestli budget není překročen
   */
  checkBudget(): { allowed: boolean; exceeded: boolean; remaining?: number } {
    if (!this.policy.maxUsd) {
      return { allowed: true, exceeded: false };
    }

    const exceeded = this.totalCost > this.policy.maxUsd;
    const remaining = this.policy.maxUsd - this.totalCost;

    return {
      allowed: !exceeded,
      exceeded,
      remaining,
    };
  }

  /**
   * Vrátí celkovou cenu
   */
  getTotalCost(): number {
    return this.totalCost;
  }

  /**
   * Vrátí breakdown podle modelů
   */
  getBreakdown() {
    return Array.from(this.modelBreakdown.entries()).map(([model, data]) => ({
      model,
      tokens: { input: data.input, output: data.output },
      costUsd: data.cost,
    }));
  }

  /**
   * Vytvoří cost report pro uložení
   */
  createReport(runId: string): {
    runId: string;
    totalCostUsd: number;
    totalTokens: { input: number; output: number };
    modelBreakdown: Array<{
      model: string;
      tokens: { input: number; output: number };
      costUsd: number;
    }>;
    budgetLimitUsd?: number;
    budgetExceeded: boolean;
  } {
    const totalTokens = Array.from(this.modelBreakdown.values()).reduce(
      (acc, v) => ({
        input: acc.input + v.input,
        output: acc.output + v.output,
      }),
      { input: 0, output: 0 }
    );

    const budgetCheck = this.checkBudget();

    return {
      runId,
      totalCostUsd: this.totalCost,
      totalTokens,
      modelBreakdown: this.getBreakdown(),
      budgetLimitUsd: this.policy.maxUsd,
      budgetExceeded: budgetCheck.exceeded,
    };
  }
}
