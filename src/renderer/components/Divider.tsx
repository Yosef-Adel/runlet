import React, { useCallback, useRef, useEffect, useState } from 'react';

export interface DividerProps {
  direction: 'horizontal' | 'vertical';
  onResize: (delta: number) => void;
}

export default function Divider({ direction, onResize }: DividerProps): React.ReactElement {
  const [isDragging, setIsDragging] = useState(false);
  const startPosRef = useRef(0);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      startPosRef.current = direction === 'horizontal' ? e.clientX : e.clientY;
    },
    [direction]
  );

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const currentPos = direction === 'horizontal' ? e.clientX : e.clientY;
      const delta = currentPos - startPosRef.current;
      startPosRef.current = currentPos;
      onResize(delta);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, direction, onResize]);

  return (
    <div
      onMouseDown={handleMouseDown}
      style={{
        width: direction === 'horizontal' ? 1 : '100%',
        height: direction === 'horizontal' ? '100%' : 1,
        backgroundColor: isDragging ? 'var(--accent)' : 'var(--border-subtle)',
        cursor: direction === 'horizontal' ? 'col-resize' : 'row-resize',
        flexShrink: 0,
        transition: isDragging ? 'none' : 'background-color var(--transition-base)',
        position: 'relative',
      }}
    >
      {/* Invisible wider hit area */}
      <div style={{
        position: 'absolute',
        [direction === 'horizontal' ? 'left' : 'top']: -3,
        [direction === 'horizontal' ? 'width' : 'height']: 7,
        [direction === 'horizontal' ? 'height' : 'width']: '100%',
        cursor: direction === 'horizontal' ? 'col-resize' : 'row-resize',
      }} />
    </div>
  );
}
