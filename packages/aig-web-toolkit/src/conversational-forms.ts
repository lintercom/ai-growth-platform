import { z } from 'zod';

/**
 * 5️⃣ Conversational Data Collector
 * 
 * Formulář = rozhovor.
 * AI zjišťuje potřebná data, adaptuje otázky, snižuje kognitivní zátěž.
 */

export const FormFieldSchema = z.object({
  name: z.string(),
  label: z.string(),
  type: z.enum(['text', 'email', 'number', 'select', 'multiselect', 'boolean']),
  required: z.boolean(),
  validation: z.string().optional(),
});

export const ConversationStepSchema = z.object({
  question: z.string(),
  field: z.string(),
  context: z.record(z.unknown()).optional(),
  suggestedAnswers: z.array(z.string()).optional(),
});

export type FormField = z.infer<typeof FormFieldSchema>;
export type ConversationStep = z.infer<typeof ConversationStepSchema>;

export class ConversationalDataCollector {
  private fields: FormField[];
  private collectedData: Map<string, unknown> = new Map();

  constructor(fields: FormField[]) {
    this.fields = fields;
  }

  /**
   * Vytvoří další otázku na základě dosud sebraných dat
   */
  getNextQuestion(): ConversationStep | null {
    const remainingFields = this.fields.filter(f => !this.collectedData.has(f.name));

    if (remainingFields.length === 0) {
      return null;
    }

    const nextField = remainingFields[0]!;

    // AI by zde mohlo rozhodnout pořadí otázek na základě kontextu
    const question = this.generateQuestion(nextField);

    return {
      question,
      field: nextField.name,
      context: Object.fromEntries(this.collectedData),
      suggestedAnswers: nextField.type === 'select' ? [] : undefined,
    };
  }

  /**
   * Zpracuje odpověď uživatele
   */
  processAnswer(fieldName: string, answer: unknown): { valid: boolean; error?: string } {
    const field = this.fields.find(f => f.name === fieldName);
    if (!field) {
      return { valid: false, error: `Unknown field: ${fieldName}` };
    }

    // Validace by mohla být AI-powered
    if (field.required && (answer === null || answer === undefined || answer === '')) {
      return { valid: false, error: `${field.label} je povinné` };
    }

    this.collectedData.set(fieldName, answer);
    return { valid: true };
  }

  /**
   * Vrátí sebraná data
   */
  getCollectedData(): Record<string, unknown> {
    return Object.fromEntries(this.collectedData);
  }

  /**
   * Kontroluje, jestli jsou všechna data sebraná
   */
  isComplete(): boolean {
    return this.fields.every(f => !f.required || this.collectedData.has(f.name));
  }

  private generateQuestion(field: FormField): string {
    // V produkci by to bylo AI-powered na základě kontextu
    if (field.type === 'email') {
      return `Jaká je vaše e-mailová adresa?`;
    }
    if (field.type === 'number') {
      return `Zadejte hodnotu pro ${field.label.toLowerCase()}:`;
    }
    return field.label;
  }
}
