import { z } from 'zod';
import { OpenAIClient } from '@aig/core';

/**
 * 4️⃣ AI SEO Reasoning Engine
 * 
 * AI chápe search intent.
 * Generuje strukturu stránek, obsah, interní prolinkování.
 * SEO je vedlejší efekt dobrého pochopení.
 */

export const SEOStrategySchema = z.object({
  targetIntent: z.string(),
  pageStructure: z.array(z.object({
    section: z.string(),
    purpose: z.string(),
    keywords: z.array(z.string()).optional(),
  })),
  contentPlan: z.object({
    headings: z.array(z.string()),
    keyPhrases: z.array(z.string()),
    semanticTopics: z.array(z.string()),
  }),
  internalLinking: z.array(z.object({
    from: z.string(),
    to: z.string(),
    anchor: z.string(),
    reason: z.string(),
  })),
});

export type SEOStrategy = z.infer<typeof SEOStrategySchema>;

export class AISEoReasoningEngine {
  private client: OpenAIClient;

  constructor(client: OpenAIClient) {
    this.client = client;
  }

  /**
   * Analyzuje search intent a vytvoří SEO strategii
   */
  async createSEOStrategy(
    domain: string,
    topic: string,
    targetAudience: string
  ): Promise<SEOStrategy> {
    const prompt = `Vytvoř SEO strategii pro:

Doména: ${domain}
Téma: ${topic}
Cílová skupina: ${targetAudience}

Zaměř se na search intent a porozumění, ne jen keywords.

Vrať JSON:
{
  "targetIntent": "hlavní záměr uživatelů",
  "pageStructure": [
    {"section": "název sekce", "purpose": "účel", "keywords": [...]}
  ],
  "contentPlan": {
    "headings": [...],
    "keyPhrases": [...],
    "semanticTopics": [...]
  },
  "internalLinking": [
    {"from": "stránka A", "to": "stránka B", "anchor": "text", "reason": "proč"}
  ]
}`;

    const response = await this.client.chatCompletion({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'Jsi AI SEO Reasoning Engine. Tvoříš SEO strategie založené na porozumění search intentu, ne jen keywords.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.5,
    });

    const content = response.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);

    return SEOStrategySchema.parse(parsed);
  }

  /**
   * Generuje meta tagy na základě obsahu a intentu
   */
  async generateMetaTags(
    content: string,
    intent: string
  ): Promise<{
    title: string;
    description: string;
    keywords: string[];
  }> {
    const prompt = `Vygeneruj meta tagy pro:

Obsah:
${content.substring(0, 1000)}

Search intent: ${intent}

Vrať JSON:
{
  "title": "...",
  "description": "...",
  "keywords": [...]
}`;

    const response = await this.client.chatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Jsi SEO expert. Generuješ meta tagy zaměřené na search intent.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
    });

    const content_resp = response.choices[0]?.message?.content || '{}';
    return JSON.parse(content_resp);
  }
}
