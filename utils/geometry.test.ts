import { describe, it, expect } from 'vitest';
import { getDistanceToSegment } from './geometry';

describe('getDistanceToSegment', () => {
  it('returns distance from point to segment', () => {
    // Point (0,0), segment from (1,0) to (3,0) -> closest point (1,0), distance 1
    expect(getDistanceToSegment(0, 0, 1, 0, 3, 0)).toBe(1);
  });

  it('returns 0 when point is on segment', () => {
    expect(getDistanceToSegment(2, 0, 1, 0, 3, 0)).toBe(0);
  });

  it('returns perpendicular distance when projection is on segment', () => {
    // Segment (0,0)-(4,0), point (2,3) -> closest (2,0), distance 3
    expect(getDistanceToSegment(2, 3, 0, 0, 4, 0)).toBe(3);
  });

  it('returns distance to endpoint when projection is outside segment', () => {
    // Segment (0,0)-(2,0), point (5,0) -> closest (2,0), distance 3
    expect(getDistanceToSegment(5, 0, 0, 0, 2, 0)).toBe(3);
  });

  it('handles diagonal segment', () => {
    // Segment (0,0)-(4,4), point (0,4) -> perpendicular to line
    const d = getDistanceToSegment(0, 4, 0, 0, 4, 4);
    expect(d).toBeCloseTo(Math.sqrt(8), 5); // 2*sqrt(2)
  });
});
