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
  if (isError) return '#f44747';
  switch (type) {
    case 'string': return '#ce9178';
    case 'number': return '#b5cea8';
    case 'boolean': return '#569cd6';
    case 'undefined': return '#6a737d';
    case 'object': return '#9cdcfe';
    case 'function': return '#dcdcaa';
    default: return '#d4d4d4';
  }
}

function getConsoleMethodColor(method: string): string {
  switch (method) {
    case 'error': return '#f44747';
    case 'warn': return '#cca700';
    case 'info': return '#3794ff';
    case 'debug': return '#6a737d';
    default: return '#d4d4d4';
  }
}

export default function Output({
  results,
  consoleOutput = [],
  error,
  matchLines = true,
  showUndefined = false,
  fontSize = 14,
  fontFamily = 'Fira Code, monospace',
  scrolling = 'standard',
  executionTime,
}: OutputProps): React.ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when scrolling === 'automatic'
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

  // Build line-aligned output if matchLines is on
  const renderLineAligned = () => {
    if (displayResults.length === 0 && truncatedConsole.length === 0 && !error) {
      return (
        <div style={{ padding: 16, color: '#6a737d', fontStyle: 'italic' }}>
          No output
        </div>
      );
    }

    // Group results by line
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

      lines.push(
        <div
          key={`line-${i}`}
          style={{
            minHeight: `${fontSize * 1.5}px`,
            lineHeight: `${fontSize * 1.5}px`,
            paddingLeft: 12,
            paddingRight: 12,
            display: 'flex',
            alignItems: 'center',
            borderBottom: '1px solid #2a2a2a',
          }}
        >
          {lineResults?.map((r, idx) => (
            <span
              key={idx}
              style={{
                color: getValueColor(r.type, r.isError),
                marginRight: 8,
                fontWeight: r.isMagic ? 'bold' : 'normal',
              }}
            >
              {r.isError ? `Error: ${r.errorMessage}` : r.displayValue}
            </span>
          ))}
          {lineConsole.map((c, idx) => (
            <span
              key={`console-${idx}`}
              style={{
                color: getConsoleMethodColor(c.method),
                marginRight: 8,
              }}
            >
              {c.args.map((a) => String(a)).join(' ')}
            </span>
          ))}
        </div>
      );
    }

    if (truncated) {
      lines.push(
        <div key="truncated" style={{ padding: '8px 12px', color: '#cca700', fontStyle: 'italic' }}>
          Output truncated to {MAX_OUTPUT_LINES} lines
        </div>
      );
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
            padding: '2px 12px',
            color: getValueColor(r.type, r.isError),
            fontWeight: r.isMagic ? 'bold' : 'normal',
          }}
        >
          <span style={{ color: '#6a737d', marginRight: 8 }}>L{r.line}:</span>
          {r.isError ? `Error: ${r.errorMessage}` : r.displayValue}
        </div>
      );
    }

    for (const [idx, c] of truncatedConsole.entries()) {
      items.push(
        <div
          key={`console-${idx}`}
          style={{
            padding: '2px 12px',
            color: getConsoleMethodColor(c.method),
          }}
        >
          <span style={{ color: '#6a737d', marginRight: 8 }}>
            [{c.method}]
          </span>
          {c.args.map((a) => String(a)).join(' ')}
        </div>
      );
    }

    if (items.length === 0) {
      return (
        <div style={{ padding: 16, color: '#6a737d', fontStyle: 'italic' }}>
          No output
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
        backgroundColor: '#1e1e1e',
        position: 'relative',
      }}
    >
      {error ? (
        <div
          style={{
            padding: 12,
            color: '#f44747',
            backgroundColor: '#2d1515',
            borderBottom: '1px solid #f44747',
          }}
        >
          <strong>Error</strong>
          {error.line != null && <span style={{ color: '#6a737d' }}> (line {error.line})</span>}
          : {error.message}
        </div>
      ) : null}
      {matchLines ? renderLineAligned() : renderFlat()}
      {executionTime != null && (
        <div
          style={{
            position: 'absolute',
            bottom: 4,
            right: 8,
            fontSize: 11,
            color: '#6a737d',
          }}
        >
          {executionTime}ms
        </div>
      )}
    </div>
  );
}
