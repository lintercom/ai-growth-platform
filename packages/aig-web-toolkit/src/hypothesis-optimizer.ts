import { z } from 'zod';
import { OpenAIClient } from '@aig/core';

/**
 * 9️⃣ Hypothesis-Driven Optimizer
 * 
 * AI generuje hypotézy, navrhuje testy, vyhodnocuje významnost.
 * Člověk jen schvaluje.
 */

export const HypothesisSchema = z.object({
  id: z.string(),
  statement: z.string(),
  reasoning: z.string(),
  proposedTest: z.object({
    variantA: z.string(),
    variantB: z.string(),
    metric: z.string(),
    duration: z.string(),
  }),
  expectedImpact: z.string(),
  confidence: z.number().min(0).max(1),
});

export const TestResultSchema = z.object({
  hypothesisId: z.string(),
  winner: z.enum(['A', 'B', 'inconclusive']),
  significance: z.number().min(0).max(1),
  interpretation: z.string(),
  recommendations: z.array(z.string()),
});

export type Hypothesis = z.infer<typeof HypothesisSchema>;
export type TestResult = z.infer<typeof TestResultSchema>;

export class HypothesisDrivenOptimizer {
  private client: OpenAIClient;

  constructor(client: OpenAIClient) {
    this.client = client;
  }

  /**
   * Generuje hypotézu na základě dat a problémů
   */
  async generateHypothesis(
    problem: string,
    currentData: Record<string, unknown>
  ): Promise<Hypothesis> {
    const prompt = `Vytvoř hypotézu pro řešení problému:

Problém: ${problem}

Současná data:
${JSON.stringify(currentData, null, 2)}

Vrať JSON:
{
  "statement": "pokud uděláme X, pak očekáváme Y",
  "reasoning": "...",
  "proposedTest": {
    "variantA": "současný stav",
    "variantB": "navržená změna",
    "metric": "co měříme",
    "duration": "jak dlouho"
  },
  "expectedImpact": "...",
  "confidence": 0.0-1.0
}`;

    const response = await this.client.chatCompletion({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'Jsi Hypothesis-Driven Optimizer. Generuješ testovatelné hypotézy a navrhuješ A/B testy.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.5,
    });

    const content = response.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);

    return HypothesisSchema.parse({
      id: `hyp-${Date.now()}`,
      ...parsed,
    });
  }

  /**
   * Vyhodnotí výsledky testu
   */
  async evaluateTest(
    hypothesis: Hypothesis,
    results: {
      variantA: { conversions: number; visitors: number };
      variantB: { conversions: number; visitors: number };
    }
  ): Promise<TestResult> {
    // Simplified - v produkci by to bylo statistické vyhodnocení
    const conversionA = results.variantA.conversions / results.variantA.visitors;
    const conversionB = results.variantB.conversions / results.variantB.visitors;

    const winner = conversionB > conversionA ? 'B' : conversionA > conversionB ? 'A' : 'inconclusive';
    const improvement = Math.abs(conversionB - conversionA) / conversionA;

    return {
      hypothesisId: hypothesis.id,
      winner,
      significance: improvement > 0.1 ? 0.9 : improvement > 0.05 ? 0.7 : 0.5,
      interpretation: winner === 'B' 
        ? `Variant B je lepší o ${(improvement * 100).toFixed(1)}%`
        : 'Rozdíl není významný',
      recommendations: winner === 'B' 
        ? ['Implementovat variant B', 'Monitorovat dlouhodobé výsledky']
        : ['Zvážit další testy', 'Analyzovat segmenty'],
    };
  }
}
