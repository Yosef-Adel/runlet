import React, { useRef, useEffect } from 'react';
import type { OutputResult, ConsoleEntry } from '../../shared/types';
import { MAX_OUTPUT_LINES } from '../../shared/constants';

export interface OutputProps {
  results: OutputResult[];
  consoleOutput?: ConsoleEntry[];
  error?: { message: string; line: number | null } | null;
  matchLines?: boolean;
  showUndefined?: boolean;
  fontSize?: number;
  fontFamily?: string;
  scrolling?: 'standard' | 'synchronous' | 'automatic';
  executionTime?: number;
}

function getValueColor(type: string, isError: boolean): string {
  if (isError) return 'var(--error)';
  switch (type) {
    case 'string': return 'var(--syntax-string)';
    case 'number': return 'var(--syntax-number)';
    case 'boolean': return 'var(--syntax-boolean)';
    case 'undefined': return 'var(--text-muted)';
    case 'object': return 'var(--syntax-type)';
    case 'function': return 'var(--syntax-function)';
    default: return 'var(--text-primary)';
  }
}

function getConsoleMethodColor(method: string): string {
  switch (method) {
    case 'error': return 'var(--error)';
    case 'warn': return 'var(--warning)';
    case 'info': return 'var(--info)';
    case 'debug': return 'var(--text-muted)';
    default: return 'var(--text-primary)';
  }
}

function getConsoleMethodIcon(method: string): string {
  switch (method) {
    case 'error': return '✕';
    case 'warn': return '⚠';
    case 'info': return 'ℹ';
    case 'debug': return '•';
    default: return '›';
  }
}

export default function Output({
  results,
  consoleOutput = [],
  error,
  matchLines = true,
  showUndefined = false,
  fontSize = 14,
  fontFamily = 'var(--font-mono)',
  scrolling = 'standard',
  executionTime,
}: OutputProps): React.ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrolling === 'automatic' && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [results, consoleOutput, scrolling]);

  const filteredResults = showUndefined
    ? results
    : results.filter((r) => r.type !== 'undefined' || r.isError || r.isMagic);

  const truncated = filteredResults.length > MAX_OUTPUT_LINES;
  const displayResults = truncated ? filteredResults.slice(0, MAX_OUTPUT_LINES) : filteredResults;
  const truncatedConsole = consoleOutput.length > MAX_OUTPUT_LINES
    ? consoleOutput.slice(0, MAX_OUTPUT_LINES)
    : consoleOutput;

  const lineHeight = fontSize * 1.6;

  const renderLineAligned = () => {
    if (displayResults.length === 0 && truncatedConsole.length === 0 && !error) {
      return (
        <div style={{
          padding: 'var(--space-xl)',
          color: 'var(--text-muted)',
          fontStyle: 'italic',
          fontSize: 'var(--text-sm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          opacity: 0.7,
        }}>
          Run code to see output
        </div>
      );
    }

    const lineMap = new Map<number, OutputResult[]>();
    for (const r of displayResults) {
      const existing = lineMap.get(r.line) ?? [];
      existing.push(r);
      lineMap.set(r.line, existing);
    }

    const maxLine = Math.max(
      ...displayResults.map((r) => r.line),
      ...truncatedConsole.map((c) => c.line ?? 0),
      0
    );

    const lines: React.ReactElement[] = [];
    for (let i = 1; i <= maxLine; i++) {
      const lineResults = lineMap.get(i);
      const lineConsole = truncatedConsole.filter((c) => c.line === i);
      const hasContent = lineResults || lineConsole.length > 0;

      lines.push(
        <div
          key={`line-${i}`}
          style={{
            minHeight: lineHeight,
            lineHeight: `${lineHeight}px`,
            paddingLeft: 'var(--space-lg)',
            paddingRight: 'var(--space-lg)',
            display: 'flex',
            alignItems: 'center',
            borderBottom: '1px solid var(--border-subtle)',
            background: hasContent ? 'transparent' : 'transparent',
          }}
        >
          {lineResults?.map((r, idx) => (
            <span
              key={idx}
              style={{
                color: getValueColor(r.type, r.isError),
                marginRight: 'var(--space-sm)',
                fontWeight: r.isMagic ? 600 : 'normal',
                fontFamily: 'var(--font-mono)',
                fontSize: fontSize - 1,
              }}
            >
              {r.isError ? `Error: ${r.errorMessage}` : r.displayValue}
            </span>
          ))}
          {lineConsole.map((c, idx) => (
            <span
              key={`console-${idx}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                color: getConsoleMethodColor(c.method),
                marginRight: 'var(--space-sm)',
                fontFamily: 'var(--font-mono)',
                fontSize: fontSize - 1,
              }}
            >
              <span style={{ opacity: 0.5, fontSize: 10 }}>{getConsoleMethodIcon(c.method)}</span>
              {c.args.map((a) => String(a)).join(' ')}
            </span>
          ))}
        </div>
      );
    }

    if (truncated) {
      lines.push(
        <div key="truncated" style={{
          padding: 'var(--space-sm) var(--space-lg)',
          color: 'var(--warning)',
          fontStyle: 'italic',
          fontSize: 'var(--text-xs)',
        }}>
          Output truncated to {MAX_OUTPUT_LINES} lines
        </div>
      );
    }

    const unmatchedConsole = truncatedConsole.filter((c) => c.line === null || c.line === undefined);
    if (unmatchedConsole.length > 0) {
      for (const [idx, c] of unmatchedConsole.entries()) {
        lines.push(
          <div
            key={`unmatched-console-${idx}`}
            style={{
              minHeight: lineHeight,
              lineHeight: `${lineHeight}px`,
              paddingLeft: 'var(--space-lg)',
              paddingRight: 'var(--space-lg)',
              display: 'flex',
              alignItems: 'center',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              color: getConsoleMethodColor(c.method),
              fontFamily: 'var(--font-mono)',
              fontSize: fontSize - 1,
            }}>
              <span style={{ opacity: 0.5, fontSize: 10 }}>{getConsoleMethodIcon(c.method)}</span>
              {c.args.map((a) => String(a)).join(' ')}
            </span>
          </div>
        );
      }
    }

    return lines;
  };

  const renderFlat = () => {
    const items: React.ReactElement[] = [];

    for (const [idx, r] of displayResults.entries()) {
      items.push(
        <div
          key={`result-${idx}`}
          style={{
            padding: '3px var(--space-lg)',
            color: getValueColor(r.type, r.isError),
            fontWeight: r.isMagic ? 600 : 'normal',
            fontFamily: 'var(--font-mono)',
            fontSize: fontSize - 1,
          }}
        >
          <span style={{ color: 'var(--text-muted)', marginRight: 'var(--space-sm)', fontSize: 'var(--text-xs)' }}>L{r.line}</span>
          {r.isError ? `Error: ${r.errorMessage}` : r.displayValue}
        </div>
      );
    }

    for (const [idx, c] of truncatedConsole.entries()) {
      items.push(
        <div
          key={`console-${idx}`}
          style={{
            padding: '3px var(--space-lg)',
            color: getConsoleMethodColor(c.method),
            fontFamily: 'var(--font-mono)',
            fontSize: fontSize - 1,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span style={{ opacity: 0.5, fontSize: 10 }}>{getConsoleMethodIcon(c.method)}</span>
          {c.args.map((a) => String(a)).join(' ')}
        </div>
      );
    }

    if (items.length === 0) {
      return (
        <div style={{
          padding: 'var(--space-xl)',
          color: 'var(--text-muted)',
          fontStyle: 'italic',
          fontSize: 'var(--text-sm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          opacity: 0.7,
        }}>
          Run code to see output
        </div>
      );
    }

    return items;
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        overflow: 'auto',
        fontSize,
        fontFamily,
        backgroundColor: 'var(--bg-base)',
        position: 'relative',
      }}
    >
      {error ? (
        <div
          style={{
            padding: 'var(--space-md) var(--space-lg)',
            color: 'var(--error)',
            backgroundColor: '#f8717110',
            borderBottom: '1px solid #f8717130',
            fontFamily: 'var(--font-mono)',
            fontSize: fontSize - 1,
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-sm)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          <span>
            {error.line != null && <span style={{ color: 'var(--text-muted)' }}>line {error.line}: </span>}
            {error.message}
          </span>
        </div>
      ) : null}
      {matchLines ? renderLineAligned() : renderFlat()}
      {executionTime != null && (
        <div
          style={{
            position: 'absolute',
            bottom: 6,
            right: 10,
            fontSize: 'var(--text-xs)',
            color: 'var(--text-muted)',
            background: 'var(--bg-base)',
            padding: '2px 6px',
            borderRadius: 'var(--radius-sm)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {executionTime}ms
        </div>
      )}
    </div>
  );
}
