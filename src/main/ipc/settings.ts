import type { IpcMain } from 'electron';
import { loadJson, saveJson } from '../services/storage';
import { IPC_CHANNELS, DEFAULT_SETTINGS, SETTINGS_FILE, TABS_FILE } from '../../shared/constants';
import type { Settings, Tab } from '../../shared/types';

export function registerSettingsHandlers(ipcMain: IpcMain): void {
  ipcMain.handle(IPC_CHANNELS.SETTINGS_LOAD, async () => {
    return loadJson<Settings>(SETTINGS_FILE, DEFAULT_SETTINGS);
  });

  ipcMain.handle(IPC_CHANNELS.SETTINGS_SAVE, async (_event, settings: Settings) => {
    await saveJson(SETTINGS_FILE, settings);
    return { success: true };
  });

  ipcMain.handle(IPC_CHANNELS.TABS_LOAD, async () => {
    return loadJson<Tab[]>(TABS_FILE, []);
  });

  ipcMain.handle(IPC_CHANNELS.TABS_SAVE, async (_event, tabs: Tab[]) => {
    await saveJson(TABS_FILE, tabs);
    return { success: true };
  });
}
