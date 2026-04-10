import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../shared/constants';

const api = {
  executeCode: (payload: unknown) => ipcRenderer.invoke(IPC_CHANNELS.EXECUTE_CODE, payload),
  cancelExecution: () => ipcRenderer.invoke(IPC_CHANNELS.CANCEL_EXECUTION),

  npmSearch: (payload: unknown) => ipcRenderer.invoke(IPC_CHANNELS.NPM_SEARCH, payload),
  npmInstall: (payload: unknown) => ipcRenderer.invoke(IPC_CHANNELS.NPM_INSTALL, payload),
  npmUninstall: (payload: unknown) => ipcRenderer.invoke(IPC_CHANNELS.NPM_UNINSTALL, payload),
  npmList: () => ipcRenderer.invoke(IPC_CHANNELS.NPM_LIST),
  onNpmInstallProgress: (callback: (data: unknown) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, data: unknown) => callback(data);
    ipcRenderer.on(IPC_CHANNELS.NPM_INSTALL_PROGRESS, handler);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.NPM_INSTALL_PROGRESS, handler);
  },

  formatCode: (payload: unknown) => ipcRenderer.invoke(IPC_CHANNELS.FORMAT_CODE, payload),

  loadSettings: () => ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_LOAD),
  saveSettings: (payload: unknown) => ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_SAVE, payload),

  loadTabs: () => ipcRenderer.invoke(IPC_CHANNELS.TABS_LOAD),
  saveTabs: (payload: unknown) => ipcRenderer.invoke(IPC_CHANNELS.TABS_SAVE, payload),

  loadSnippets: () => ipcRenderer.invoke(IPC_CHANNELS.SNIPPETS_LOAD),
  saveSnippets: (payload: unknown) => ipcRenderer.invoke(IPC_CHANNELS.SNIPPETS_SAVE, payload),
  exportSnippets: (payload: unknown) => ipcRenderer.invoke(IPC_CHANNELS.SNIPPETS_EXPORT, payload),
  importSnippets: () => ipcRenderer.invoke(IPC_CHANNELS.SNIPPETS_IMPORT),

  loadEnvVars: () => ipcRenderer.invoke(IPC_CHANNELS.ENV_VARS_LOAD),
  saveEnvVars: (payload: unknown) => ipcRenderer.invoke(IPC_CHANNELS.ENV_VARS_SAVE, payload),
};

contextBridge.exposeInMainWorld('api', api);

export type RunletAPI = typeof api;
