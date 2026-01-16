import type { EventSinkAdapter } from './interfaces.js';
import type { EventSinkHealth, UserEvent, EventAggregateQuery, EventAggregateResult } from '@aig/schemas';

/**
 * FileEventSinkAdapter - bude plně implementován v PART 2
 * Pro PART 1 je to pouze placeholder, který hází chybu
 */
export class FileEventSinkAdapter implements EventSinkAdapter {
  async init(): Promise<void> {
    throw new Error('FileEventSinkAdapter not yet implemented (PART 2)');
  }

  async healthCheck(): Promise<EventSinkHealth> {
    throw new Error('FileEventSinkAdapter not yet implemented (PART 2)');
  }

  async emit(_event: UserEvent): Promise<void> {
    throw new Error('FileEventSinkAdapter not yet implemented (PART 2)');
  }

  async emitBatch(_events: UserEvent[]): Promise<void> {
    throw new Error('FileEventSinkAdapter not yet implemented (PART 2)');
  }

  async flush(): Promise<void> {
    throw new Error('FileEventSinkAdapter not yet implemented (PART 2)');
  }

  async getAggregates?(_query: EventAggregateQuery): Promise<EventAggregateResult> {
    throw new Error('FileEventSinkAdapter not yet implemented (PART 2)');
  }
}
