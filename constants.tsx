
export const COLORS = [
  '#0d9488', // Teal
  '#059669', // Emerald
  '#65a30d', // Lime
  '#0891b2', // Cyan
  '#d97706', // Amber
  '#db2777', // Pink (Contrast)
  '#475569', // Slate
  '#57534e', // Stone
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
    y: 0, 
    color: '#0d9488', // Teal default
    shape: 'circle' as const,
    dimensions: { ...DEFAULT_DIMENSIONS }
  }
];

export const INITIAL_EDGES = [];

export const ZOOM_SENSITIVITY = 0.001;
export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 3;

// Default Physics Params (0-100 scale)
export const DEFAULT_PHYSICS = {
    repulsion: 50, // Maps to force
    length: 30,    // Maps to pixel length
    stiffness: 20, // Maps to spring k
    gravity: 10,   // Maps to center pull
    friction: 50   // Maps to velocity decay
};
