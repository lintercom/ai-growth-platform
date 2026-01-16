import { z } from 'zod';
import { OpenAIClient } from '@aig/core';

/**
 * 3️⃣ AI Content Orchestrator
 * 
 * Obsah se generuje, přepisuje, skládá podle kontextu.
 * Zdroj pravdy = strukturovaná data + pravidla.
 * Text je výstup, ne uložená hodnota.
 */

export const ContentSourceSchema = z.object({
  type: z.enum(['structured_data', 'rules', 'template']),
  data: z.record(z.unknown()),
  rules: z.array(z.string()).optional(),
});

export type ContentSource = z.infer<typeof ContentSourceSchema>;

export const GeneratedContentSchema = z.object({
  title: z.string(),
  body: z.string(),
  meta: z.record(z.unknown()).optional(),
  generatedAt: z.string().datetime(),
  contextHash: z.string(), // pro cache
});

export type GeneratedContent = z.infer<typeof GeneratedContentSchema>;

export class AIContentOrchestrator {
  private client: OpenAIClient;

  constructor(client: OpenAIClient) {
    this.client = client;
  }

  /**
   * Generuje obsah pro daný kontext
   */
  async generateContent(
    source: ContentSource,
    context: Record<string, unknown>
  ): Promise<GeneratedContent> {
    const contextHash = this.hashContext(context);

    const prompt = `Generuj obsah na základě:

Zdroj dat:
${JSON.stringify(source.data, null, 2)}

${source.rules ? `Pravidla:\n${source.rules.join('\n')}` : ''}

Kontext:
${JSON.stringify(context, null, 2)}

Vrať JSON:
{
  "title": "...",
  "body": "...",
  "meta": {...}
}`;

    const response = await this.client.chatCompletion({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'Jsi AI Content Orchestrator. Generuješ obsah podle strukturovaných dat a pravidel, přizpůsobený kontextu.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);

    return GeneratedContentSchema.parse({
      ...parsed,
      generatedAt: new Date().toISOString(),
      contextHash,
    });
  }

  /**
   * Přepisuje existující obsah pro nový kontext
   */
  async rewriteContent(
    originalContent: string,
    newContext: Record<string, unknown>
  ): Promise<string> {
    const prompt = `Přepiš tento obsah pro nový kontext:

Původní obsah:
${originalContent}

Nový kontext:
${JSON.stringify(newContext, null, 2)}

Přepiš obsah tak, aby odpovídal novému kontextu, ale zachoval klíčové informace.`;

    const response = await this.client.chatCompletion({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'Jsi AI Content Orchestrator. Přepisuješ obsah pro nový kontext.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || originalContent;
  }

  private hashContext(context: Record<string, unknown>): string {
    return JSON.stringify(context);
  }
}
