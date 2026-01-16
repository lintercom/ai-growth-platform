import { z } from 'zod';
import { OpenAIClient } from '@aig/core';

/**
 * 1️⃣ Intent-Based Router
 * 
 * Navigace podle záměru, ne URL.
 * AI rozhoduje, kam má uživatel jít.
 * URL je až sekundární artefakt.
 */

export const RouteSchema = z.object({
  path: z.string(),
  intent: z.string(),
  description: z.string(),
  context: z.record(z.unknown()).optional(),
});

export type Route = z.infer<typeof RouteSchema>;

export interface IntentRouterConfig {
  routes: Route[];
  defaultRoute?: string;
}

export class IntentBasedRouter {
  private client: OpenAIClient;
  private routes: Map<string, Route> = new Map();

  constructor(client: OpenAIClient, config: IntentRouterConfig) {
    this.client = client;
    config.routes.forEach(route => {
      this.routes.set(route.intent, route);
    });
  }

  /**
   * Analyzuje záměr uživatele a vrátí vhodnou route
   */
  async resolveIntent(userInput: string, context?: Record<string, unknown>): Promise<Route> {
    const routesList = Array.from(this.routes.values())
      .map(r => `- "${r.intent}": ${r.description} (path: ${r.path})`)
      .join('\n');

    const prompt = `Uživatel řekl: "${userInput}"

Dostupné routy:
${routesList}

${context ? `Kontext: ${JSON.stringify(context)}` : ''}

Urči, kterou routu by uživatel měl použít. Vrať JSON:
{
  "intent": "název_intentu",
  "confidence": 0.0-1.0,
  "reasoning": "proč tento intent"
}`;

    const response = await this.client.chatCompletion({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'Jsi Intent-Based Router. Pomáháš uživatelům najít správnou část webu podle jejich záměru, ne URL.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);

    const route = this.routes.get(parsed.intent);
    if (!route) {
      throw new Error(`Intent "${parsed.intent}" not found`);
    }

    return route;
  }

  /**
   * Generuje URL z intentu (sekundární artefakt)
   */
  getUrlFromIntent(intent: string, params?: Record<string, string>): string {
    const route = this.routes.get(intent);
    if (!route) {
      throw new Error(`Intent "${intent}" not found`);
    }

    let url = route.path;
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url = url.replace(`:${key}`, value);
      });
    }

    return url;
  }
}
