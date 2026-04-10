import { app, BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';
import { registerSettingsHandlers } from './ipc/settings';
import { registerExecuteHandlers } from './ipc/execute';
import { registerFormatHandlers } from './ipc/format';
import { registerNpmHandlers } from './ipc/npm';
import { registerSnippetsHandlers } from './ipc/snippets';
import { registerEnvVarsHandlers } from './ipc/env-vars';

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 600,
    minHeight: 400,
    webPreferences: {
      preload: join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    titleBarStyle: 'hiddenInset',
    show: false,
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

function registerAllHandlers(): void {
  registerSettingsHandlers(ipcMain);
  registerExecuteHandlers(ipcMain);
  registerFormatHandlers(ipcMain);
  registerNpmHandlers(ipcMain);
  registerSnippetsHandlers(ipcMain);
  registerEnvVarsHandlers(ipcMain);
}

app.whenReady().then(() => {
  registerAllHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
