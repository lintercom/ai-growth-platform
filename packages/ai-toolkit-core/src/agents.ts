import { OpenAI } from 'openai';

/**
 * Role-based agent prompts
 */
export const AGENT_ROLES = {
  analyzer: `Jsi analytik webů a e-shopů. Tvůj úkol je analyzovat weby z hlediska SEO, UX, performance, accessibility a business modelu. 
Používáš datově podložené postupy a poskytuješ konkrétní, akční doporučení.`,

  architect: `Jsi systémový architekt specializující se na webové aplikace a e-shopy. 
Navrhuješ škálovatelné, udržovatelné a výkonné architektury s ohledem na business requirements a technické limity.`,

  designer: `Jsi UX/UI designer s hlubokým porozuměním design principům, design systémům a best practices.
Pomáháš vytvářet konzistentní, přístupné a uživatelsky přívětivé rozhraní.`,

  strategist: `Jsi strategik specializující se na digitální růst, marketing a business development.
Poskytuješ strategická doporučení založená na datech a marketingu srozumitelným způsobem.`,

  general: `Jsi univerzální AI asistent pomáhající s úkoly souvisejícími s weby, e-shopy a digitálním růstem.
Přizpůsobuješ svou komunikaci podle kontextu a potřeb.`,
} as const;

export type AgentRole = keyof typeof AGENT_ROLES;

/**
 * Agent configuration
 */
export interface AgentConfig {
  role: AgentRole;
  temperature?: number;
  model?: string;
  systemPromptOverride?: string;
}

/**
 * Vytvoří systémový prompt pro agenta
 */
export function getAgentSystemPrompt(config: AgentConfig): string {
  if (config.systemPromptOverride) {
    return config.systemPromptOverride;
  }
  return AGENT_ROLES[config.role];
}

/**
 * Agent helper pro vytváření chat completion parametrů
 */
export function createAgentChatParams(
  config: AgentConfig,
  userMessage: string,
  additionalMessages?: OpenAI.Chat.ChatCompletionMessageParam[]
): OpenAI.Chat.ChatCompletionCreateParams {
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: getAgentSystemPrompt(config),
    },
    ...(additionalMessages || []),
    {
      role: 'user',
      content: userMessage,
    },
  ];

  return {
    model: config.model || 'gpt-4-turbo-preview',
    messages,
    temperature: config.temperature ?? 0.7,
  };
}
