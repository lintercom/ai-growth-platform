import type { EventSinkAdapter } from './interfaces.js';
import type { EventSinkHealth, UserEvent } from '@aig/schemas';
import { EventSinkHealthSchema } from '@aig/schemas';
import type { AdapterConfig } from './factory.js';

/**
 * ExternalEventSinkAdapter - HTTP webhook placeholder
 */
export class ExternalEventSinkAdapter implements EventSinkAdapter {
  private endpoint: string;
  private apiKey?: string;
  private pendingEvents: UserEvent[] = [];

  constructor(config?: AdapterConfig['external']) {
    if (!config?.endpoint) {
      throw new Error('External endpoint is required');
    }
    this.endpoint = config.endpoint;
    this.apiKey = config.apiKey;
  }

  async init(): Promise<void> {
    // No-op - endpoint is validated in constructor
  }

  async healthCheck(): Promise<EventSinkHealth> {
    try {
      // Simple health check - try to ping endpoint
      const response = await fetch(this.endpoint, {
        method: 'HEAD',
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(5000), // 5s timeout
      });

      return EventSinkHealthSchema.parse({
        status: response.ok ? 'healthy' : 'degraded',
        message: `External endpoint responded with ${response.status}`,
        pendingEvents: this.pendingEvents.length,
      });
    } catch (error) {
      return EventSinkHealthSchema.parse({
        status: 'unhealthy',
        message: error instanceof Error ? error.message : String(error),
        pendingEvents: this.pendingEvents.length,
      });
    }
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    return headers;
  }

  private async sendWithRetry(events: UserEvent[], retries = 3): Promise<void> {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const response = await fetch(this.endpoint, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({
            events: events.map(e => ({
              ...e,
              // Redact sensitive data
              properties: this.redactSensitive(e.properties),
            })),
          }),
          signal: AbortSignal.timeout(10000), // 10s timeout
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // Success - clear pending events
        this.pendingEvents = this.pendingEvents.filter(e => !events.includes(e));
        return;
      } catch (error) {
        if (attempt === retries - 1) {
          // Last attempt failed - keep events for retry
          this.pendingEvents.push(...events);
          throw error;
        }

        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  private redactSensitive(props: Record<string, unknown>): Record<string, unknown> {
    const redacted = { ...props };
    const sensitiveKeys = ['password', 'apiKey', 'token', 'secret', 'key'];

    for (const key of Object.keys(redacted)) {
      if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
        redacted[key] = '***REDACTED***';
      }
    }

    return redacted;
  }

  async emit(event: UserEvent): Promise<void> {
    await this.emitBatch([event]);
  }

  async emitBatch(events: UserEvent[]): Promise<void> {
    if (events.length === 0) {
      return;
    }

    try {
      await this.sendWithRetry(events);
    } catch (error) {
      // Events are stored in pendingEvents for retry
      throw new Error(`Failed to send events to external endpoint: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async flush(): Promise<void> {
    if (this.pendingEvents.length === 0) {
      return;
    }

    // Retry pending events
    const toRetry = [...this.pendingEvents];
    this.pendingEvents = [];

    try {
      await this.sendWithRetry(toRetry);
    } catch (error) {
      // Put back if still failing
      this.pendingEvents.unshift(...toRetry);
      throw error;
    }
  }
}
