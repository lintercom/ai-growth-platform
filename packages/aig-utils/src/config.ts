import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { getConfigDir, getConfigPath } from './paths.js';
import { z } from 'zod';

const ConfigSchema = z.object({
  openaiApiKey: z.string().optional(),
  defaultMarket: z.string().optional(),
  defaultBudget: z.number().optional(),
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
