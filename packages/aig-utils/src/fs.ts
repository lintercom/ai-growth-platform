import { mkdir, writeFile, readFile, readdir, appendFile } from 'node:fs/promises';
import { existsSync, statSync } from 'node:fs';
import { dirname } from 'node:path';

/**
 * Zajistí existenci adresáře (vytvoří pokud neexistuje)
 */
export async function ensureDir(path: string): Promise<void> {
  if (!existsSync(path)) {
    await mkdir(path, { recursive: true });
  }
}

/**
 * Zajistí existenci nadřazeného adresáře souboru
 */
export async function ensureFileDir(filePath: string): Promise<void> {
  await ensureDir(dirname(filePath));
}

/**
 * Zapíše JSON soubor
 */
export async function writeJsonFile(filePath: string, data: unknown): Promise<void> {
  await ensureFileDir(filePath);
  await writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * Načte JSON soubor
 */
export async function readJsonFile<T = unknown>(filePath: string): Promise<T> {
  const content = await readFile(filePath, 'utf-8');
  return JSON.parse(content) as T;
}

/**
 * Zkontroluje jestli soubor existuje
 */
export function fileExists(filePath: string): boolean {
  return existsSync(filePath);
}

/**
 * Zkontroluje jestli adresář existuje
 */
export function dirExists(dirPath: string): boolean {
  return existsSync(dirPath) && statSync(dirPath).isDirectory();
}

/**
 * Načte obsah adresáře
 */
export async function listDir(dirPath: string): Promise<string[]> {
  if (!dirExists(dirPath)) {
    return [];
  }
  return readdir(dirPath);
}

/**
 * Přidá řádek do JSONL souboru
 */
export async function appendJsonl(filePath: string, data: unknown): Promise<void> {
  await ensureFileDir(filePath);
  const line = JSON.stringify(data) + '\n';
  await appendFile(filePath, line, 'utf-8');
}
