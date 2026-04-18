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
        width: direction === 'horizontal' ? 4 : '100%',
        height: direction === 'horizontal' ? '100%' : 4,
        backgroundColor: isDragging ? '#007acc' : '#3c3c3c',
        cursor: direction === 'horizontal' ? 'col-resize' : 'row-resize',
        flexShrink: 0,
        transition: 'background-color 0.1s',
      }}
    />
  );
}
