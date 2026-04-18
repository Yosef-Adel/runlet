import type { IpcMain, BrowserWindow } from 'electron';
import { exec } from 'child_process';
import { promisify } from 'util';
import { IPC_CHANNELS, PACKAGES_FILE } from '../../shared/constants';
import { searchPackages } from '../services/npm-registry';
import { loadJson, saveJson, getDataDir, ensurePackagesDir } from '../services/storage';
import type { InstalledPackage } from '../../shared/types';

const execAsync = promisify(exec);

export function registerNpmHandlers(ipcMain: IpcMain): void {
  // Search NPM registry
  ipcMain.handle(
    IPC_CHANNELS.NPM_SEARCH,
    async (_event, payload: { query: string; limit?: number }) => {
      const results = await searchPackages(payload.query, payload.limit ?? 20);
      return { results };
    }
  );

  // Install a package
  ipcMain.handle(
    IPC_CHANNELS.NPM_INSTALL,
    async (event, payload: { name: string; version?: string }) => {
      const dataDir = getDataDir();
      await ensurePackagesDir();

      const pkgSpec = payload.version
        ? `${payload.name}@${payload.version}`
        : payload.name;

      const sender = event.sender;
      const win = BrowserWindow.fromWebContents(sender);

      // Send progress
      const sendProgress = (status: string, progress: number, message: string) => {
        win?.webContents.send(IPC_CHANNELS.NPM_INSTALL_PROGRESS, {
          name: payload.name,
          status,
          progress,
          message,
        });
      };

      try {
        sendProgress('downloading', 0.25, `Resolving ${pkgSpec}...`);

        sendProgress('installing', 0.5, `Installing ${pkgSpec}...`);

        await execAsync(`npm install ${pkgSpec} --save --prefix "${dataDir}"`, {
          cwd: dataDir,
          timeout: 120000,
        });

        sendProgress('complete', 1, `Installed ${pkgSpec}`);

        // Update packages manifest
        const packages = await loadJson<InstalledPackage[]>(PACKAGES_FILE, []);
        const existing = packages.findIndex((p) => p.name === payload.name);
        const newPkg: InstalledPackage = {
          name: payload.name,
          version: payload.version ?? 'latest',
          installedAt: Date.now(),
          size: 0,
        };

        if (existing >= 0) {
          packages[existing] = newPkg;
        } else {
          packages.push(newPkg);
        }
        await saveJson(PACKAGES_FILE, packages);

        return { success: true, package: newPkg };
      } catch (err) {
        sendProgress('error', 0, (err as Error).message);
        return { success: false, error: (err as Error).message };
      }
    }
  );

  // Uninstall a package
  ipcMain.handle(
    IPC_CHANNELS.NPM_UNINSTALL,
    async (_event, payload: { name: string }) => {
      const dataDir = getDataDir();

      try {
        await execAsync(`npm uninstall ${payload.name} --prefix "${dataDir}"`, {
          cwd: dataDir,
          timeout: 60000,
        });

        const packages = await loadJson<InstalledPackage[]>(PACKAGES_FILE, []);
        const filtered = packages.filter((p) => p.name !== payload.name);
        await saveJson(PACKAGES_FILE, filtered);

        return { success: true };
      } catch (err) {
        return { success: false, error: (err as Error).message };
      }
    }
  );

  // List installed packages
  ipcMain.handle(IPC_CHANNELS.NPM_LIST, async () => {
    const packages = await loadJson<InstalledPackage[]>(PACKAGES_FILE, []);
    return { packages };
  });
}
