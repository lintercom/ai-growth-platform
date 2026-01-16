import type { EventSinkAdapter } from './interfaces.js';
import type { EventSinkHealth, UserEvent, EventAggregateQuery, EventAggregateResult } from '@aig/schemas';
import { EventSinkHealthSchema, EventAggregateResultSchema } from '@aig/schemas';
import { getEventsDir, ensureDir, appendJsonl, fileExists, readTextFile } from '@aig/utils';

/**
 * FileEventSinkAdapter - ukládání eventů do JSONL souborů
 */
export class FileEventSinkAdapter implements EventSinkAdapter {
  async init(): Promise<void> {
    // Events adresáře se vytvoří při prvním emit()
  }

  async healthCheck(): Promise<EventSinkHealth> {
    try {
      return EventSinkHealthSchema.parse({
        status: 'healthy',
        message: 'File event sink ready',
        pendingEvents: 0,
      });
    } catch (error) {
      return EventSinkHealthSchema.parse({
        status: 'unhealthy',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async emit(event: UserEvent): Promise<void> {
    await this.emitBatch([event]);
  }

  async emitBatch(events: UserEvent[]): Promise<void> {
    if (events.length === 0) {
      return;
    }

    // Group events by project and date
    const grouped = new Map<string, UserEvent[]>();
    
    for (const event of events) {
      const projectId = event.projectId || 'default';
      const date = new Date(event.timestamp).toISOString().split('T')[0] || new Date().toISOString().split('T')[0];
      const key = `${projectId}/${date}`;
      
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(event);
    }

    // Write to JSONL files
    for (const [key, projectEvents] of grouped) {
      const [projectId, date] = key.split('/');
      const eventsDir = getEventsDir(projectId);
      await ensureDir(eventsDir);

      const filePath = `${eventsDir}/${date}.jsonl`;
      
      // Ensure event has ID if missing
      for (const event of projectEvents) {
        if (!event.eventId) {
          (event as UserEvent & { eventId: string }).eventId = `evt-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        }
        
        await appendJsonl(filePath, event);
      }
    }
  }

  async flush(): Promise<void> {
    // No-op pro file adapter - vše je okamžitě zapsáno
  }

  async getAggregates(query: EventAggregateQuery): Promise<EventAggregateResult> {
    const results: EventAggregateResult['results'] = [];
    let totalCount = 0;

    const eventsDir = getEventsDir(query.projectId);
    const startDate = new Date(query.startDate);
    const endDate = new Date(query.endDate);

    // Iterate through date range
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const filePath = `${eventsDir}/${dateStr}.jsonl`;

      if (fileExists(filePath)) {
        const content = await readTextFile(filePath);
        const lines = content.trim().split('\n').filter(Boolean);
        
        const events = lines
          .map((line: string): UserEvent | null => {
            try {
              return JSON.parse(line) as UserEvent;
            } catch {
              return null;
            }
          })
          .filter((event: UserEvent | null): event is UserEvent => event !== null);

        // Filter by event types if specified
        const filteredEvents = query.eventTypes && query.eventTypes.length > 0
          ? events.filter((e: UserEvent) => query.eventTypes!.includes(e.eventType))
          : events;

        // Group by event type
        const byType = new Map<string, UserEvent[]>();
        for (const event of filteredEvents) {
          if (!byType.has(event.eventType)) {
            byType.set(event.eventType, []);
          }
          byType.get(event.eventType)!.push(event);
        }

        // Create aggregate results
        for (const [eventType, typeEvents] of byType) {
          const count = typeEvents.length;
          totalCount += count;

          results.push({
            date: dateStr,
            eventType,
            metrics: {
              count,
            },
          });
        }
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return EventAggregateResultSchema.parse({
      query,
      results,
      totalCount,
    });
  }
}
