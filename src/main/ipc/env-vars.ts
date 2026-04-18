import type { IpcMain } from 'electron';
import { IPC_CHANNELS, ENV_VARS_FILE } from '../../shared/constants';
import { loadJson, saveJson } from '../services/storage';
import type { EnvironmentVariable } from '../../shared/types';

export function registerEnvVarsHandlers(ipcMain: IpcMain): void {
  ipcMain.handle(IPC_CHANNELS.ENV_VARS_LOAD, async () => {
    const variables = await loadJson<EnvironmentVariable[]>(ENV_VARS_FILE, []);
    return { variables };
  });

  ipcMain.handle(
    IPC_CHANNELS.ENV_VARS_SAVE,
    async (_event, payload: { variables: EnvironmentVariable[] }) => {
      await saveJson(ENV_VARS_FILE, payload.variables);
      return { success: true };
    }
  );
}
