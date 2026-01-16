import type {
  StorageHealth,
  EventSinkHealth,
  VectorStoreHealth,
  Artifact,
  UserEvent,
  EventAggregateQuery,
  EventAggregateResult,
  VectorDocument,
  VectorQuery,
  VectorQueryResult,
} from '@aig/schemas';

/**
 * StorageAdapter - ukládání projektů, runů, artefaktů
 */
export interface StorageAdapter {
  /**
   * Inicializace adapteru
   */
  init(): Promise<void>;

  /**
   * Health check
   */
  healthCheck(): Promise<StorageHealth>;

  /**
   * Načte projekt
   */
  loadProject(projectId: string): Promise<Record<string, unknown>>;

  /**
   * Uloží projekt
   */
  saveProject(projectId: string, data: Record<string, unknown>): Promise<void>;

  /**
   * Vytvoří nový run
   */
  createRun(projectId: string, runId: string, metadata: Record<string, unknown>): Promise<void>;

  /**
   * Vrátí seznam runů pro projekt
   */
  listRuns(projectId: string): Promise<string[]>;

  /**
   * Uloží artefakt
   */
  saveArtifact(
    projectId: string,
    runId: string,
    artifactType: string,
    artifact: Artifact
  ): Promise<void>;

  /**
   * Načte artefakt
   */
  loadArtifact(
    projectId: string,
    runId: string,
    artifactType: string
  ): Promise<Artifact | null>;

  /**
   * Přidá záznam do audit logu
   */
  appendAuditLog(
    projectId: string,
    runId: string,
    entry: Record<string, unknown>
  ): Promise<void>;

  /**
   * Uloží lead (stub pro budoucí rozšíření)
   */
  saveLead?(projectId: string, lead: Record<string, unknown>): Promise<void>;

  /**
   * Uloží order (stub pro budoucí rozšíření)
   */
  saveOrder?(projectId: string, order: Record<string, unknown>): Promise<void>;
}

/**
 * EventSinkAdapter - event tracking a agregace
 */
export interface EventSinkAdapter {
  /**
   * Inicializace adapteru
   */
  init(): Promise<void>;

  /**
   * Health check
   */
  healthCheck(): Promise<EventSinkHealth>;

  /**
   * Emit event
   */
  emit(event: UserEvent): Promise<void>;

  /**
   * Emit batch events
   */
  emitBatch(events: UserEvent[]): Promise<void>;

  /**
   * Flush pending events (no-op pro většinu adapterů)
   */
  flush(): Promise<void>;

  /**
   * Získá agregace (pokud podporováno)
   */
  getAggregates?(query: EventAggregateQuery): Promise<EventAggregateResult>;
}

/**
 * VectorStoreAdapter - vektorové vyhledávání
 */
export interface VectorStoreAdapter {
  /**
   * Inicializace adapteru
   */
  init(): Promise<void>;

  /**
   * Health check
   */
  healthCheck(): Promise<VectorStoreHealth>;

  /**
   * Uloží nebo aktualizuje dokument
   */
  upsert(projectId: string, document: VectorDocument): Promise<void>;

  /**
   * Uloží nebo aktualizuje batch dokumentů
   */
  upsertBatch(projectId: string, documents: VectorDocument[]): Promise<void>;

  /**
   * Vyhledá dokumenty
   */
  query(projectId: string, query: VectorQuery): Promise<VectorQueryResult>;

  /**
   * Smaže dokument
   */
  delete(projectId: string, documentId: string): Promise<void>;
}
