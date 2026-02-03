import { describe, it, expect } from 'vitest';
import { getPhysicsRadius, mapRange } from './physics';
import type { Node } from '../types';

describe('getPhysicsRadius', () => {
  it('returns circleRadius for circle shape', () => {
    const node: Node = {
      id: '1',
      text: 'x',
      x: 0,
      y: 0,
      shape: 'circle',
      dimensions: { circleRadius: 50, rectWidth: 180, rectHeight: 120 },
    };
    expect(getPhysicsRadius(node)).toBe(50);
  });

  it('returns average of rect width and height over 4 for rectangle', () => {
    const node: Node = {
      id: '1',
      text: 'x',
      x: 0,
      y: 0,
      shape: 'rectangle',
      dimensions: { circleRadius: 50, rectWidth: 180, rectHeight: 120 },
    };
    expect(getPhysicsRadius(node)).toBe((180 + 120) / 4);
  });
});

describe('mapRange', () => {
  it('maps 0 to outMin', () => {
    expect(mapRange(0, 10, 20)).toBe(10);
  });

  it('maps 100 to outMax', () => {
    expect(mapRange(100, 10, 20)).toBe(20);
  });

  it('maps 50 to midpoint', () => {
    expect(mapRange(50, 0, 100)).toBe(50);
  });

  it('maps arbitrary value linearly', () => {
    expect(mapRange(25, 0, 100)).toBe(25);
    expect(mapRange(75, 0, 100)).toBe(75);
  });
});
