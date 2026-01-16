import { OpenAIClient } from './client.js';

/**
 * Ověří OpenAI API klíč
 */
export async function verifyApiKey(apiKey: string): Promise<boolean> {
  const client = new OpenAIClient(apiKey);
  return client.verifyApiKey();
}
