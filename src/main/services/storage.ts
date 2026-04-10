import { app } from 'electron';
import { join } from 'path';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { APP_DATA_DIR } from '../../shared/constants';

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
