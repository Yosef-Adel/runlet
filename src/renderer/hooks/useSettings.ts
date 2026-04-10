import { useEffect, useCallback } from 'react';
import { useAppStore } from '../store';
import type { Settings } from '../../shared/types';

declare global {
  interface Window {
    api: {
      loadSettings: () => Promise<Settings>;
      saveSettings: (settings: Settings) => Promise<{ success: boolean }>;
      loadTabs: () => Promise<unknown>;
      saveTabs: (tabs: unknown) => Promise<{ success: boolean }>;
      executeCode: (payload: unknown) => Promise<unknown>;
      cancelExecution: () => Promise<unknown>;
      formatCode: (payload: unknown) => Promise<unknown>;
      npmSearch: (payload: unknown) => Promise<unknown>;
      npmInstall: (payload: unknown) => Promise<unknown>;
      npmUninstall: (payload: unknown) => Promise<unknown>;
      npmList: () => Promise<unknown>;
      onNpmInstallProgress: (callback: (data: unknown) => void) => () => void;
      loadSnippets: () => Promise<unknown>;
      saveSnippets: (payload: unknown) => Promise<unknown>;
      exportSnippets: (payload: unknown) => Promise<unknown>;
      importSnippets: () => Promise<unknown>;
      loadEnvVars: () => Promise<unknown>;
      saveEnvVars: (payload: unknown) => Promise<unknown>;
    };
  }
}

export function useSettings(): {
  settings: Settings;
  updateSettings: (partial: Partial<Settings>) => void;
} {
  const settings = useAppStore((s) => s.settings);
  const setSettings = useAppStore((s) => s.setSettings);
  const updateSettingsStore = useAppStore((s) => s.updateSettings);

  useEffect(() => {
    window.api.loadSettings().then((loaded) => {
      setSettings(loaded);
    });
  }, [setSettings]);

  const updateSettings = useCallback(
    (partial: Partial<Settings>) => {
      updateSettingsStore(partial);
      const merged = { ...settings, ...partial };
      window.api.saveSettings(merged);
    },
    [settings, updateSettingsStore]
  );

  return { settings, updateSettings };
}
