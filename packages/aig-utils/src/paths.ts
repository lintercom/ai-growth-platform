import { homedir } from 'node:os';
import { join } from 'node:path';
import { platform } from 'node:os';

/**
 * Získá cestu k config adresáři podle platformy
 */
export function getConfigDir(): string {
  const os = platform();
  if (os === 'win32') {
    return join(process.env.APPDATA || join(homedir(), 'AppData', 'Roaming'), 'aig');
  }
  return join(homedir(), '.config', 'aig');
}

/**
 * Získá cestu k config souboru
 */
export function getConfigPath(): string {
  return join(getConfigDir(), 'config.json');
}

/**
 * Získá cestu k projektům v aktuálním workspace
 */
export function getProjectsDir(): string {
  return join(process.cwd(), 'projects');
}

/**
 * Získá cestu k projektu
 */
export function getProjectDir(projectName: string): string {
  return join(getProjectsDir(), projectName);
}

/**
 * Získá cestu k runům projektu
 */
export function getRunsDir(projectName: string): string {
  return join(getProjectDir(projectName), 'runs');
}

/**
 * Získá cestu k konkrétnímu runu
 */
export function getRunDir(projectName: string, runId: string): string {
  return join(getRunsDir(projectName), runId);
}

/**
 * Získá cestu k app config adresáři (pro aplikaci, ne uživatelské config)
 */
export function getAppConfigDir(): string {
  return join(getConfigDir(), 'app');
}

/**
 * Získá cestu k artifactům v runu
 */
export function getArtifactsDir(projectName: string, runId: string): string {
  return getRunDir(projectName, runId);
}

/**
 * Získá cestu k eventům projektu
 */
export function getEventsDir(projectName: string): string {
  return join(getProjectDir(projectName), 'events');
}
