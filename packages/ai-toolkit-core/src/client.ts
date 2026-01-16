import OpenAI from 'openai';

/**
 * Základní wrapper pro OpenAI client (stub pro PART 1)
 */
export class OpenAIClient {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  /**
   * Ověří API klíč levným requestem
   */
  async verifyApiKey(): Promise<boolean> {
    try {
      // Minimální request pro ověření klíče
      const response = await this.client.models.list();
      return Array.isArray(response.data);
    } catch (error) {
      return false;
    }
  }

  /**
   * Getter pro interní OpenAI client (pro budoucí použití)
   */
  getClient(): OpenAI {
    return this.client;
  }
}
