import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { getConfigDir, getConfigPath } from './paths.js';
import { z } from 'zod';

const AdaptersConfigSchema = z.object({
  storage: z.enum(['file', 'mysql', 'postgres']).default('file').optional(),
  eventsink: z.enum(['none', 'file', 'db-aggregate', 'external']).default('none').optional(),
  vectorstore: z.enum(['none', 'local', 'external']).default('none').optional(),
  mysql: z.object({
    url: z.string().optional(),
    host: z.string().optional(),
    port: z.number().optional(),
    user: z.string().optional(),
    password: z.string().optional(),
    database: z.string().optional(),
  }).optional(),
  postgres: z.object({
    url: z.string().optional(),
  }).optional(),
  external: z.object({
    endpoint: z.string().optional(),
    apiKey: z.string().optional(),
    vectorEndpoint: z.string().optional(),
  }).optional(),
});

const ConfigSchema = z.object({
  openaiApiKey: z.string().optional(),
  defaultMarket: z.string().optional(),
  defaultBudget: z.number().optional(),
  adapters: AdaptersConfigSchema.optional(),
});

export type Config = z.infer<typeof ConfigSchema>;

/**
 * Načte config ze souboru
 */
export async function loadConfig(): Promise<Config> {
  const configPath = getConfigPath();
  
  if (!existsSync(configPath)) {
    return {};
  }

  try {
    const content = await readFile(configPath, 'utf-8');
    const parsed = JSON.parse(content);
    return ConfigSchema.parse(parsed);
  } catch (error) {
    throw new Error(`Failed to load config: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Uloží config do souboru
 */
export async function saveConfig(config: Partial<Config>): Promise<void> {
  const configDir = getConfigDir();
  const configPath = getConfigPath();

  // Vytvoř adresář pokud neexistuje
  if (!existsSync(configDir)) {
    await mkdir(configDir, { recursive: true });
  }

  // Načti existující config a merge
  const existing = await loadConfig().catch(() => ({}));
  const merged = { ...existing, ...config };

  // Validuj a ulož
  const validated = ConfigSchema.parse(merged);
  await writeFile(configPath, JSON.stringify(validated, null, 2), 'utf-8');
}

/**
 * Získá hodnotu z configu
 */
export async function getConfigValue<K extends keyof Config>(key: K): Promise<Config[K] | undefined> {
  const config = await loadConfig();
  return config[key];
}

/**
 * Nastaví hodnotu v configu
 */
export async function setConfigValue<K extends keyof Config>(key: K, value: Config[K]): Promise<void> {
  await saveConfig({ [key]: value });
}

/**
 * Získá hodnotu z nested configu (např. adapters.storage)
 */
export async function getNestedConfigValue(path: string): Promise<unknown> {
  const config = await loadConfig();
  const parts = path.split('.');
  let value: unknown = config;
  
  for (const part of parts) {
    if (value && typeof value === 'object' && part in value) {
      value = (value as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  
  return value;
}

/**
 * Nastaví hodnotu v nested configu (např. adapters.storage)
 */
export async function setNestedConfigValue(path: string, value: unknown): Promise<void> {
  const config = await loadConfig();
  const parts = path.split('.');
  const lastPart = parts.pop();
  
  if (!lastPart) {
    throw new Error('Invalid config path');
  }
  
  let current: Record<string, unknown> = config;
  
  for (const part of parts) {
    if (!(part in current) || typeof current[part] !== 'object' || current[part] === null) {
      current[part] = {};
    }
    current = current[part] as Record<string, unknown>;
  }
  
  current[lastPart] = value;
  await saveConfig(config);
}
