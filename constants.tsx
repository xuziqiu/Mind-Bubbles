
export const COLORS = [
  '#0d9488', // Theme Teal (Default)
  '#dc2626', // Red
  '#ea580c', // Orange
  '#ca8a04', // Dark Yellow
  '#16a34a', // Green
  '#2563eb', // Blue
  '#9333ea', // Purple
  '#be185d', // Pink
  '#475569', // Slate
];

export const DEFAULT_DIMENSIONS = {
  circleRadius: 50,
  rectWidth: 180,
  rectHeight: 120
};

export const INITIAL_NODES = [
  { 
    id: 'root', 
    text: '想法', 
    x: 0, 
    y: 0, // Centered vertically
    vx: 0,
    vy: 0,
    color: '#0d9488', 
    shape: 'circle' as const,
    dimensions: { ...DEFAULT_DIMENSIONS }
  }
];

export const INITIAL_EDGES = [];

export const ZOOM_SENSITIVITY = 0.001;
export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 3;

// Tuned for Direct DOM Physics (Obsidian-like fluid feel)
export const DEFAULT_PHYSICS = {
    repulsion: 40,    // Much lower repulsion (was 85) to reduce tension
    length: 50,       // Reverted to 50 as requested (tight clusters)
    stiffness: 15,    // Slightly softer springs (was 20)
    gravity: 25,      // Increased gravity to 25 as requested
    friction: 35      // Higher friction (was 20) to stop jitter/nervousness
};
