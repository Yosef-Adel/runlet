import type { IpcMain } from 'electron';
import { dialog } from 'electron';
import { readFile, writeFile } from 'fs/promises';
import { IPC_CHANNELS, SNIPPETS_FILE } from '../../shared/constants';
import { loadJson, saveJson } from '../services/storage';
import type { Snippet } from '../../shared/types';

export function registerSnippetsHandlers(ipcMain: IpcMain): void {
  ipcMain.handle(IPC_CHANNELS.SNIPPETS_LOAD, async () => {
    const snippets = await loadJson<Snippet[]>(SNIPPETS_FILE, []);
    return { snippets };
  });

  ipcMain.handle(IPC_CHANNELS.SNIPPETS_SAVE, async (_event, payload: { snippets: Snippet[] }) => {
    await saveJson(SNIPPETS_FILE, payload.snippets);
    return { success: true };
  });

  ipcMain.handle(IPC_CHANNELS.SNIPPETS_EXPORT, async (_event, payload: { snippets: Snippet[] }) => {
    const result = await dialog.showSaveDialog({
      title: 'Export Snippets',
      defaultPath: 'snippets.json',
      filters: [{ name: 'JSON', extensions: ['json'] }],
    });

    if (result.canceled || !result.filePath) {
      return { success: false };
    }

    const exportData = payload.snippets.map(({ name, description, body }) => ({
      name,
      description,
      body,
    }));

    await writeFile(result.filePath, JSON.stringify(exportData, null, 2), 'utf-8');
    return { success: true, path: result.filePath };
  });

  ipcMain.handle(IPC_CHANNELS.SNIPPETS_IMPORT, async () => {
    const result = await dialog.showOpenDialog({
      title: 'Import Snippets',
      filters: [{ name: 'JSON', extensions: ['json'] }],
      properties: ['openFile'],
    });

    if (result.canceled || result.filePaths.length === 0) {
      return { success: false, snippets: [] };
    }

    try {
      const raw = await readFile(result.filePaths[0], 'utf-8');
      const imported = JSON.parse(raw) as Array<{ name: string; description: string; body: string }>;

      if (!Array.isArray(imported)) {
        return { success: false, snippets: [] };
      }

      return { success: true, snippets: imported };
    } catch {
      return { success: false, snippets: [] };
    }
  });
}
