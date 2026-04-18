import { useCallback, useRef, useEffect } from 'react';
import { useAppStore } from '../store';
import type { ExecutionResponse, ExecutionError, ConsoleEntry } from '../../shared/types';
import { AUTO_RUN_DEBOUNCE_MS } from '../../shared/constants';

export interface ExecutionState {
  consoleOutput: ConsoleEntry[];
  error: { message: string; line: number | null } | null;
  executionTime: number | null;
}

const executionStates = new Map<string, ExecutionState>();

export function useExecution(): {
  execute: (tabId?: string) => Promise<void>;
  cancel: () => Promise<void>;
  getExecutionState: (tabId: string) => ExecutionState;
} {
  const tabs = useAppStore((s) => s.tabs);
  const activeTabId = useAppStore((s) => s.activeTabId);
  const settings = useAppStore((s) => s.settings);
  const updateTabOutput = useAppStore((s) => s.updateTabOutput);
  const setTabRunning = useAppStore((s) => s.setTabRunning);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const execute = useCallback(
    async (tabId?: string) => {
      const id = tabId ?? activeTabId;
      const tab = tabs.find((t) => t.id === id);
      if (!tab) return;

      setTabRunning(id, true);

      try {
        const result = (await window.api.executeCode({
          code: tab.content,
          language: tab.language,
          settings: {
            loopProtection: settings.advanced.loopProtection,
            loopThreshold: settings.advanced.loopThreshold,
            expressionResults: settings.advanced.expressionResults,
            showUndefined: settings.advanced.showUndefined,
            proposals: {
              pipeline: settings.build.proposalPipeline,
              decorators: settings.build.proposalDecorators,
              partialApplication: settings.build.proposalPartialApplication,
              throwExpressions: settings.build.proposalThrowExpressions,
              doExpressions: settings.build.proposalDoExpressions,
              functionSent: settings.build.proposalFunctionSent,
              regexpModifiers: settings.build.proposalRegexpModifiers,
            },
          },
        })) as ExecutionResponse | ExecutionError;

        if (result.success) {
          const resp = result as ExecutionResponse;
          updateTabOutput(id, resp.results);
          executionStates.set(id, {
            consoleOutput: resp.consoleOutput,
            error: null,
            executionTime: resp.executionTime,
          });
        } else {
          const errResp = result as ExecutionError;
          updateTabOutput(id, []);
          executionStates.set(id, {
            consoleOutput: [],
            error: { message: errResp.error.message, line: errResp.error.line },
            executionTime: null,
          });
        }
      } catch (err) {
        updateTabOutput(id, []);
        executionStates.set(id, {
          consoleOutput: [],
          error: { message: (err as Error).message, line: null },
          executionTime: null,
        });
      } finally {
        setTabRunning(id, false);
      }
    },
    [activeTabId, tabs, settings, updateTabOutput, setTabRunning]
  );

  const cancel = useCallback(async () => {
    await window.api.cancelExecution();
  }, []);

  // Auto-run on code change when autoRun is enabled
  const activeTab = tabs.find((t) => t.id === activeTabId);
  const contentRef = useRef(activeTab?.content);

  useEffect(() => {
    if (!settings.general.autoRun) return;
    if (!activeTab) return;

    // Only trigger if content actually changed
    if (contentRef.current === activeTab.content) return;
    contentRef.current = activeTab.content;

    // Skip auto-run for empty content
    if (!activeTab.content.trim()) {
      updateTabOutput(activeTabId, []);
      executionStates.set(activeTabId, {
        consoleOutput: [],
        error: null,
        executionTime: null,
      });
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      execute(activeTabId);
    }, AUTO_RUN_DEBOUNCE_MS);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [activeTab?.content, activeTabId, settings.general.autoRun, execute, updateTabOutput]);

  const getExecutionState = useCallback((tabId: string): ExecutionState => {
    return (
      executionStates.get(tabId) ?? {
        consoleOutput: [],
        error: null,
        executionTime: null,
      }
    );
  }, []);

  return { execute, cancel, getExecutionState };
}
