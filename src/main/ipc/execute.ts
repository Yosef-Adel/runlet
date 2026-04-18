import type { IpcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/constants';
import { runCode } from '../executor/runner';
import { getPackagesDir } from '../services/storage';
import type { ExecutionRequest } from '../../shared/types';
import { loadJson } from '../services/storage';
import { ENV_VARS_FILE } from '../../shared/constants';
import type { EnvironmentVariable } from '../../shared/types';

let currentAbortController: AbortController | null = null;

export function registerExecuteHandlers(ipcMain: IpcMain): void {
  ipcMain.handle(IPC_CHANNELS.EXECUTE_CODE, async (_event, payload: ExecutionRequest) => {
    currentAbortController = new AbortController();

    // Load env vars for sandbox injection
    const envVarsList = await loadJson<EnvironmentVariable[]>(ENV_VARS_FILE, []);
    const envVars: Record<string, string> = {};
    for (const ev of envVarsList) {
      envVars[ev.key] = ev.value;
    }

    const result = await runCode({
      code: payload.code,
      language: payload.language,
      transformOptions: {
        loopProtection: payload.settings.loopProtection,
        loopThreshold: payload.settings.loopThreshold,
        expressionResults: payload.settings.expressionResults,
      },
      sandboxOptions: {
        modulePaths: [getPackagesDir()],
        envVars,
      },
    });

    currentAbortController = null;
    return result;
  });

  ipcMain.handle(IPC_CHANNELS.CANCEL_EXECUTION, async () => {
    if (currentAbortController) {
      currentAbortController.abort();
      currentAbortController = null;
    }
    return { cancelled: true };
  });
}
