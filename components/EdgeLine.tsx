import React, { memo, forwardRef } from 'react';
import type { Edge } from '../types';

interface EdgeLineProps {
  edge: Edge;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  isHovered: boolean;
  isDarkMode: boolean;
}

const EdgeLineInner = forwardRef<SVGLineElement, EdgeLineProps>(function EdgeLineInner(
  { edge, x1, y1, x2, y2, isHovered, isDarkMode },
  ref
) {
  const stroke = isHovered ? '#0d9488' : isDarkMode ? '#475569' : '#cbd5e1';
  const strokeWidth = isHovered ? 4 : 2;
  return (
    <g>
      <line
        ref={ref}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        className="transition-colors duration-200 pointer-events-auto cursor-pointer"
      />
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="transparent"
        strokeWidth={15}
        className="pointer-events-auto cursor-pointer"
      />
    </g>
  );
});

export const EdgeLine = memo(EdgeLineInner);
