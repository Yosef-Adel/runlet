import { app, BrowserWindow, ipcMain, Menu, shell } from 'electron';
import { join } from 'path';
import { registerSettingsHandlers } from './ipc/settings';
import { registerExecuteHandlers } from './ipc/execute';
import { registerFormatHandlers } from './ipc/format';
import { registerNpmHandlers } from './ipc/npm';
import { registerSnippetsHandlers } from './ipc/snippets';
import { registerEnvVarsHandlers } from './ipc/env-vars';

let mainWindow: BrowserWindow | null = null;

function createApplicationMenu(): void {
  const isMac = process.platform === 'darwin';

  const template: Electron.MenuItemConstructorOptions[] = [
    // macOS app menu — required for proper system integration
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              {
                label: `About ${app.name}`,
                role: 'about' as const,
              },
              { type: 'separator' as const },
              { role: 'services' as const },
              { type: 'separator' as const },
              { role: 'hide' as const },
              { role: 'hideOthers' as const },
              { role: 'unhide' as const },
              { type: 'separator' as const },
              {
                label: `Quit ${app.name}`,
                accelerator: 'Cmd+Q',
                role: 'quit' as const,
              },
            ],
          },
        ]
      : []),
    {
      label: 'File',
      submenu: [
        {
          label: 'New Tab',
          accelerator: 'CmdOrCtrl+T',
          click: () => mainWindow?.webContents.send('menu:new-tab'),
        },
        {
          label: 'Close Tab',
          accelerator: 'CmdOrCtrl+W',
          click: () => mainWindow?.webContents.send('menu:close-tab'),
        },
        { type: 'separator' },
        ...(isMac
          ? []
          : [
              {
                label: 'Quit',
                accelerator: 'Alt+F4',
                click: () => app.quit(),
              },
            ]),
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' as const },
        { role: 'redo' as const },
        { type: 'separator' as const },
        { role: 'cut' as const },
        { role: 'copy' as const },
        { role: 'paste' as const },
        { role: 'selectAll' as const },
      ],
    },
    {
      label: 'View',
      submenu: [
        ...(app.isPackaged
          ? []
          : [
              { role: 'reload' as const },
              { role: 'forceReload' as const },
              { role: 'toggleDevTools' as const },
              { type: 'separator' as const },
            ]),
        { role: 'resetZoom' as const },
        { role: 'zoomIn' as const },
        { role: 'zoomOut' as const },
        { type: 'separator' as const },
        { role: 'togglefullscreen' as const },
      ],
    },
    {
      label: 'Run',
      submenu: [
        {
          label: 'Run Code',
          accelerator: 'CmdOrCtrl+Enter',
          click: () => mainWindow?.webContents.send('menu:run'),
        },
        {
          label: 'Format Code',
          accelerator: 'CmdOrCtrl+Shift+F',
          click: () => mainWindow?.webContents.send('menu:format'),
        },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'View on GitHub',
          click: () => shell.openExternal('https://github.com/Yosef-Adel/runlet'),
        },
        { type: 'separator' as const },
        ...(!isMac
          ? [
              {
                label: `About ${app.name}`,
                click: () => app.showAboutPanel(),
              },
            ]
          : []),
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

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
    },
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 12, y: 7 },
    show: false,
  });

  // Block navigation to external URLs
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('file://')) {
      event.preventDefault();
    }
  });

  // Block new window creation
  mainWindow.webContents.setWindowOpenHandler(() => {
    return { action: 'deny' };
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

// Global error handlers to prevent silent crashes
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});

app.whenReady().then(() => {
  registerAllHandlers();
  createApplicationMenu();
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
