import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type {
  Tab,
  Settings,
  Snippet,
  EnvironmentVariable,
  InstalledPackage,
  OutputResult,
  ConsoleEntry,
  ActivePanel,
  LayoutOrientation,
} from '../../shared/types';
import { DEFAULT_SETTINGS } from '../../shared/constants';

function createDefaultTab(): Tab {
  return {
    id: uuidv4(),
    title: null,
    content: '',
    language: 'javascript',
    output: [],
    isRunning: false,
    createdAt: Date.now(),
    order: 0,
  };
}

interface AppState {
  // Tabs
  tabs: Tab[];
  activeTabId: string;
  addTab: () => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateTabContent: (id: string, content: string) => void;
  updateTabOutput: (id: string, output: OutputResult[]) => void;
  updateTabTitle: (id: string, title: string | null) => void;
  updateTabLanguage: (id: string, language: 'javascript' | 'typescript') => void;
  setTabRunning: (id: string, running: boolean) => void;
  setTabs: (tabs: Tab[]) => void;

  // Settings
  settings: Settings;
  setSettings: (settings: Settings) => void;
  updateSettings: (partial: Partial<Settings>) => void;

  // Snippets
  snippets: Snippet[];
  setSnippets: (snippets: Snippet[]) => void;

  // Environment Variables
  envVars: EnvironmentVariable[];
  setEnvVars: (envVars: EnvironmentVariable[]) => void;

  // Installed Packages
  packages: InstalledPackage[];
  setPackages: (packages: InstalledPackage[]) => void;

  // Execution state
  executionStates: Record<string, { consoleOutput: ConsoleEntry[]; error: { message: string; line: number | null } | null; executionTime: number | null }>;
  setExecutionState: (tabId: string, state: { consoleOutput: ConsoleEntry[]; error: { message: string; line: number | null } | null; executionTime: number | null }) => void;

  // UI  
  activePanel: ActivePanel;
  setActivePanel: (panel: ActivePanel) => void;
  layout: LayoutOrientation;
  setLayout: (layout: LayoutOrientation) => void;
  outputVisible: boolean;
  setOutputVisible: (visible: boolean) => void;
}

const defaultTab = createDefaultTab();

export const useAppStore = create<AppState>((set) => ({
  // Tabs
  tabs: [defaultTab],
  activeTabId: defaultTab.id,
  addTab: () =>
    set((state) => {
      const newTab = createDefaultTab();
      newTab.order = state.tabs.length;
      return { tabs: [...state.tabs, newTab], activeTabId: newTab.id };
    }),
  closeTab: (id) =>
    set((state) => {
      if (state.tabs.length <= 1) return state;
      const filtered = state.tabs.filter((t) => t.id !== id);
      const activeTabId =
        state.activeTabId === id ? filtered[filtered.length - 1].id : state.activeTabId;
      return { tabs: filtered, activeTabId };
    }),
  setActiveTab: (id) => set({ activeTabId: id }),
  updateTabContent: (id, content) =>
    set((state) => ({
      tabs: state.tabs.map((t) => (t.id === id ? { ...t, content } : t)),
    })),
  updateTabOutput: (id, output) =>
    set((state) => ({
      tabs: state.tabs.map((t) => (t.id === id ? { ...t, output } : t)),
    })),
  updateTabTitle: (id, title) =>
    set((state) => ({
      tabs: state.tabs.map((t) => (t.id === id ? { ...t, title } : t)),
    })),
  updateTabLanguage: (id, language) =>
    set((state) => ({
      tabs: state.tabs.map((t) => (t.id === id ? { ...t, language } : t)),
    })),
  setTabRunning: (id, running) =>
    set((state) => ({
      tabs: state.tabs.map((t) => (t.id === id ? { ...t, isRunning: running } : t)),
    })),
  setTabs: (tabs) => set({ tabs, activeTabId: tabs[0]?.id ?? '' }),

  // Settings
  settings: DEFAULT_SETTINGS,
  setSettings: (settings) => set({ settings }),
  updateSettings: (partial) =>
    set((state) => ({
      settings: { ...state.settings, ...partial },
    })),

  // Snippets
  snippets: [],
  setSnippets: (snippets) => set({ snippets }),

  // Environment Variables
  envVars: [],
  setEnvVars: (envVars) => set({ envVars }),

  // Installed Packages
  packages: [],
  setPackages: (packages) => set({ packages }),

  // Execution state
  executionStates: {},
  setExecutionState: (tabId, execState) =>
    set((state) => ({
      executionStates: { ...state.executionStates, [tabId]: execState },
    })),

  // UI
  activePanel: 'none',
  setActivePanel: (panel) =>
    set((state) => ({
      activePanel: state.activePanel === panel ? 'none' : panel,
    })),
  layout: 'horizontal',
  setLayout: (layout) => set({ layout }),
  outputVisible: true,
  setOutputVisible: (visible) => set({ outputVisible: visible }),
}));
