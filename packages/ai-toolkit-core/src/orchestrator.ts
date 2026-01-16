import { OpenAIClient } from './client.js';
import { BudgetTracker } from './budget.js';
import { AuditLogger } from './audit.js';
import { AgentConfig, createAgentChatParams } from './agents.js';

export interface OrchestratorOptions {
  client: OpenAIClient;
  budgetTracker: BudgetTracker;
  auditLogger: AuditLogger;
}

export type WorkflowStep<TInput = unknown, TOutput = unknown> = {
  name: string;
  execute: (input: TInput, context: WorkflowContext) => Promise<TOutput>;
};

export interface WorkflowContext {
  client: OpenAIClient;
  budgetTracker: BudgetTracker;
  auditLogger: AuditLogger;
  state: Map<string, unknown>;
}

/**
 * Orchestrator pro sekvenční workflow execution
 */
export class Orchestrator {
  private client: OpenAIClient;
  private budgetTracker: BudgetTracker;
  private auditLogger: AuditLogger;

  constructor(options: OrchestratorOptions) {
    this.client = options.client;
    this.budgetTracker = options.budgetTracker;
    this.auditLogger = options.auditLogger;
  }

  /**
   * Spustí sekvenční workflow
   */
  async runWorkflow<TInput = unknown, TOutput = unknown>(
    steps: WorkflowStep[],
    initialInput?: TInput
  ): Promise<TOutput> {
    this.auditLogger.info('workflow_start', {
      stepsCount: steps.length,
      stepNames: steps.map(s => s.name),
    });

    const context: WorkflowContext = {
      client: this.client,
      budgetTracker: this.budgetTracker,
      auditLogger: this.auditLogger,
      state: new Map(),
    };

    let currentInput: unknown = initialInput;

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      
      this.auditLogger.info('workflow_step_start', {
        stepName: step.name,
        stepIndex: i,
      });

      try {
        // Check budget before each step
        const budgetCheck = this.budgetTracker.checkBudget();
        if (!budgetCheck.allowed) {
          throw new Error(`Budget exceeded at step "${step.name}": $${this.budgetTracker.getTotalCost().toFixed(4)}`);
        }

        currentInput = await step.execute(currentInput, context);

        this.auditLogger.info('workflow_step_complete', {
          stepName: step.name,
          stepIndex: i,
        });
      } catch (error) {
        this.auditLogger.error(
          'workflow_step_error',
          error instanceof Error ? error.message : String(error),
          {
            stepName: step.name,
            stepIndex: i,
          }
        );
        throw error;
      }
    }

    this.auditLogger.info('workflow_complete', {
      totalCost: this.budgetTracker.getTotalCost(),
    });

    return currentInput as TOutput;
  }

  /**
   * Helper pro vytvoření AI-powered stepu
   */
  createAIStep<TInput = unknown, TOutput = unknown>(
    name: string,
    config: AgentConfig,
    promptBuilder: (input: TInput, context: WorkflowContext) => string | Promise<string>
  ): WorkflowStep<TInput, TOutput> {
    return {
      name,
      execute: async (input: TInput, context: WorkflowContext): Promise<TOutput> => {
        const userPrompt = await promptBuilder(input, context);
        const params = createAgentChatParams(config, userPrompt);

        const response = await context.client.chatCompletion(params);
        const content = response.choices[0]?.message?.content;

        if (!content) {
          throw new Error(`No content in response for step "${name}"`);
        }

        // Try to parse as JSON if possible, otherwise return as string
        try {
          return JSON.parse(content) as TOutput;
        } catch {
          return content as TOutput;
        }
      },
    };
  }
}
