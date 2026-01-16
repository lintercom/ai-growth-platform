import { z } from 'zod';
import { OpenAIClient } from '@aig/core';

/**
 * 6️⃣ AI Product Reasoner
 * 
 * Produkty nejsou list, ale možnosti řešení.
 * AI mapuje potřebu → vhodný produkt, vysvětluje trade-offs, kombinuje produkty.
 */

export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  attributes: z.record(z.unknown()),
  useCases: z.array(z.string()),
  price: z.number().optional(),
});

export const ProductRecommendationSchema = z.object({
  products: z.array(ProductSchema),
  reasoning: z.string(),
  tradeOffs: z.array(z.object({
    productId: z.string(),
    pros: z.array(z.string()),
    cons: z.array(z.string()),
  })),
  combinations: z.array(z.object({
    products: z.array(z.string()),
    reason: z.string(),
  })).optional(),
});

export type Product = z.infer<typeof ProductSchema>;
export type ProductRecommendation = z.infer<typeof ProductRecommendationSchema>;

export class AIProductReasoner {
  private client: OpenAIClient;
  private products: Product[];

  constructor(client: OpenAIClient, products: Product[]) {
    this.client = client;
    this.products = products;
  }

  /**
   * Mapuje potřebu uživatele na vhodné produkty
   */
  async recommendProducts(
    userNeed: string,
    context?: Record<string, unknown>
  ): Promise<ProductRecommendation> {
    const productsSummary = this.products.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      useCases: p.useCases,
    }));

    const prompt = `Uživatel potřebuje: "${userNeed}"

${context ? `Kontext: ${JSON.stringify(context)}` : ''}

Dostupné produkty:
${JSON.stringify(productsSummary, null, 2)}

Doporuč vhodné produkty s vysvětlením, trade-offs a případnými kombinacemi.

Vrať JSON:
{
  "products": [...],
  "reasoning": "...",
  "tradeOffs": [
    {"productId": "...", "pros": [...], "cons": [...]}
  ],
  "combinations": [
    {"products": [...], "reason": "..."}
  ]
}`;

    const response = await this.client.chatCompletion({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'Jsi AI Product Reasoner. Mapuješ potřeby uživatelů na produkty, vysvětluješ trade-offs a navrhuješ kombinace.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.5,
    });

    const content = response.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);

    return ProductRecommendationSchema.parse(parsed);
  }

  /**
   * Vysvětlí, proč je produkt vhodný pro danou potřebu
   */
  async explainFit(productId: string, userNeed: string): Promise<string> {
    const product = this.products.find(p => p.id === productId);
    if (!product) {
      throw new Error(`Product ${productId} not found`);
    }

    const prompt = `Vysvětli, proč je produkt "${product.name}" vhodný pro potřebu: "${userNeed}"

Produkt:
${JSON.stringify(product, null, 2)}

Krátké, srozumitelné vysvětlení.`;

    const response = await this.client.chatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Jsi AI Product Reasoner. Vysvětluješ, proč jsou produkty vhodné pro potřeby uživatelů.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.5,
    });

    return response.choices[0]?.message?.content || '';
  }
}
