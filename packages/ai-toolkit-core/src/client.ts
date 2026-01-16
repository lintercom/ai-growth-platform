import OpenAI from 'openai';
import { BudgetTracker } from './budget.js';
import { AuditLogger } from './audit.js';

export interface OpenAIClientOptions {
  apiKey: string;
  budgetTracker?: BudgetTracker;
  auditLogger?: AuditLogger;
}

/**
 * Wrapper pro OpenAI client s budget trackingem a audit loggingem
 */
export class OpenAIClient {
  private client: OpenAI;
  private budgetTracker?: BudgetTracker;
  private auditLogger?: AuditLogger;

  constructor(options: OpenAIClientOptions) {
    this.client = new OpenAI({ apiKey: options.apiKey });
    this.budgetTracker = options.budgetTracker;
    this.auditLogger = options.auditLogger;
  }

  /**
   * Ověří API klíč levným requestem
   */
  async verifyApiKey(): Promise<boolean> {
    try {
      this.auditLogger?.info('verify_api_key', {});
      const response = await this.client.models.list();
      this.auditLogger?.info('verify_api_key_success', {});
      return Array.isArray(response.data);
    } catch (error) {
      this.auditLogger?.error('verify_api_key', error instanceof Error ? error.message : String(error), {});
      return false;
    }
  }

  /**
   * Chat completion s automatic budget tracking
   */
  async chatCompletion(
    params: OpenAI.Chat.ChatCompletionCreateParams
  ): Promise<OpenAI.Chat.ChatCompletion> {
    const model = params.model || 'gpt-3.5-turbo';
    
    this.auditLogger?.info('chat_completion_request', {
      model,
      messagesCount: params.messages?.length || 0,
      temperature: params.temperature,
    });

    try {
      // Check budget before request
      if (this.budgetTracker) {
        const budgetCheck = this.budgetTracker.checkBudget();
        if (!budgetCheck.allowed) {
          throw new Error(`Budget exceeded: $${this.budgetTracker.getTotalCost().toFixed(4)} (limit: $${this.budgetTracker.checkBudget().remaining})`);
        }
      }

      const response = await this.client.chat.completions.create({
        ...params,
        stream: false,
      });

      // Track usage
      if (response.usage && this.budgetTracker) {
        this.budgetTracker.addUsage(
          model,
          response.usage.prompt_tokens,
          response.usage.completion_tokens
        );
      }

      this.auditLogger?.info('chat_completion_success', {
        model,
        inputTokens: response.usage?.prompt_tokens,
        outputTokens: response.usage?.completion_tokens,
        totalTokens: response.usage?.total_tokens,
      });

      return response;
    } catch (error) {
      this.auditLogger?.error(
        'chat_completion_error',
        error instanceof Error ? error.message : String(error),
        { model }
      );
      throw error;
    }
  }

  /**
   * Embeddings s automatic budget tracking
   */
  async embeddings(
    params: OpenAI.Embeddings.EmbeddingCreateParams
  ): Promise<OpenAI.Embeddings.CreateEmbeddingResponse> {
    const model = params.model || 'text-embedding-ada-002';

    this.auditLogger?.info('embeddings_request', {
      model,
      inputCount: params.input?.length || 0,
    });

    try {
      const response = await this.client.embeddings.create(params);

      // Track usage (embeddings mají jen input tokens)
      if (response.usage && this.budgetTracker) {
        this.budgetTracker.addUsage(model, response.usage.total_tokens, 0);
      }

      this.auditLogger?.info('embeddings_success', {
        model,
        tokens: response.usage?.total_tokens,
      });

      return response;
    } catch (error) {
      this.auditLogger?.error(
        'embeddings_error',
        error instanceof Error ? error.message : String(error),
        { model }
      );
      throw error;
    }
  }

  /**
   * Getter pro interní OpenAI client (pro pokročilé použití)
   */
  getClient(): OpenAI {
    return this.client;
  }
}
