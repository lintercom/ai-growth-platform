import { z } from 'zod';

/**
 * Health check výsledky pro adaptéry
 */
export const StorageHealthSchema = z.object({
  status: z.enum(['healthy', 'degraded', 'unhealthy']),
  message: z.string().optional(),
  details: z.record(z.unknown()).optional(),
});

export const EventSinkHealthSchema = z.object({
  status: z.enum(['healthy', 'degraded', 'unhealthy']),
  message: z.string().optional(),
  pendingEvents: z.number().optional(),
  details: z.record(z.unknown()).optional(),
});

export const VectorStoreHealthSchema = z.object({
  status: z.enum(['healthy', 'degraded', 'unhealthy']),
  message: z.string().optional(),
  documentCount: z.number().optional(),
  details: z.record(z.unknown()).optional(),
});

export type StorageHealth = z.infer<typeof StorageHealthSchema>;
export type EventSinkHealth = z.infer<typeof EventSinkHealthSchema>;
export type VectorStoreHealth = z.infer<typeof VectorStoreHealthSchema>;

/**
 * Artifact - společný tvar pro všechny artefakty
 */
export const ArtifactSchema = z.object({
  type: z.string(),
  schemaVersion: z.string().default('1.0'),
  generatedAt: z.string().datetime(),
  payload: z.record(z.unknown()),
});

export type Artifact = z.infer<typeof ArtifactSchema>;

/**
 * UserEvent - event pro event sink
 */
export const UserEventSchema = z.object({
  eventId: z.string().optional(),
  eventType: z.string(),
  timestamp: z.string().datetime(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  projectId: z.string().optional(),
  runId: z.string().optional(),
  properties: z.record(z.unknown()).default({}),
});

export type UserEvent = z.infer<typeof UserEventSchema>;

/**
 * EventAggregateQuery - dotaz na agregace
 */
export const EventAggregateQuerySchema = z.object({
  projectId: z.string(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  eventTypes: z.array(z.string()).optional(),
  groupBy: z.array(z.string()).optional(),
  metrics: z.array(z.enum(['count', 'sum', 'avg', 'min', 'max'])).default(['count']),
});

export type EventAggregateQuery = z.infer<typeof EventAggregateQuerySchema>;

/**
 * EventAggregateResult - výsledek agregace
 */
export const EventAggregateResultSchema = z.object({
  query: EventAggregateQuerySchema,
  results: z.array(z.object({
    date: z.string(),
    eventType: z.string(),
    metrics: z.record(z.number()),
    groups: z.record(z.string()).optional(),
  })),
  totalCount: z.number(),
});

export type EventAggregateResult = z.infer<typeof EventAggregateResultSchema>;

/**
 * VectorDocument - dokument ve vektorovém úložišti
 */
export const VectorDocumentSchema = z.object({
  id: z.string(),
  text: z.string(),
  metadata: z.record(z.unknown()).default({}),
  embedding: z.array(z.number()).optional(),
});

export type VectorDocument = z.infer<typeof VectorDocumentSchema>;

/**
 * VectorQuery - dotaz na vektorové vyhledávání
 */
export const VectorQuerySchema = z.object({
  text: z.string(),
  topK: z.number().default(5),
  filter: z.record(z.unknown()).optional(),
  threshold: z.number().min(0).max(1).optional(),
});

export type VectorQuery = z.infer<typeof VectorQuerySchema>;

/**
 * VectorQueryResult - výsledek vektorového dotazu
 */
export const VectorQueryResultSchema = z.object({
  query: VectorQuerySchema,
  results: z.array(z.object({
    document: VectorDocumentSchema,
    score: z.number(),
  })),
  totalFound: z.number(),
});

export type VectorQueryResult = z.infer<typeof VectorQueryResultSchema>;
