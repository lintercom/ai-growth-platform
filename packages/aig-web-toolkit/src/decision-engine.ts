import { z } from 'zod';
import { OpenAIClient } from '@aig/core';

/**
 * 🔟 AI Decision Engine
 * 
 * AI rozhoduje: co zobrazit, kdy eskalovat, kdy zastavit proces.
 * Deterministické systémy jen hlídají hranice.
 */

export const DecisionSchema = z.object({
  action: z.string(),
  reasoning: z.string(),
  confidence: z.number().min(0).max(1),
  constraints: z.array(z.string()).optional(),
  alternatives: z.array(z.object({
    action: z.string(),
    reason: z.string(),
  })).optional(),
});

export type Decision = z.infer<typeof DecisionSchema>;

export interface DecisionContext {
  state: Record<string, unknown>;
  history: Array<{ action: string; timestamp: string }>;
  constraints: string[];
}

export class AIDecisionEngine {
  private client: OpenAIClient;
  private constraints: string[];

  constructor(client: OpenAIClient, constraints: string[] = []) {
    this.client = client;
    this.constraints = constraints;
  }

  /**
   * Rozhodne, jakou akci provést
   */
  async decide(
    question: string,
    context: DecisionContext
  ): Promise<Decision> {
    const prompt = `Rozhodni, jakou akci provést:

Otázka: ${question}

Kontext:
${JSON.stringify(context.state, null, 2)}

Historie akcí:
${JSON.stringify(context.history.slice(-5), null, 2)}

${this.constraints.length > 0 ? `Omezení:\n${this.constraints.join('\n')}` : ''}

Vrať JSON:
{
  "action": "co udělat",
  "reasoning": "proč",
  "confidence": 0.0-1.0,
  "alternatives": [
    {"action": "...", "reason": "..."}
  ]
}`;

    const response = await this.client.chatCompletion({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'Jsi AI Decision Engine. Rozhoduješ, jaké akce provést na základě kontextu a omezení.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);

    // Kontrola constraintů (deterministická část)
    const validAction = this.validateConstraints(parsed.action);

    return DecisionSchema.parse({
      ...parsed,
      action: validAction,
      constraints: this.constraints,
    });
  }

  private validateConstraints(action: string): string {
    // Deterministická validace - hlídá hranice
    // V produkci by to kontrolovalo business rules
    return action;
  }
}
