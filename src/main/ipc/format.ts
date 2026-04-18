import type { IpcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/constants';
import { formatCode } from '../services/prettier';

export function registerFormatHandlers(ipcMain: IpcMain): void {
  ipcMain.handle(
    IPC_CHANNELS.FORMAT_CODE,
    async (
      _event,
      payload: {
        code: string;
        language: 'javascript' | 'typescript';
        options: {
          tabWidth?: number;
          useTabs?: boolean;
          semi?: boolean;
          singleQuote?: boolean;
          trailingComma?: 'all' | 'es5' | 'none';
        };
      }
    ) => {
      try {
        const formatted = await formatCode(payload.code, payload.language, payload.options);
        return { success: true, formatted };
      } catch (err) {
        return { success: false, error: (err as Error).message };
      }
    }
  );
}
