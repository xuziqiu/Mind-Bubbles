
export interface Node {
  id: string;
  text: string;
  x: number;
  y: number;
  // Velocity for physics (inertia)
  vx?: number;
  vy?: number;
  
  color?: string;
  type?: 'default' | 'magnet';
  pinned?: boolean; // New property for pinning nodes
  imageUrl?: string; // Support for images
  // Shape configuration
  shape: 'circle' | 'rectangle';
  // Independent dimensions for each shape state
  dimensions: {
    circleRadius: number;
    rectWidth: number;
    rectHeight: number;
  };
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  label?: string; // Support for edge labels
}

export interface ViewState {
  scale: number;
  translateX: number;
  translateY: number;
}

export interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  nodeId?: string;
}
