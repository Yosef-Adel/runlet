import type { IpcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/constants';
import { runCode } from '../executor/runner';
import type { ExecutionRequest } from '../../shared/types';

let currentAbortController: AbortController | null = null;

export function registerExecuteHandlers(ipcMain: IpcMain): void {
  ipcMain.handle(IPC_CHANNELS.EXECUTE_CODE, async (_event, payload: ExecutionRequest) => {
    currentAbortController = new AbortController();

    const result = await runCode({
      code: payload.code,
      language: payload.language,
      transformOptions: {
        loopProtection: payload.settings.loopProtection,
        loopThreshold: payload.settings.loopThreshold,
        expressionResults: payload.settings.expressionResults,
      },
      sandboxOptions: {},
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
