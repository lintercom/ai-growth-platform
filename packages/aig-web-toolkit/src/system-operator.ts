import { z } from 'zod';
import { OpenAIClient } from '@aig/core';

/**
 * 1️⃣2️⃣ AI System Operator
 * 
 * Administrace přes chat.
 * Dotazy typu: "proč klesly konverze?", "co mám zlepšit?"
 */

export const SystemQuerySchema = z.object({
  question: z.string(),
  context: z.record(z.unknown()).optional(),
});

export const SystemResponseSchema = z.object({
  answer: z.string(),
  insights: z.array(z.string()),
  recommendations: z.array(z.object({
    action: z.string(),
    priority: z.enum(['low', 'medium', 'high']),
    reason: z.string(),
  })),
  data: z.record(z.unknown()).optional(),
});

export type SystemQuery = z.infer<typeof SystemQuerySchema>;
export type SystemResponse = z.infer<typeof SystemResponseSchema>;

export class AISystemOperator {
  private client: OpenAIClient;
  private systemData: Record<string, unknown> = {};

  constructor(client: OpenAIClient) {
    this.client = client;
  }

  /**
   * Nastaví systémová data pro analýzu
   */
  setSystemData(data: Record<string, unknown>): void {
    this.systemData = data;
  }

  /**
   * Odpoví na dotaz o systému
   */
  async query(query: SystemQuery): Promise<SystemResponse> {
    const prompt = `Odpověz na dotaz o systému:

Dotaz: ${query.question}

${query.context ? `Kontext: ${JSON.stringify(query.context)}` : ''}

Systémová data:
${JSON.stringify(this.systemData, null, 2)}

Vrať JSON:
{
  "answer": "odpověď na dotaz",
  "insights": ["hlavní poznatky"],
  "recommendations": [
    {"action": "...", "priority": "low|medium|high", "reason": "..."}
  ],
  "data": {...relevantní data}
}`;

    const response = await this.client.chatCompletion({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'Jsi AI System Operator. Odpovídáš na dotazy o systému, analyzuješ data a poskytuješ doporučení.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);

    return SystemResponseSchema.parse(parsed);
  }

  /**
   * Analyzuje systém a navrhne zlepšení
   */
  async analyzeSystem(): Promise<SystemResponse> {
    return this.query({
      question: 'Co by se mělo v systému zlepšit?',
      context: {},
    });
  }
}
