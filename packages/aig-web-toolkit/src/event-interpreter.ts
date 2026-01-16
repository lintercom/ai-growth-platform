import { z } from 'zod';
import { OpenAIClient } from '@aig/core';

/**
 * 8️⃣ AI Event Interpreter
 * 
 * Eventy nejsou čísla, ale signály.
 * AI interpretuje chování, detekuje frikci, navrhuje změny.
 */

export const EventSchema = z.object({
  type: z.string(),
  timestamp: z.string().datetime(),
  userId: z.string(),
  properties: z.record(z.unknown()),
});

export const InterpretationSchema = z.object({
  behavior: z.string(),
  friction: z.array(z.object({
    location: z.string(),
    severity: z.enum(['low', 'medium', 'high']),
    description: z.string(),
  })),
  suggestions: z.array(z.object({
    change: z.string(),
    reason: z.string(),
    expectedImpact: z.string(),
  })),
});

export type Event = z.infer<typeof EventSchema>;
export type Interpretation = z.infer<typeof InterpretationSchema>;

export class AIEventInterpreter {
  private client: OpenAIClient;

  constructor(client: OpenAIClient) {
    this.client = client;
  }

  /**
   * Interpretuje sekvenci eventů jako chování
   */
  async interpretEvents(events: Event[]): Promise<Interpretation> {
    const eventsSummary = events.map(e => ({
      type: e.type,
      timestamp: e.timestamp,
      properties: e.properties,
    }));

    const prompt = `Interpretuj tuto sekvenci eventů:

${JSON.stringify(eventsSummary, null, 2)}

Identifikuj:
1. Chování uživatele
2. Frikce (kde se zasekl, proč)
3. Návrhy na zlepšení

Vrať JSON:
{
  "behavior": "...",
  "friction": [
    {"location": "...", "severity": "low|medium|high", "description": "..."}
  ],
  "suggestions": [
    {"change": "...", "reason": "...", "expectedImpact": "..."}
  ]
}`;

    const response = await this.client.chatCompletion({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'Jsi AI Event Interpreter. Interpretuješ eventy jako signály chování, detekuješ frikci a navrhuješ zlepšení.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);

    return InterpretationSchema.parse(parsed);
  }
}
