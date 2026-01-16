import { z } from 'zod';

/**
 * 2️⃣ AI State Reasoner
 * 
 * Stav webu není boolean, ale pravděpodobnostní.
 * AI udržuje fázi rozhodování, míru jistoty, kontext uživatele.
 */

export const StateReasoningSchema = z.object({
  phase: z.enum(['exploring', 'considering', 'deciding', 'completed']),
  confidence: z.number().min(0).max(1),
  context: z.record(z.unknown()),
  uncertainties: z.array(z.string()),
  suggestedActions: z.array(z.string()),
});

export type StateReasoning = z.infer<typeof StateReasoningSchema>;

export class AIStateReasoner {
  private state: StateReasoning;

  constructor(initialContext: Record<string, unknown> = {}) {
    this.state = {
      phase: 'exploring',
      confidence: 0.0,
      context: initialContext,
      uncertainties: [],
      suggestedActions: [],
    };
  }

  /**
   * Aktualizuje stav na základě user akce a AI reasoning
   */
  async updateState(
    userAction: string,
    reasoning: (state: StateReasoning) => Promise<Partial<StateReasoning>>
  ): Promise<StateReasoning> {
    const updates = await reasoning(this.state);
    this.state = {
      ...this.state,
      ...updates,
      context: {
        ...this.state.context,
        ...(updates.context || {}),
        lastAction: userAction,
        timestamp: new Date().toISOString(),
      },
    };
    return this.state;
  }

  /**
   * Vrací aktuální stav
   */
  getState(): StateReasoning {
    return { ...this.state };
  }

  /**
   * Zkontroluje, jestli uživatel potřebuje pomoc
   */
  needsAssistance(): boolean {
    return this.state.confidence < 0.3 || this.state.uncertainties.length > 2;
  }
}
