import { z } from 'zod';
import { OpenAIClient } from '@aig/core';

/**
 * 1️⃣1️⃣ AI Recovery & Explanation Layer
 * 
 * AI vysvětlí: co se stalo, co dál, nabídne alternativu.
 * Chyba není konec. Je to konverzace.
 */

export const ErrorContextSchema = z.object({
  error: z.string(),
  errorCode: z.string().optional(),
  userAction: z.string(),
  state: z.record(z.unknown()).optional(),
});

export const RecoveryPlanSchema = z.object({
  explanation: z.string(),
  whatHappened: z.string(),
  whatToDo: z.string(),
  alternatives: z.array(z.object({
    option: z.string(),
    description: z.string(),
  })),
  canContinue: z.boolean(),
});

export type ErrorContext = z.infer<typeof ErrorContextSchema>;
export type RecoveryPlan = z.infer<typeof RecoveryPlanSchema>;

export class AIRecoveryLayer {
  private client: OpenAIClient;

  constructor(client: OpenAIClient) {
    this.client = client;
  }

  /**
   * Vytvoří recovery plán pro chybu
   */
  async createRecoveryPlan(context: ErrorContext): Promise<RecoveryPlan> {
    const prompt = `Vytvoř recovery plán pro chybu:

Chyba: ${context.error}
${context.errorCode ? `Kód: ${context.errorCode}` : ''}
Akce uživatele: ${context.userAction}
${context.state ? `Stav: ${JSON.stringify(context.state)}` : ''}

Vrať JSON:
{
  "explanation": "srozumitelné vysvětlení pro uživatele",
  "whatHappened": "co se stalo technicky",
  "whatToDo": "co může uživatel udělat",
  "alternatives": [
    {"option": "...", "description": "..."}
  ],
  "canContinue": true/false
}`;

    const response = await this.client.chatCompletion({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'Jsi AI Recovery Layer. Vysvětluješ chyby uživatelsky přívětivým způsobem a nabízíš řešení.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.5,
    });

    const content = response.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);

    return RecoveryPlanSchema.parse(parsed);
  }
}
