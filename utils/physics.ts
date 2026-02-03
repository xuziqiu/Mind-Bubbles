import type { Node } from '../types';

export function getPhysicsRadius(node: Node): number {
  if (node.shape === 'circle') {
    return node.dimensions.circleRadius;
  }
  return (node.dimensions.rectWidth + node.dimensions.rectHeight) / 4;
}

/**
 * Map value in 0..100 to outMin..outMax.
 */
export function mapRange(value: number, outMin: number, outMax: number): number {
  return outMin + (value / 100) * (outMax - outMin);
}
