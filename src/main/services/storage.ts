import { app } from 'electron';
import { join, basename } from 'path';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { APP_DATA_DIR } from '../../shared/constants';

// Only allow known JSON data files — prevents path traversal
const ALLOWED_FILES = new Set([
  'settings.json',
  'tabs.json',
  'snippets.json',
  'env-vars.json',
  'packages.json',
]);

function validateFilename(filename: string): void {
  const base = basename(filename);
  if (base !== filename || !ALLOWED_FILES.has(filename)) {
    throw new Error(`Access denied: ${filename}`);
  }
}

function getDataDir(): string {
  return join(app.getPath('home'), APP_DATA_DIR);
}

async function ensureDataDir(): Promise<string> {
  const dir = getDataDir();
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
  return dir;
}

export async function loadJson<T>(filename: string, fallback: T): Promise<T> {
  try {
    validateFilename(filename);
    const dir = await ensureDataDir();
    const filePath = join(dir, filename);
    if (!existsSync(filePath)) {
      return fallback;
    }
    const raw = await readFile(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function saveJson(filename: string, data: unknown): Promise<void> {
  validateFilename(filename);
  const dir = await ensureDataDir();
  const filePath = join(dir, filename);
  await writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export function getPackagesDir(): string {
  return join(getDataDir(), 'node_modules');
}

export async function ensurePackagesDir(): Promise<string> {
  const dir = getPackagesDir();
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
  return dir;
}

export { getDataDir };
