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
  pinned?: boolean;
  imageUrl?: string;
  shape: 'circle' | 'rectangle';
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
  label?: string;
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

export interface VisualEffect {
  id: string;
  x: number;
  y: number;
  type: 'create' | 'delete' | 'link' | 'unlink' | 'merge' | 'split';
  timestamp: number;
}

export interface HistoryState {
  nodes: Node[];
  edges: Edge[];
  timestamp?: number;
}

export interface SnapshotState {
  timestamp: number;
  nodes: Node[];
  edges: Edge[];
}

export interface DragState {
  isDown: boolean;
  button: number;
  mode: 'pan' | 'move_nodes' | 'box_select' | 'link_create' | 'resize_node' | 'edge_tighten' | null;
  startX: number;
  startY: number;
  startViewX: number;
  startViewY: number;
  initialSelection: Set<string>;
  linkSources: string[];
  resizeNodeId: string | null;
  targetEdgeId: string | null;
  tightenStartTime: number;
  tightenStartPos: { x: number; y: number } | null;
  initialDimensions: { circleRadius: number; rectWidth: number; rectHeight: number } | null;
  historySnapshot: HistoryState | null;
  dragStartPositions: Map<string, { x: number; y: number }>;
  draggedNodeIds: Set<string>;
}
