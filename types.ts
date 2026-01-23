
export interface Node {
  id: string;
  text: string;
  x: number;
  y: number;
  color?: string;
  type?: 'default' | 'magnet';
  pinned?: boolean; // New property for pinning nodes
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