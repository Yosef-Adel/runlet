import { useCallback, useEffect, useRef } from 'react';
import { useAppStore } from '../store';
import type { Tab } from '../../shared/types';

export function useTabs(): {
  tabs: Tab[];
  activeTabId: string;
  addTab: () => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateTabTitle: (id: string, title: string | null) => void;
  updateTabLanguage: (id: string, language: 'javascript' | 'typescript') => void;
  reorderTabs: (fromIndex: number, toIndex: number) => void;
} {
  const tabs = useAppStore((s) => s.tabs);
  const activeTabId = useAppStore((s) => s.activeTabId);
  const addTabStore = useAppStore((s) => s.addTab);
  const closeTabStore = useAppStore((s) => s.closeTab);
  const setActiveTabStore = useAppStore((s) => s.setActiveTab);
  const updateTabTitleStore = useAppStore((s) => s.updateTabTitle);
  const updateTabLanguageStore = useAppStore((s) => s.updateTabLanguage);
  const setTabs = useAppStore((s) => s.setTabs);

  // Debounce tab persistence
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const persistTabs = useCallback((tabsToSave: Tab[]) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      // Save without output to keep file small
      const stripped = tabsToSave.map(({ output, isRunning, ...rest }) => ({
        ...rest,
        output: [],
        isRunning: false,
      }));
      window.api.saveTabs(stripped);
    }, 500);
  }, []);

  // Persist tabs on change
  useEffect(() => {
    persistTabs(tabs);
  }, [tabs, persistTabs]);

  // Load tabs on mount
  useEffect(() => {
    window.api.loadTabs().then((loaded) => {
      const savedTabs = loaded as Tab[];
      if (savedTabs && savedTabs.length > 0) {
        setTabs(savedTabs);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addTab = useCallback(() => {
    addTabStore();
  }, [addTabStore]);

  const closeTab = useCallback(
    (id: string) => {
      closeTabStore(id);
    },
    [closeTabStore]
  );

  const setActiveTab = useCallback(
    (id: string) => {
      setActiveTabStore(id);
    },
    [setActiveTabStore]
  );

  const updateTabTitle = useCallback(
    (id: string, title: string | null) => {
      updateTabTitleStore(id, title);
    },
    [updateTabTitleStore]
  );

  const updateTabLanguage = useCallback(
    (id: string, language: 'javascript' | 'typescript') => {
      updateTabLanguageStore(id, language);
    },
    [updateTabLanguageStore]
  );

  const reorderTabs = useCallback(
    (fromIndex: number, toIndex: number) => {
      const reordered = [...tabs];
      const [moved] = reordered.splice(fromIndex, 1);
      reordered.splice(toIndex, 0, moved);
      const updated = reordered.map((t, i) => ({ ...t, order: i }));
      setTabs(updated);
    },
    [tabs, setTabs]
  );

  return {
    tabs,
    activeTabId,
    addTab,
    closeTab,
    setActiveTab,
    updateTabTitle,
    updateTabLanguage,
    reorderTabs,
  };
}
