import React, { useState, useRef, useCallback, useEffect, useLayoutEffect } from 'react';
import { Node as GraphNode, Edge, ViewState, ContextMenuState } from './types';
import { COLORS, INITIAL_NODES, INITIAL_EDGES, ZOOM_SENSITIVITY, MIN_ZOOM, MAX_ZOOM, DEFAULT_DIMENSIONS, DEFAULT_PHYSICS } from './constants';
import { 
  MousePointer2, 
  Trash2,
  Unlink,
  Link as LinkIcon,
  Plus,
  Wind,
  Settings2,
  X,
  Magnet,
  Square,
  Circle,
  Move,
  Code,
  Copy,
  Check,
  Upload,
  Snowflake,
  Mouse,
  Undo2,
  Redo2,
  Pin,
  PinOff,
  Image as ImageIcon,
  Target,
  Scissors,
  Merge,
  Volume2,
  VolumeX,
  BookOpen,
  Keyboard,
  Palette,
  Maximize,
  Moon,
  Sun,
  Search,
  FileJson,
  History,
  Save,
  FolderOpen
} from 'lucide-react';

// --- TRANSLATIONS ---
const TRANSLATIONS = {
  zh: {
    appTitle: "思 绪 气 泡",
    defaultNode: "想法",
    magnetNode: "磁铁",
    tips: {
      drag: "左键 · 拖拽选中",
      rightClick: "右键 · 连线创建",
      pan: "中键 · 平移画布",
      paste: "提示：Ctrl+V 可直接粘贴图片"
    },
    toolbar: {
      undo: "撤销 (Ctrl+Z)",
      redo: "重做 (Ctrl+Y)",
      shapeCircle: "形状：圆形",
      shapeRect: "形状：矩形",
      magnetActive: "定位并吸引想法",
      magnetInactive: "在中心生成磁铁",
      frozen: "已冻结",
      floating: "已悬浮",
      physics: "物理参数设置",
      fitView: "适应画布",
      io: "文件与数据",
      muted: "已静音",
      soundOn: "开启音效",
      help: "操作说明",
      lang: "切换语言",
      darkMode: "深色模式",
      lightMode: "浅色模式",
      search: "搜索 (Ctrl+F)",
      menu: "更多设置"
    },
    physics: {
      title: "物理参数",
      repulsion: "排斥力",
      length: "连线长度",
      stiffness: "弹性刚度",
      gravity: "向心力 (Gravity)",
      friction: "阻尼 (Friction)"
    },
    io: {
      title: "数据管理",
      tabCode: "代码 (Mermaid)",
      tabFile: "文件 (JSON)",
      tabHistory: "历史快照",
      export: "导出 Mermaid",
      import: "导入 Mermaid",
      exportImg: "导出为图片 (PNG)",
      saveFile: "保存为文件 (.mb)",
      loadFile: "打开文件",
      placeholderExport: "",
      placeholderImport: "粘贴 Mermaid 流程图代码...\n例如：\nA[想法] --> B((灵感))",
      copy: "复制",
      importBtn: "导入并生成脑图",
      importHint: "复制上方代码，可在 Notion 或 GitHub 中直接展示流程图。",
      error: "未能识别有效的 Mermaid 代码。",
      snapshotDesc: "自动保存最近 5 次的重要变更。",
      restore: "恢复",
      deleteSnap: "删除",
      noSnaps: "暂无快照记录",
      loadError: "文件格式错误"
    },
    context: {
      color: "颜色",
      defaultWhite: "默认白",
      toggleShape: "切换形状",
      pin: "固定位置",
      unpin: "解除固定",
      unlink: "断开连接",
      delete: "删除气泡"
    },
    canvas: {
      create: "创建气泡",
      link: "建立连接",
      unlink: "断开连接",
      split: "插入连线",
      merge: "拉紧融合",
      deleteZone: "释放删除",
      emptyState: "双击空白处创建"
    },
    help: {
      title: "操作指南",
      basic: "基础交互",
      drag: "左键拖拽",
      dragDesc: "移动气泡位置，或框选多个气泡",
      create: "双击空白处",
      createDesc: "在当前位置快速创建新气泡",
      right: "右键操作",
      rightDesc: "点击气泡唤出菜单，拖拽气泡创建连线",
      edit: "双击连线",
      editDesc: "为连线添加关系说明",
      advanced: "进阶技巧",
      paste: "粘贴图片",
      pasteDesc: "Ctrl+V 直接将剪贴板图片贴为气泡",
      merge: "拉紧融合",
      mergeDesc: "按住连线向中间拖拽，可合并两个想法",
      trash: "拖入右下角",
      trashDesc: "将气泡拖入右下角红区可快速删除",
      magnet: "磁铁模式",
      magnetDesc: "点击磁铁图标，一键吸附整理所有游离想法",
      shortcuts: "快捷键",
      undoKey: "撤销",
      redoKey: "重做",
      confirmKey: "确认编辑",
      newlineKey: "换行",
      tabKey: "创建子节点",
      tabDesc: "Tab 键快速创建并连接子节点",
      searchKey: "搜索",
      searchDesc: "Ctrl+F 快速查找并定位气泡"
    },
    search: {
      placeholder: "输入关键词搜索气泡...",
      noResults: "未找到结果"
    }
  },
  en: {
    appTitle: "M I N D  B U B B L E S",
    defaultNode: "Idea",
    magnetNode: "MAGNET",
    tips: {
      drag: "L-Click · Drag Select",
      rightClick: "R-Click · Link / Menu",
      pan: "M-Click · Pan View",
      paste: "Tip: Ctrl+V to paste images"
    },
    toolbar: {
      undo: "Undo (Ctrl+Z)",
      redo: "Redo (Ctrl+Y)",
      shapeCircle: "Shape: Circle",
      shapeRect: "Shape: Rectangle",
      magnetActive: "Locate & Attract",
      magnetInactive: "Spawn Magnet",
      frozen: "Frozen",
      floating: "Floating",
      physics: "Physics Settings",
      fitView: "Fit View",
      io: "Data & Files",
      muted: "Muted",
      soundOn: "Sound On",
      help: "Guide",
      lang: "Switch Language",
      darkMode: "Dark Mode",
      lightMode: "Light Mode",
      search: "Search (Ctrl+F)",
      menu: "More Settings"
    },
    physics: {
      title: "Physics",
      repulsion: "Repulsion",
      length: "Edge Length",
      stiffness: "Stiffness",
      gravity: "Gravity",
      friction: "Friction"
    },
    io: {
      title: "Data Manager",
      tabCode: "Code (Mermaid)",
      tabFile: "File (JSON)",
      tabHistory: "Snapshots",
      export: "Export Mermaid",
      import: "Import Mermaid",
      exportImg: "Export Image (PNG)",
      saveFile: "Save File (.mb)",
      loadFile: "Open File",
      placeholderExport: "",
      placeholderImport: "Paste Mermaid code...\ne.g.,\nA[Idea] --> B((Spark))",
      copy: "Copy",
      importBtn: "Import & Generate",
      importHint: "Copy code above for Notion or GitHub.",
      error: "Invalid Mermaid code.",
      snapshotDesc: "Auto-saves last 5 significant changes.",
      restore: "Restore",
      deleteSnap: "Delete",
      noSnaps: "No snapshots found",
      loadError: "Invalid File Format"
    },
    context: {
      color: "Color",
      defaultWhite: "White",
      toggleShape: "Toggle Shape",
      pin: "Pin Position",
      unpin: "Unpin",
      unlink: "Unlink",
      delete: "Delete Node"
    },
    canvas: {
      create: "Create Bubble",
      link: "Connect",
      unlink: "Disconnect",
      split: "Split Edge",
      merge: "Merge",
      deleteZone: "Drop to Delete",
      emptyState: "Double click to create"
    },
    help: {
      title: "User Guide",
      basic: "Basic",
      drag: "L-Click Drag",
      dragDesc: "Move nodes or box select.",
      create: "Double Click",
      createDesc: "Create a new bubble at cursor.",
      right: "Right Click",
      rightDesc: "Menu on node, or drag to link.",
      edit: "Double Click Edge",
      editDesc: "Add label to connection.",
      advanced: "Advanced",
      paste: "Paste Image",
      pasteDesc: "Ctrl+V to paste image as bubble.",
      merge: "Tension Merge",
      mergeDesc: "Drag edge tight to merge nodes.",
      trash: "Corner Trash",
      trashDesc: "Drag node to bottom-right to delete.",
      magnet: "Magnet Mode",
      magnetDesc: "Click magnet to organize clutter.",
      shortcuts: "Shortcuts",
      undoKey: "Undo",
      redoKey: "Redo",
      confirmKey: "Confirm",
      newlineKey: "New Line",
      tabKey: "Create Child",
      tabDesc: "Tab to spawn and link new node",
      searchKey: "Search",
      searchDesc: "Ctrl+F to find nodes"
    },
    search: {
      placeholder: "Search bubbles...",
      noResults: "No results found"
    }
  }
};

// --- AUDIO SYSTEM (Web Audio API) ---
const audioCtxRef = { current: null as AudioContext | null };

const initAudio = () => {
    if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
    }
};

const playSound = (type: 'pop' | 'click' | 'link' | 'unlink' | 'delete' | 'merge' | 'hover', muted: boolean) => {
    if (muted || !audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'pop') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
    } else if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now); 
        gain.gain.setValueAtTime(0.08, now); 
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
        osc.start(now);
        osc.stop(now + 0.03);
    } else if (type === 'link') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.2);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
    } else if (type === 'unlink') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.linearRampToValueAtTime(300, now + 0.15);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
    } else if (type === 'delete') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.2);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
    } else if (type === 'merge') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.3);
        const osc2 = ctx.createOscillator();
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(150, now);
        osc2.frequency.linearRampToValueAtTime(400, now + 0.3);
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.3);
        gain2.gain.setValueAtTime(0.05, now);
        gain2.gain.linearRampToValueAtTime(0, now + 0.3);
        
        osc.start(now); osc.stop(now + 0.3);
        osc2.start(now); osc2.stop(now + 0.3);
    }
};

const getPhysicsRadius = (node: GraphNode) => {
  if (node.shape === 'circle') {
    return node.dimensions.circleRadius;
  } else {
    return (node.dimensions.rectWidth + node.dimensions.rectHeight) / 4;
  }
};

const mapRange = (value: number, outMin: number, outMax: number) => {
    return outMin + (value / 100) * (outMax - outMin);
};

const getDistanceToSegment = (px: number, py: number, x1: number, y1: number, x2: number, y2: number) => {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;
    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    if (lenSq !== 0) param = dot / lenSq;
    let xx, yy;
    if (param < 0) { xx = x1; yy = y1; }
    else if (param > 1) { xx = x2; yy = y2; }
    else { xx = x1 + param * C; yy = y1 + param * D; }
    const dx = px - xx;
    const dy = py - yy;
    return Math.sqrt(dx * dx + dy * dy);
};

interface VisualEffect {
    id: string;
    x: number;
    y: number;
    type: 'create' | 'delete' | 'link' | 'unlink' | 'merge';
    timestamp: number;
}

interface HistoryState {
  nodes: GraphNode[];
  edges: Edge[];
  timestamp?: number;
}

const STORAGE_KEY = 'mindbubbles_data_v1';
const LANG_KEY = 'mindbubbles_lang';
const THEME_KEY = 'mindbubbles_theme';
const SNAPSHOTS_KEY = 'mindbubbles_snapshots';

const App: React.FC = () => {
  const [nodes, setNodes] = useState<GraphNode[]>(INITIAL_NODES);
  const [edges, setEdges] = useState<Edge[]>(INITIAL_EDGES);
  const [view, setView] = useState<ViewState>({ scale: 1, translateX: window.innerWidth / 2, translateY: window.innerHeight / 2 });
  const [effects, setEffects] = useState<VisualEffect[]>([]);
  
  const nodeRefs = useRef<Map<string, SVGGElement>>(new Map());
  const edgeRefs = useRef<Map<string, SVGLineElement>>(new Map());
  const edgeLabelRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  
  const simulationNodes = useRef<GraphNode[]>(JSON.parse(JSON.stringify(INITIAL_NODES)));

  const [hasInteracted, setHasInteracted] = useState(false);
  const [past, setPast] = useState<HistoryState[]>([]);
  const [future, setFuture] = useState<HistoryState[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const [lang, setLang] = useState<'zh' | 'en'>(() => {
      return (localStorage.getItem(LANG_KEY) as 'zh' | 'en') || 'zh';
  });
  
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(() => {
      return localStorage.getItem(THEME_KEY) === 'dark';
  });

  // Search State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Snapshot State
  const [snapshots, setSnapshots] = useState<{timestamp: number, nodes: GraphNode[], edges: Edge[]}[]>(() => {
      try {
          const saved = localStorage.getItem(SNAPSHOTS_KEY);
          return saved ? JSON.parse(saved) : [];
      } catch { return []; }
  });

  const t = TRANSLATIONS[lang];

  useEffect(() => {
      if (isDarkMode) {
          document.body.classList.add('dark');
      } else {
          document.body.classList.remove('dark');
      }
      localStorage.setItem(THEME_KEY, isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleLang = () => {
      setLang(prev => {
          const newLang = prev === 'zh' ? 'en' : 'zh';
          const newT = TRANSLATIONS[newLang];
          setNodes(currentNodes => currentNodes.map(n => {
              const isDefault = Object.values(TRANSLATIONS).some(tr => tr.defaultNode === n.text);
              const isMagnet = Object.values(TRANSLATIONS).some(tr => tr.magnetNode === n.text);
              if (isDefault) return { ...n, text: newT.defaultNode };
              if (isMagnet) return { ...n, text: newT.magnetNode };
              return n;
          }));
          return newLang;
      });
  };

  const [selectedNodeIds, setSelectedNodeIds] = useState<Set<string>>(new Set());
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editingEdgeId, setEditingEdgeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [nearHandleNodeId, setNearHandleNodeId] = useState<string | null>(null); 
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);

  const [isFloating, setIsFloating] = useState(true); 
  const [showPhysicsSettings, setShowPhysicsSettings] = useState(false);
  const [defaultShape, setDefaultShape] = useState<'circle' | 'rectangle'>('circle');

  const [ioModalOpen, setIoModalOpen] = useState(false);
  const [ioMode, setIoMode] = useState<'export' | 'import' | 'file' | 'history'>('export');
  const [ioText, setIoText] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [physicsParams, setPhysicsParams] = useState(DEFAULT_PHYSICS);

  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [selectionBox, setSelectionBox] = useState<{x: number, y: number, w: number, h: number} | null>(null);
  const [dragEdges, setDragEdges] = useState<{sourceId: string, x: number, y: number}[]>([]);
  
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipContent, setTooltipContent] = useState<{ text: string, type: 'create' | 'link' | 'unlink' | 'neutral' | 'split' | 'merge' } | null>(null);

  const [isOverTrash, setIsOverTrash] = useState(false);
  const [isDraggingNodes, setIsDraggingNodes] = useState(false);

  const editRef = useRef<HTMLDivElement>(null); 
  const edgeEditRef = useRef<HTMLInputElement>(null);
  const cursorRef = useRef<{x: number, y: number}>({ x: 0, y: 0 }); 
  const prevCursorRef = useRef<{x: number, y: number, time: number}>({ x: 0, y: 0, time: 0 });

  const dragRef = useRef<{
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
    tightenStartPos: { x: number, y: number } | null;
    initialDimensions: { circleRadius: number; rectWidth: number; rectHeight: number } | null;
    historySnapshot: HistoryState | null;
    dragStartPositions: Map<string, {x: number, y: number}>; 
    draggedNodeIds: Set<string>;
  }>({
    isDown: false,
    button: -1,
    mode: null,
    startX: 0,
    startY: 0,
    startViewX: 0,
    startViewY: 0,
    initialSelection: new Set(),
    linkSources: [],
    resizeNodeId: null,
    targetEdgeId: null,
    tightenStartTime: 0,
    tightenStartPos: null,
    initialDimensions: null,
    historySnapshot: null,
    dragStartPositions: new Map(),
    draggedNodeIds: new Set(),
  });

  const trashRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mergeLockRef = useRef(false);

  const screenToCanvas = useCallback((sx: number, sy: number) => ({
    x: (sx - view.translateX) / view.scale,
    y: (sy - view.translateY) / view.scale
  }), [view]);

  const getNodeAt = (x: number, y: number) => {
    for (let i = simulationNodes.current.length - 1; i >= 0; i--) {
      const n = simulationNodes.current[i];
      if (n.shape === 'circle') {
        const dist = Math.sqrt((n.x - x) ** 2 + (n.y - y) ** 2);
        if (dist <= n.dimensions.circleRadius) return n;
      } else {
        const w = n.dimensions.rectWidth;
        const h = n.dimensions.rectHeight;
        if (x >= n.x - w/2 && x <= n.x + w/2 && y >= n.y - h/2 && y <= n.y + h/2) {
            return n;
        }
      }
    }
    return null;
  };

  const getEdgeAt = (x: number, y: number, threshold = 20) => {
      let closestEdge = null;
      let minDistance = threshold / view.scale;
      const nodeMap = new Map<string, GraphNode>(simulationNodes.current.map(n => [n.id, n]));

      for (const edge of edges) {
          const s = nodeMap.get(edge.source);
          const t = nodeMap.get(edge.target);
          if (s && t) {
              const dist = getDistanceToSegment(x, y, s.x, s.y, t.x, t.y);
              if (dist < minDistance) {
                  minDistance = dist;
                  closestEdge = edge;
              }
          }
      }
      return closestEdge;
  };

  const hasMagnet = nodes.some(n => n.type === 'magnet');

  useLayoutEffect(() => {
    const newSimNodes: GraphNode[] = [];
    const prevMap = new Map<string, GraphNode>(simulationNodes.current.map(n => [n.id, n]));

    nodes.forEach(node => {
        const existing = prevMap.get(node.id);
        if (existing) {
            newSimNodes.push({
                ...node,
                x: existing.x,
                y: existing.y,
                vx: existing.vx,
                vy: existing.vy,
                dimensions: node.dimensions,
                shape: node.shape,
                text: node.text,
                color: node.color,
                imageUrl: node.imageUrl
            });
        } else {
            newSimNodes.push({ ...node, vx: 0, vy: 0 });
        }
    });
    simulationNodes.current = newSimNodes;
  }, [nodes]);

  const syncSimulationToState = useCallback(() => {
     setNodes(prev => prev.map(n => {
         const sim = simulationNodes.current.find(sn => sn.id === n.id);
         return sim ? { ...n, x: sim.x, y: sim.y, vx: sim.vx, vy: sim.vy } : n;
     }));
  }, []);

  const performFitView = useCallback((currentNodes: GraphNode[]) => {
      if (currentNodes.length === 0) {
          setView({ scale: 1, translateX: window.innerWidth / 2, translateY: window.innerHeight / 2 });
          return;
      }

      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      currentNodes.forEach(n => {
          const r = n.shape === 'circle' ? n.dimensions.circleRadius : Math.max(n.dimensions.rectWidth, n.dimensions.rectHeight) / 2;
          minX = Math.min(minX, n.x - r);
          minY = Math.min(minY, n.y - r);
          maxX = Math.max(maxX, n.x + r);
          maxY = Math.max(maxY, n.y + r);
      });

      const padding = 100;
      const width = maxX - minX + padding * 2;
      const height = maxY - minY + padding * 2;
      
      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;

      const scaleX = window.innerWidth / width;
      const scaleY = window.innerHeight / height;
      const newScale = Math.min(Math.max(Math.min(scaleX, scaleY), MIN_ZOOM), MAX_ZOOM);

      const newTx = (window.innerWidth / 2) - (centerX * newScale);
      const newTy = (window.innerHeight / 2) - (centerY * newScale);

      const startTx = view.translateX;
      const startTy = view.translateY;
      const startScale = view.scale;
      const startT = performance.now();

      const animate = (time: number) => {
          const t = Math.min((time - startT) / 600, 1);
          const ease = 1 - Math.pow(1 - t, 3);
          
          setView({ 
              scale: startScale + (newScale - startScale) * ease, 
              translateX: startTx + (newTx - startTx) * ease, 
              translateY: startTy + (newTy - startTy) * ease 
          });
          
          if (t < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
  }, [view]);

  useEffect(() => {
    localStorage.setItem(LANG_KEY, lang);
  }, [lang]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        let nodesLoaded = false;
        
        if (parsed.nodes && Array.isArray(parsed.nodes)) {
          const migratedNodes = parsed.nodes.map((n: any) => ({
             ...n, vx: n.vx || 0, vy: n.vy || 0
          }));
          setNodes(migratedNodes);
          setEdges(parsed.edges || []);
          if (parsed.nodes.length > 2) setHasInteracted(true);
          nodesLoaded = true;
        }

        if (parsed.view) {
            setView(parsed.view);
        } else if (nodesLoaded) {
            setTimeout(() => performFitView(parsed.nodes), 100);
        }
      } catch (e) {
        console.error("Failed to load saved data", e);
        // Fallback to initial state if data is corrupted
        setNodes(INITIAL_NODES);
        setEdges(INITIAL_EDGES);
      }
    } else {
        if (lang !== 'zh') {
            const currentT = TRANSLATIONS[lang];
            setNodes(prev => prev.map(n => {
                if (n.text === '想法') return { ...n, text: currentT.defaultNode };
                return n;
            }));
        }
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ nodes, edges, view }));
    }, 500);
    return () => clearTimeout(timeout);
  }, [nodes, edges, view]);

  useEffect(() => {
      const handlePaste = (e: ClipboardEvent) => {
          if (!e.clipboardData) return;
          const items = e.clipboardData.items;
          
          for (let i = 0; i < items.length; i++) {
              if (items[i].type.indexOf("image") !== -1) {
                  e.preventDefault();
                  const blob = items[i].getAsFile();
                  if (!blob) continue;
                  
                  const reader = new FileReader();
                  reader.onload = (event) => {
                      if (event.target?.result) {
                          const imageUrl = event.target.result as string;
                          const { x, y } = screenToCanvas(cursorRef.current.x, cursorRef.current.y);
                          
                          syncSimulationToState();
                          saveHistory();
                          playSound('pop', isMuted);
                          
                          const newNodeId = Math.random().toString(36).slice(2);
                          const newNode: GraphNode = {
                              id: newNodeId, 
                              text: '', 
                              imageUrl: imageUrl,
                              x: x, 
                              y: y,
                              color: '#fff', 
                              shape: 'rectangle', 
                              dimensions: { circleRadius: 60, rectWidth: 200, rectHeight: 200 }, 
                              vx: 0, 
                              vy: 0
                          };
                          
                          triggerEffect(x, y, 'create');
                          setNodes(prev => [...prev, newNode]);
                          setSelectedNodeIds(new Set([newNodeId]));
                      }
                  };
                  reader.readAsDataURL(blob);
                  return;
              }
          }
      };

      window.addEventListener('paste', handlePaste);
      return () => window.removeEventListener('paste', handlePaste);
  }, [screenToCanvas, isMuted, syncSimulationToState]);

  const saveHistory = useCallback(() => {
    setPast(prev => {
      const snapshotNodes = nodes.map(n => {
          const sim = simulationNodes.current.find(sn => sn.id === n.id);
          return sim ? { ...n, x: sim.x, y: sim.y } : n;
      });
      const newPast = [...prev, { nodes: JSON.parse(JSON.stringify(snapshotNodes)), edges: JSON.parse(JSON.stringify(edges)), timestamp: Date.now() }];
      if (newPast.length > 30) newPast.shift(); 
      return newPast;
    });
    setFuture([]);
    
    // Auto Snapshot
    setSnapshots(prev => {
        const snapshotNodes = nodes.map(n => {
            const sim = simulationNodes.current.find(sn => sn.id === n.id);
            return sim ? { ...n, x: sim.x, y: sim.y } : n;
        });
        const newState = { timestamp: Date.now(), nodes: JSON.parse(JSON.stringify(snapshotNodes)), edges: JSON.parse(JSON.stringify(edges)) };
        const newSnapshots = [newState, ...prev].slice(0, 5);
        localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(newSnapshots));
        return newSnapshots;
    });
  }, [nodes, edges]);

  const restoreSnapshot = (snapshot: any) => {
      setNodes(snapshot.nodes);
      setEdges(snapshot.edges);
      // Re-sync simulation
      simulationNodes.current = snapshot.nodes.map((n: GraphNode) => ({ ...n, vx: 0, vy: 0 }));
      setIoModalOpen(false);
      saveHistory(); // Create a standard undo point for the restore action
      playSound('pop', isMuted);
  };

  const handleUndo = useCallback(() => {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    setFuture(prev => [{ nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) }, ...prev]);
    setPast(newPast);
    setNodes(previous.nodes);
    setEdges(previous.edges);
    setEditingNodeId(null);
  }, [past, nodes, edges]);

  const handleRedo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    const newFuture = future.slice(1);
    setPast(prev => [...prev, { nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) }]);
    setFuture(newFuture);
    setNodes(next.nodes);
    setEdges(next.edges);
    setEditingNodeId(null);
  }, [future, nodes, edges]);

  const deleteNodes = (idsToDelete: Set<string>) => {
    if (idsToDelete.size > 0) {
        saveHistory();
        playSound('delete', isMuted);
    }
    const currentSim = simulationNodes.current;
    currentSim.forEach(n => { if (idsToDelete.has(n.id)) triggerEffect(n.x, n.y, 'delete'); });
    setNodes(prev => prev.filter(n => !idsToDelete.has(n.id)));
    setEdges(prev => prev.filter(e => !idsToDelete.has(e.source) && !idsToDelete.has(e.target)));
    setSelectedNodeIds(new Set());
    setEditingNodeId(null);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Priority: Editing Inputs
      if (editingNodeId || (editingEdgeId && (e.target as HTMLElement).tagName === 'INPUT')) {
          // Note: Enter handling for node text is now in the contentEditable onKeyDown
          if (editingEdgeId && e.key === 'Enter') {
             e.preventDefault();
             if (edgeEditRef.current) edgeEditRef.current.blur();
          }
          return; 
      }
      
      // Search
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
          e.preventDefault();
          setIsSearchOpen(true);
          setTimeout(() => searchInputRef.current?.focus(), 100);
          return;
      }

      // Arrow Key Navigation
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && selectedNodeIds.size === 1 && !isSearchOpen) {
          e.preventDefault();
          const currentId = [...selectedNodeIds][0];
          const current = simulationNodes.current.find(n => n.id === currentId);
          if (!current) return;

          let bestCandidate = null;
          let minDist = Infinity;

          simulationNodes.current.forEach(n => {
              if (n.id === currentId) return;
              const dx = n.x - current.x;
              const dy = n.y - current.y;
              let isValid = false;

              if (e.key === 'ArrowUp') isValid = dy < 0 && Math.abs(dx) < Math.abs(dy) * 2;
              if (e.key === 'ArrowDown') isValid = dy > 0 && Math.abs(dx) < Math.abs(dy) * 2;
              if (e.key === 'ArrowLeft') isValid = dx < 0 && Math.abs(dy) < Math.abs(dx) * 2;
              if (e.key === 'ArrowRight') isValid = dx > 0 && Math.abs(dy) < Math.abs(dx) * 2;

              if (isValid) {
                  const dist = dx*dx + dy*dy;
                  if (dist < minDist) {
                      minDist = dist;
                      bestCandidate = n.id;
                  }
              }
          });

          if (bestCandidate) {
              setSelectedNodeIds(new Set([bestCandidate]));
              const n = simulationNodes.current.find(n => n.id === bestCandidate);
              if (n) {
                // Auto Pan if out of view
                 // Optional: Smoothly pan to keep node in view
              }
          }
      }

      // Tab: Create Child Node
      if (e.key === 'Tab' && selectedNodeIds.size === 1 && !isSearchOpen) {
          e.preventDefault();
          const parentId = [...selectedNodeIds][0];
          const parent = simulationNodes.current.find(n => n.id === parentId);
          if (!parent) return;

          syncSimulationToState();
          saveHistory();

          // Determine angle: prefer away from other nodes
          // Simple heuristic: Random angle for organic feel, or fixed if needed.
          const angle = Math.random() * Math.PI * 2; 
          const dist = 150;
          const nx = parent.x + Math.cos(angle) * dist;
          const ny = parent.y + Math.sin(angle) * dist;

          const newNodeId = Math.random().toString(36).slice(2);
          const newNode: GraphNode = {
              id: newNodeId, text: '', x: nx, y: ny, color: parent.color,
              shape: parent.shape, dimensions: { ...DEFAULT_DIMENSIONS }, vx: 0, vy: 0
          };

          const newEdge: Edge = {
              id: Math.random().toString(36).slice(2),
              source: parentId,
              target: newNodeId
          };

          setNodes(prev => [...prev, newNode]);
          setEdges(prev => [...prev, newEdge]);
          setSelectedNodeIds(new Set([newNodeId]));
          setEditingNodeId(newNodeId); // Focus immediately
          playSound('pop', isMuted);
          triggerEffect(nx, ny, 'create');
      }

      // Undo/Redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) handleRedo(); else handleUndo();
        e.preventDefault();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) {
         handleRedo(); e.preventDefault();
      }

      // Delete
      if (e.key === 'Delete' || e.key === 'Backspace') {
          if (selectedNodeIds.size > 0 && !isSearchOpen) {
              deleteNodes(selectedNodeIds);
          }
      }

      // Escape
      if (e.key === 'Escape') {
          setSelectedNodeIds(new Set());
          setContextMenu(null);
          setHelpModalOpen(false);
          setShowPhysicsSettings(false);
          setIoModalOpen(false);
          setIsSearchOpen(false);
          setIsMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, editingNodeId, editingEdgeId, selectedNodeIds, deleteNodes, isSearchOpen]);

  const triggerEffect = (x: number, y: number, type: VisualEffect['type']) => {
      const id = Math.random().toString(36).slice(2);
      setEffects(prev => [...prev, { id, x, y, type, timestamp: Date.now() }]);
      setTimeout(() => {
          setEffects(prev => prev.filter(e => e.id !== id));
      }, 800); 
  };

  const performMerge = (nodeAId: string, nodeBId: string) => {
      mergeLockRef.current = true;
      
      const nodeA = nodes.find(n => n.id === nodeAId);
      const nodeB = nodes.find(n => n.id === nodeBId);
      
      if (!nodeA || !nodeB) {
          mergeLockRef.current = false;
          return;
      }
      
      playSound('merge', isMuted);
      saveHistory();
      
      const clickPos = dragRef.current.tightenStartPos;
      let survivor = nodeA;
      let absorbed = nodeB;

      if (clickPos) {
          const distA = Math.sqrt((nodeA.x - clickPos.x)**2 + (nodeA.y - clickPos.y)**2);
          const distB = Math.sqrt((nodeB.x - clickPos.x)**2 + (nodeB.y - clickPos.y)**2);
          if (distB < distA) {
              survivor = nodeB;
              absorbed = nodeA;
          }
      }

      const survivorSimNode = simulationNodes.current.find(n => n.id === survivor.id);
      if (survivorSimNode) {
          survivorSimNode.vx = 0;
          survivorSimNode.vy = 0;
      }

      triggerEffect(survivor.x, survivor.y, 'merge');
      
      setNodes(prev => {
          const newNodes = prev.filter(n => n.id !== absorbed.id).map(n => {
              if (n.id === survivor.id) {
                  const newDims = { ...n.dimensions };
                  if (n.shape === 'circle') newDims.circleRadius *= 1.1;
                  else { newDims.rectWidth *= 1.1; newDims.rectHeight *= 1.1; }
                  
                  let newText = n.text;
                  const isPlaceholder = Object.values(TRANSLATIONS).some(tr => tr.defaultNode === absorbed.text);
                  
                  if (!isPlaceholder) {
                      newText = n.text + '\n' + absorbed.text;
                  }
                  
                  return { ...n, dimensions: newDims, text: newText };
              }
              return n;
          });
          return newNodes;
      });
      
      setEdges(prev => {
          const newEdges = prev.map(e => {
              if (e.source === absorbed.id && e.target !== survivor.id) return { ...e, source: survivor.id };
              if (e.target === absorbed.id && e.source !== survivor.id) return { ...e, target: survivor.id };
              return e;
          }).filter(e => {
              if (e.source === survivor.id && e.target === survivor.id) return false;
              if (e.source === absorbed.id && e.target === survivor.id) return false;
              if (e.target === absorbed.id && e.source === survivor.id) return false;
              return true;
          });
          
          const uniqueEdges: Edge[] = [];
          const seen = new Set<string>();
          newEdges.forEach(e => {
              const k = [e.source, e.target].sort().join('-');
              if (!seen.has(k)) { seen.add(k); uniqueEdges.push(e); }
          });
          
          return uniqueEdges;
      });
      
      dragRef.current = { ...dragRef.current, isDown: false, mode: null, targetEdgeId: null };
      setHoveredEdgeId(null);
      setTooltipContent(null);
      
      setTimeout(() => { mergeLockRef.current = false; }, 100);
  };

  const updateNodeColor = (targetId: string, color: string) => {
      syncSimulationToState();
      saveHistory();
      const targetIds = selectedNodeIds.has(targetId) ? selectedNodeIds : new Set([targetId]);
      setNodes(prev => prev.map(n => targetIds.has(n.id) ? { ...n, color } : n));
      setContextMenu(null);
  };

  useEffect(() => {
    let animationFrameId: number;

    const repulsionStrength = mapRange(physicsParams.repulsion, 200, 4000); 
    const baseTargetLength = mapRange(physicsParams.length, 50, 400);
    const stiffness = mapRange(physicsParams.stiffness, 0.005, 0.1); 
    const gravityStrength = mapRange(physicsParams.gravity, 0, 0.05);
    const damping = mapRange(100 - physicsParams.friction, 0.8, 0.98); 

    const tick = () => {
      const now = Date.now();
      const simNodes = simulationNodes.current;
      const nodeCount = simNodes.length;
      const nodeMap = new Map<string, GraphNode>(simNodes.map(n => [n.id, n]));

      const isDragging = dragRef.current.isDown && dragRef.current.mode === 'move_nodes';
      const isEdgeTightening = dragRef.current.isDown && dragRef.current.mode === 'edge_tighten' && dragRef.current.targetEdgeId;
      
      let chargeProgress = 0;
      if (isEdgeTightening) {
          const chargeDuration = 1000; 
          chargeProgress = Math.min((now - dragRef.current.tightenStartTime) / chargeDuration, 1);
      }

      const draggingIds = new Set<string>();
      let dragDx = 0, dragDy = 0;
      
      if (isDragging) {
           dragRef.current.draggedNodeIds.forEach(id => draggingIds.add(id));
           dragDx = (cursorRef.current.x - dragRef.current.startX) / view.scale;
           dragDy = (cursorRef.current.y - dragRef.current.startY) / view.scale;
      }

      if (isFloating) {
        for (let i = 0; i < nodeCount; i++) {
            const node = simNodes[i];
            
            if (draggingIds.has(node.id)) continue; 

            const isResizing = dragRef.current.isDown && dragRef.current.mode === 'resize_node' && dragRef.current.resizeNodeId === node.id;
            if (isResizing || editingNodeId === node.id || node.pinned) {
                node.vx = 0;
                node.vy = 0;
                continue;
            }

            let fx = 0, fy = 0;
            const myRadius = getPhysicsRadius(node);

            if (!isDragging && !isEdgeTightening) {
                fx += (Math.random() - 0.5) * 0.15;
                fy += (Math.random() - 0.5) * 0.15;
            }

            for (let j = 0; j < nodeCount; j++) {
                if (i === j) continue;
                const other = simNodes[j];
                const dx = node.x - other.x;
                const dy = node.y - other.y;
                let distSq = dx * dx + dy * dy;
                if (distSq < 1) distSq = 1;

                const dist = Math.sqrt(distSq);
                const force = repulsionStrength * (myRadius + getPhysicsRadius(other)) / distSq;
                if (dist > 0) {
                    fx += (dx / dist) * force;
                    fy += (dy / dist) * force;
                }
            }
            
            node.vx = (node.vx || 0) + fx * 0.1;
            node.vy = (node.vy || 0) + fy * 0.1;
        }

        edges.forEach(edge => {
            const u = nodeMap.get(edge.source);
            const v = nodeMap.get(edge.target);
            if (u && v) {
               const dx = v.x - u.x;
               const dy = v.y - u.y;
               const dist = Math.sqrt(dx * dx + dy * dy);
               
               let targetLength = baseTargetLength;
               let currentStiffness = stiffness;

               const isMagnetConnection = u.type === 'magnet' || v.type === 'magnet';

               if (isEdgeTightening && edge.id === dragRef.current.targetEdgeId && !isMagnetConnection) {
                   const powerCurve = chargeProgress * chargeProgress; 
                   targetLength = baseTargetLength * (1 - powerCurve); 
                   currentStiffness = 0.08 + (powerCurve * 0.3);

                   if (!mergeLockRef.current && chargeProgress > 0.75 && dist < (getPhysicsRadius(u) + getPhysicsRadius(v)) * 0.9) {
                      performMerge(u.id, v.id);
                   }
               }
               
               let displacement = dist - targetLength;
               const force = displacement * currentStiffness;
               
               if (dist > 0) {
                   const fx = (dx / dist) * force;
                   const fy = (dy / dist) * force;
                   
                   if (!draggingIds.has(u.id) && editingNodeId !== u.id && !u.pinned) {
                       u.vx = (u.vx || 0) + fx * 0.1;
                       u.vy = (u.vy || 0) + fy * 0.1;
                   }
                   if (!draggingIds.has(v.id) && editingNodeId !== v.id && !v.pinned) {
                       v.vx = (v.vx || 0) - fx * 0.1;
                       v.vy = (v.vy || 0) - fy * 0.1;
                   }
               }
            }
        });

        for (let i = 0; i < nodeCount; i++) {
            const node = simNodes[i];
            if (draggingIds.has(node.id) || editingNodeId === node.id || node.pinned) continue;

            const gfx = -node.x * gravityStrength;
            const gfy = -node.y * gravityStrength;
            
            node.vx += gfx * 0.05;
            node.vy += gfy * 0.05;

            node.vx *= damping;
            node.vy *= damping;
            node.x += node.vx;
            node.y += node.vy;
        }
      }

      if (draggingIds.size > 0) {
          draggingIds.forEach(id => {
              const node = simNodes.find(n => n.id === id);
              if (node) {
                  const startPos = dragRef.current.dragStartPositions.get(node.id);
                  if (startPos) {
                      node.x = startPos.x + dragDx;
                      node.y = startPos.y + dragDy;
                      node.vx = 0;
                      node.vy = 0;
                  }
              }
          });
      }

      simNodes.forEach(n => {
          const el = nodeRefs.current.get(n.id);
          if (el) {
              el.setAttribute('transform', `translate(${n.x}, ${n.y})`);
          }
      });

      edges.forEach(e => {
         const el = edgeRefs.current.get(e.id);
         const s = nodeMap.get(e.source);
         const t = nodeMap.get(e.target);
         
         if (el && s && t) {
             el.setAttribute('x1', s.x.toString());
             el.setAttribute('y1', s.y.toString());
             el.setAttribute('x2', t.x.toString());
             el.setAttribute('y2', t.y.toString());
             
             const isMagnetConnection = s.type === 'magnet' || t.type === 'magnet';

             if (isEdgeTightening && e.id === dragRef.current.targetEdgeId && !isMagnetConnection) {
                 const width = 2 + (chargeProgress * 6);
                 el.setAttribute('stroke', chargeProgress > 0.5 ? '#d97706' : '#94a3b8'); 
                 el.setAttribute('stroke-width', width.toString());
                 el.setAttribute('stroke-opacity', '1');
             } else if (hoveredEdgeId === e.id) {
                 el.setAttribute('stroke', '#0d9488');
                 el.setAttribute('stroke-width', '4');
                 el.setAttribute('stroke-opacity', '1');
             } else {
                 el.setAttribute('stroke', isDarkMode ? '#475569' : '#cbd5e1');
                 el.setAttribute('stroke-width', '2');
                 el.setAttribute('stroke-opacity', '1');
             }

             if (e.label || editingEdgeId === e.id) {
                 const labelEl = edgeLabelRefs.current.get(e.id);
                 if (labelEl) {
                     const midX = (s.x + t.x) / 2;
                     const midY = (s.y + t.y) / 2;
                     
                     labelEl.style.transformOrigin = '0 0';

                     if (editingEdgeId === e.id) {
                         labelEl.style.transform = `translate(${midX}px, ${midY}px) translate(-50%, -50%)`;
                     } else {
                         const dx = t.x - s.x;
                         const dy = t.y - s.y;
                         let angle = Math.atan2(dy, dx) * (180 / Math.PI);
                         if (angle > 90 || angle < -90) {
                             angle += 180;
                         }
                         labelEl.style.transform = `translate(${midX}px, ${midY}px) rotate(${angle}deg) translate(-50%, -50%)`;
                     }
                 }
             }
         }
      });

      animationFrameId = requestAnimationFrame(tick);
    };
    
    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isFloating, edges, editingNodeId, physicsParams, view.scale, hoveredEdgeId, editingEdgeId, isDarkMode]);


  const handleExportImage = () => {
      if (nodes.length === 0) return;
      const svgElement = containerRef.current?.querySelector('svg');
      if (!svgElement) return;
      
      const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;
      const contentGroup = clonedSvg.querySelector('g');
      if (contentGroup) contentGroup.setAttribute('transform', 'translate(0, 0) scale(1)');
      
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      simulationNodes.current.forEach(n => {
          const r = n.shape === 'circle' ? n.dimensions.circleRadius : Math.max(n.dimensions.rectWidth, n.dimensions.rectHeight) / 2;
          minX = Math.min(minX, n.x - r - 20);
          minY = Math.min(minY, n.y - r - 20);
          maxX = Math.max(maxX, n.x + r + 20);
          maxY = Math.max(maxY, n.y + r + 20);
      });
      const width = maxX - minX;
      const height = maxY - minY;
      if (width <= 0) return;

      clonedSvg.setAttribute('viewBox', `${minX} ${minY} ${width} ${height}`);
      clonedSvg.setAttribute('width', `${width}`);
      clonedSvg.setAttribute('height', `${height}`);

      // Inject dark mode styles if needed for export
      const styleEl = document.createElement("style");
      styleEl.textContent = `
        text { font-family: system-ui, sans-serif; }
      `;
      clonedSvg.prepend(styleEl);

      const foreignObjects = clonedSvg.querySelectorAll('foreignObject');
      foreignObjects.forEach(fo => {
          const parent = fo.parentElement;
          if (!parent) return;
          
          const img = fo.querySelector('img');
          if (img) {
              const imageEl = document.createElementNS("http://www.w3.org/2000/svg", "image");
              imageEl.setAttribute("href", img.src);
              imageEl.setAttribute("x", fo.getAttribute("x") || "0");
              imageEl.setAttribute("y", fo.getAttribute("y") || "0");
              imageEl.setAttribute("width", fo.getAttribute("width") || "0");
              imageEl.setAttribute("height", fo.getAttribute("height") || "0");
              imageEl.setAttribute("preserveAspectRatio", "xMidYMid slice");
              parent.replaceChild(imageEl, fo);
              return;
          }

          const textDiv = fo.querySelector('div');
          const textContent = (textDiv as HTMLElement)?.innerText || '';
          const isCircle = parent.querySelector('circle') !== null;
          
          const textEl = document.createElementNS("http://www.w3.org/2000/svg", "text");
          const textColor = isDarkMode ? "#f1f5f9" : "#334155";
          textEl.setAttribute("fill", textColor);
          textEl.setAttribute("font-family", "system-ui, sans-serif");
          textEl.setAttribute("font-size", "14px");
          
          if (isCircle) {
             textEl.setAttribute("text-anchor", "middle");
             textEl.setAttribute("dominant-baseline", "middle");
          } else {
             const rect = parent.querySelector('rect');
             const w = rect ? parseFloat(rect.getAttribute('width') || '0') : 0;
             const h = rect ? parseFloat(rect.getAttribute('height') || '0') : 0;
             textEl.setAttribute("x", `${-w/2 + 20}`); 
             textEl.setAttribute("y", `${-h/2 + 25}`); 
          }
          
          textContent.split('\n').forEach((line, i) => {
              const tspan = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
              tspan.textContent = line;
              if (isCircle) {
                  tspan.setAttribute("x", "0");
                  tspan.setAttribute("dy", i === 0 ? "0.3em" : "1.2em");
              } else {
                  tspan.setAttribute("x", textEl.getAttribute("x") || "0");
                  tspan.setAttribute("dy", i === 0 ? "0" : "1.4em");
              }
              textEl.appendChild(tspan);
          });
          parent.replaceChild(textEl, fo);
      });

      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(clonedSvg);
      const img = new Image();
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = width * 2;
          canvas.height = height * 2;
          const ctx = canvas.getContext('2d');
          if (ctx) {
             // Fill background
             ctx.fillStyle = isDarkMode ? '#0f172a' : '#f8fafc';
             ctx.fillRect(0, 0, canvas.width, canvas.height);
             
             ctx.scale(2, 2);
             ctx.drawImage(img, 0, 0, width, height);
             try {
                const link = document.createElement('a');
                link.href = canvas.toDataURL('image/png');
                link.download = `mindbubbles-export-${Date.now()}.png`;
                link.click();
             } catch (e) {}
          }
          URL.revokeObjectURL(url);
      };
      img.src = url;
  };
  
  const handleSaveFile = () => {
      // Sync simulation state before saving
      syncSimulationToState();
      const data = {
          version: 1,
          timestamp: Date.now(),
          nodes: simulationNodes.current.map(n => ({...n, vx:0, vy:0})),
          edges: edges,
          view: view
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `mindbubbles-${new Date().toISOString().slice(0,10)}.mb`;
      link.click();
      URL.revokeObjectURL(url);
  };

  const handleLoadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
          try {
              const data = JSON.parse(evt.target?.result as string);
              if (data.nodes && Array.isArray(data.nodes)) {
                  setNodes(data.nodes);
                  setEdges(data.edges || []);
                  if (data.view) setView(data.view);
                  
                  // Reset simulation
                  simulationNodes.current = data.nodes.map((n: GraphNode) => ({ ...n, vx: 0, vy: 0 }));
                  
                  saveHistory();
                  setIoModalOpen(false);
                  playSound('pop', isMuted);
              } else {
                  alert(t.io.loadError);
              }
          } catch (err) {
              alert(t.io.loadError);
          }
      };
      reader.readAsText(file);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleOpenExport = () => {
    let mermaid = "graph TD\n";
    simulationNodes.current.forEach(n => {
        const safeText = n.text.replace(/"/g, "'").replace(/\n/g, ' ');
        const safeId = n.id.replace(/[^a-zA-Z0-9_-]/g, '_');
        if (n.type === 'magnet') return; 
        if (n.shape === 'circle') mermaid += `    ${safeId}(("${safeText}"))\n`;
        else mermaid += `    ${safeId}["${safeText}"]\n`;
    });
    mermaid += "\n";
    edges.forEach(e => {
        const s = e.source.replace(/[^a-zA-Z0-9_-]/g, '_');
        const t = e.target.replace(/[^a-zA-Z0-9_-]/g, '_');
        if (nodes.find(n => n.id === e.source && n.type !== 'magnet') && nodes.find(n => n.id === e.target && n.type !== 'magnet')) {
            const edgeLabel = e.label ? `|${e.label}|` : '';
            mermaid += `    ${s} -->${edgeLabel} ${t}\n`;
        }
    });
    setIoText(mermaid);
    setIoMode('export');
    setCopySuccess(false);
    setIoModalOpen(true);
  };

  const handleCopyCode = async () => {
      try { await navigator.clipboard.writeText(ioText); setCopySuccess(true); setTimeout(() => setCopySuccess(false), 2000); } catch (err) {}
  };

  const handleImportMermaid = () => {
      syncSimulationToState(); 
      saveHistory();
      const lines = ioText.split('\n');
      const newNodes: GraphNode[] = [];
      const newEdges: Edge[] = [];
      const nodeMap = new Map<string, GraphNode>();
      let nodeCounter = 0;
      const cx = (window.innerWidth / 2 - view.translateX) / view.scale;
      const cy = (window.innerHeight / 2 - view.translateY) / view.scale;

      const createNode = (id: string, text: string, shape: 'circle' | 'rectangle'): GraphNode => {
        if (nodeMap.has(id)) return nodeMap.get(id)!;
        const angle = nodeCounter * 0.8; 
        const radius = 60 + (nodeCounter * 45);
        const newNode: GraphNode = {
            id, text: text || id, x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius,
            color: COLORS[0], shape, dimensions: { ...DEFAULT_DIMENSIONS }, vx: 0, vy: 0
        };
        nodeMap.set(id, newNode); newNodes.push(newNode); nodeCounter++;
        return newNode;
      };

      const parseNodeStr = (raw: string) => {
          let id = raw, text = '', shape: 'circle' | 'rectangle' = 'rectangle';
          const circle = raw.match(/^([a-zA-Z0-9_-]+)\s*\(\((.*?)\)\)/);
          const rect = raw.match(/^([a-zA-Z0-9_-]+)\s*\[(.*?)\]/);
          if (circle) { id = circle[1]; text = circle[2].replace(/^"|"$/g, ''); shape = 'circle'; }
          else if (rect) { id = rect[1]; text = rect[2].replace(/^"|"$/g, ''); shape = 'rectangle'; }
          else { id = raw.replace(/\s/g, ''); }
          return { id, text, shape };
      };

      lines.forEach(line => {
          line = line.trim();
          if (!line || line.startsWith('graph') || line.startsWith('flowchart')) return;
          if (line.includes('-->')) {
              const [p1, p2] = line.split('-->');
              let label = '';
              if (p1.includes('|')) {
                  const parts = p1.split('|');
                  if (parts.length === 3) {
                       label = parts[1];
                  }
              }
              
              const s = parseNodeStr(p1.replace(/\|.*?\|/, '').trim());
              const t = parseNodeStr(p2.trim());
              createNode(s.id, s.text, s.shape);
              createNode(t.id, t.text, t.shape);
              newEdges.push({ id: `edge-${Math.random()}`, source: s.id, target: t.id, label });
          } else {
              const p = parseNodeStr(line);
              if (p.text) createNode(p.id, p.text, p.shape);
          }
      });

      if (newNodes.length > 0) { setNodes(newNodes); setEdges(newEdges); setIoModalOpen(false); }
      else alert(t.io.error);
  };

  const checkLinkAction = (sources: string[], targetId: string) => {
      const allLinked = sources.every(sourceId => 
          edges.some(e => (e.source === sourceId && e.target === targetId) || (e.source === targetId && e.target === sourceId))
      );
      return allLinked ? 'unlink' : 'link';
  };

  const handleLinkAction = (targetId: string | null, x: number, y: number) => {
      const sources = dragRef.current.linkSources;
      if (sources.length === 0) return;

      syncSimulationToState();
      saveHistory();

      if (targetId) {
          if (sources.includes(targetId)) return; 

          const action = checkLinkAction(sources, targetId);
          
          if (action === 'unlink') {
              setEdges(prev => prev.filter(e => {
                  const isSourceMatch = sources.includes(e.source) && e.target === targetId;
                  const isTargetMatch = sources.includes(e.target) && e.source === targetId;
                  return !(isSourceMatch || isTargetMatch);
              }));
              playSound('unlink', isMuted);
              triggerEffect(x, y, 'unlink');
          } else {
              const newEdges: Edge[] = [];
              sources.forEach(sourceId => {
                  const exists = edges.some(e => (e.source === sourceId && e.target === targetId) || (e.source === targetId && e.target === sourceId));
                  if (!exists) {
                      newEdges.push({
                          id: Math.random().toString(36).slice(2),
                          source: sourceId,
                          target: targetId
                      });
                  }
              });
              setEdges(prev => [...prev, ...newEdges]);
              playSound('link', isMuted);
              triggerEffect(x, y, 'link');
          }
      } else {
          const newNodeId = Math.random().toString(36).slice(2);
          const newNode: GraphNode = {
              id: newNodeId,
              text: t.defaultNode,
              x, 
              y,
              color: COLORS[0],
              shape: defaultShape,
              dimensions: { ...DEFAULT_DIMENSIONS },
              vx: 0, 
              vy: 0
          };
          
          const newEdges = sources.map(sourceId => ({
              id: Math.random().toString(36).slice(2),
              source: sourceId,
              target: newNodeId
          }));

          setNodes(prev => [...prev, newNode]);
          setEdges(prev => [...prev, ...newEdges]);
          setSelectedNodeIds(new Set([newNodeId]));
          setEditingNodeId(newNodeId);
          playSound('pop', isMuted);
          triggerEffect(x, y, 'create');
      }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest('button') || 
          (e.target as HTMLElement).closest('.io-modal') ||
          (e.target as HTMLElement).closest('.physics-panel') ||
          (e.target as HTMLElement).closest('.help-modal') ||
          (e.target as HTMLElement).closest('.menu-popover') ||
          (e.target as HTMLElement).closest('.search-bar')) return;

      const { x, y } = screenToCanvas(e.clientX, e.clientY);
      const clickedNode = getNodeAt(x, y);

      if (clickedNode) {
          setEditingNodeId(clickedNode.id);
          setSelectedNodeIds(new Set([clickedNode.id]));
      } else {
          syncSimulationToState();
          saveHistory();
          const newNodeId = Math.random().toString(36).slice(2);
          const newNode: GraphNode = {
              id: newNodeId,
              text: t.defaultNode,
              x, 
              y,
              color: COLORS[0],
              shape: defaultShape,
              dimensions: { ...DEFAULT_DIMENSIONS },
              vx: 0, 
              vy: 0
          };
          setNodes(prev => [...prev, newNode]);
          setEditingNodeId(newNodeId);
          setSelectedNodeIds(new Set([newNodeId]));
          playSound('pop', isMuted);
          triggerEffect(x, y, 'create');
      }
  };

  const handleMagnetClick = () => {
      syncSimulationToState();
      
      if (hasMagnet) {
          const magnet = nodes.find(n => n.type === 'magnet');
          if (magnet) {
              setView(prev => {
                  const newTx = (window.innerWidth / 2) - (magnet.x * prev.scale);
                  const newTy = (window.innerHeight / 2) - (magnet.y * prev.scale);
                  return { ...prev, translateX: newTx, translateY: newTy };
              });
              
              simulationNodes.current.forEach(n => {
                  if (n.type !== 'magnet' && !n.pinned) {
                      const dx = magnet.x - n.x;
                      const dy = magnet.y - n.y;
                      const dist = Math.sqrt(dx*dx + dy*dy);
                      if (dist > 100) { 
                           const strength = 15;
                           n.vx += (dx / dist) * strength;
                           n.vy += (dy / dist) * strength;
                      }
                  }
              });
              playSound('click', isMuted);
          }
      } else {
          saveHistory();
          const { x, y } = screenToCanvas(window.innerWidth / 2, window.innerHeight / 2);
          const magnetNode: GraphNode = {
              id: Math.random().toString(36).slice(2),
              text: t.magnetNode,
              x, 
              y,
              type: 'magnet',
              shape: 'circle',
              dimensions: { ...DEFAULT_DIMENSIONS, circleRadius: 60 },
              vx: 0, 
              vy: 0,
              pinned: false
          };
          setNodes(prev => [...prev, magnetNode]);
          playSound('pop', isMuted);
      }
  };

  const handleResetView = () => {
      syncSimulationToState();
      performFitView(nodes);
  };

  const toggleShape = (nodeId: string) => {
      syncSimulationToState();
      saveHistory();
      setNodes(prev => prev.map(n => {
          if (n.id === nodeId) {
              const newShape = n.shape === 'circle' ? 'rectangle' : 'circle';
              return { ...n, shape: newShape };
          }
          return n;
      }));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.physics-panel') || (e.target as HTMLElement).closest('.io-modal') || (e.target as HTMLElement).closest('.help-modal') || (e.target as HTMLElement).closest('.menu-popover') || (e.target as HTMLElement).closest('.toolbar-wrapper') || (e.target as HTMLElement).closest('.search-bar')) return; 
    if ((e.target as HTMLElement).isContentEditable) return;
    if (editingEdgeId && (e.target as HTMLElement).tagName === 'INPUT') return; 

    initAudio(); 
    setHasInteracted(true);
    // Close overlays if clicking on canvas
    setIsSearchOpen(false);
    setIsMenuOpen(false);

    if (editingNodeId) {
        if (editRef.current) {
            syncSimulationToState();
            saveHistory();
            const text = editRef.current.innerText.trim();
            setNodes(prev => prev.map(n => n.id === editingNodeId ? { ...n, text: text } : n));
        }
        setEditingNodeId(null);
    }
    
    if (editingEdgeId) {
         if (edgeEditRef.current) {
             const text = edgeEditRef.current.value.trim();
             saveHistory();
             setEdges(prev => prev.map(edge => edge.id === editingEdgeId ? { ...edge, label: text } : edge));
         }
         setEditingEdgeId(null);
    }

    e.preventDefault(); setContextMenu(null); 
    
    dragRef.current.historySnapshot = { nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) };

    if ((e.target as HTMLElement).getAttribute('data-resize-handle')) {
        const nodeId = (e.target as HTMLElement).getAttribute('data-node-id');
        const node = simulationNodes.current.find(n => n.id === nodeId);
        if (node) {
            dragRef.current = { ...dragRef.current, isDown: true, button: 0, mode: 'resize_node', resizeNodeId: nodeId, initialDimensions: { ...node.dimensions }, startX: e.clientX, startY: e.clientY };
        }
        return;
    }

    const { x, y } = screenToCanvas(e.clientX, e.clientY);
    const clickedNode = getNodeAt(x, y);
    const clickedEdge = getEdgeAt(x, y);

    dragRef.current = { 
      ...dragRef.current, 
      isDown: true, 
      button: e.button, 
      mode: null, 
      startX: e.clientX, 
      startY: e.clientY, 
      startViewX: view.translateX, 
      startViewY: view.translateY, 
      initialSelection: new Set(selectedNodeIds), 
      linkSources: [], 
      resizeNodeId: null, 
      targetEdgeId: null, 
      tightenStartTime: 0,
      tightenStartPos: null,
      initialDimensions: null,
      draggedNodeIds: new Set() 
    };
    
    dragRef.current.dragStartPositions.clear();
    simulationNodes.current.forEach(n => dragRef.current.dragStartPositions.set(n.id, {x: n.x, y: n.y}));

    prevCursorRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };

    if (e.button === 1) { dragRef.current.mode = 'pan'; return; }
    
    if (e.button === 2) {
      if (clickedNode) {
        dragRef.current.mode = 'link_create';
        const sources = selectedNodeIds.has(clickedNode.id) ? Array.from(selectedNodeIds) : [clickedNode.id];
        if (!selectedNodeIds.has(clickedNode.id)) setSelectedNodeIds(new Set([clickedNode.id]));
        dragRef.current.linkSources = sources;
        setDragEdges(sources.map(id => ({ sourceId: id, x, y })));
        playSound('click', isMuted);
      } else {
        // Right click empty space
        dragRef.current.mode = null; // Will trigger create/context logic on mouse up
      }
      return;
    }

    if (e.button === 0) {
      if (clickedNode) {
        dragRef.current.mode = 'move_nodes';
        let newSelection = new Set(selectedNodeIds);
        if (e.ctrlKey || e.metaKey) {
          if (newSelection.has(clickedNode.id)) newSelection.delete(clickedNode.id); else newSelection.add(clickedNode.id);
          setSelectedNodeIds(newSelection);
        } else {
          if (!newSelection.has(clickedNode.id)) { newSelection = new Set([clickedNode.id]); setSelectedNodeIds(newSelection); }
        }
        
        const effectiveSelection = (e.ctrlKey || e.metaKey || !selectedNodeIds.has(clickedNode.id)) ? newSelection : selectedNodeIds;
        dragRef.current.draggedNodeIds = effectiveSelection;
        
        playSound('click', isMuted);

      } else if (clickedEdge) {
        setHoveredEdgeId(clickedEdge.id);
        dragRef.current.mode = 'edge_tighten';
        dragRef.current.targetEdgeId = clickedEdge.id;
        dragRef.current.tightenStartTime = Date.now();
        dragRef.current.tightenStartPos = { x: x, y: y }; 
        setTooltipContent({ text: t.canvas.merge, type: 'merge' });
        if (tooltipRef.current) {
            tooltipRef.current.style.transform = `translate(${e.clientX + 15}px, ${e.clientY + 15}px)`;
        }
      } else {
        dragRef.current.mode = 'box_select';
        if (!e.ctrlKey && !e.metaKey) { setSelectedNodeIds(new Set()); dragRef.current.initialSelection = new Set(); }
        setEditingNodeId(null);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    cursorRef.current = { x: e.clientX, y: e.clientY };
    const now = Date.now();
    if (now - prevCursorRef.current.time > 50) {
        prevCursorRef.current = { x: e.clientX, y: e.clientY, time: now };
    }

    if (tooltipRef.current) {
        tooltipRef.current.style.transform = `translate(${e.clientX + 15}px, ${e.clientY + 15}px)`;
    }

    const { x: cx, y: cy } = screenToCanvas(e.clientX, e.clientY);
    
    let closestHandle = null, minH = Infinity;
    simulationNodes.current.forEach(n => {
        if (n.type === 'magnet') return;
        const r = n.shape === 'circle' ? n.dimensions.circleRadius : 0;
        const w = n.shape === 'rectangle' ? n.dimensions.rectWidth : 0;
        const h = n.shape === 'rectangle' ? n.dimensions.rectHeight : 0;
        const hx = n.shape === 'circle' ? n.x + r * 0.707 : n.x + w/2 - 2;
        const hy = n.shape === 'circle' ? n.y + r * 0.707 : n.y + h/2 - 2;
        const d = Math.sqrt((cx - hx)**2 + (cy - hy)**2);
        if (d < 30/view.scale && d < minH) { minH = d; closestHandle = n.id; }
    });
    if (nearHandleNodeId !== closestHandle) setNearHandleNodeId(closestHandle);

    if (!dragRef.current.isDown) {
      const hovered = getNodeAt(cx, cy);
      if (hoveredNodeId !== (hovered?.id || null)) setHoveredNodeId(hovered?.id || null);
      
      if (hovered) {
          if (hoveredEdgeId !== null) setHoveredEdgeId(null);
      } else {
          const edge = getEdgeAt(cx, cy);
          if (hoveredEdgeId !== (edge?.id || null)) setHoveredEdgeId(edge?.id || null);
      }
      return;
    }

    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    const dist = Math.sqrt(dx*dx + dy*dy);
    const isDragging = dist > 4;

    if (isDragging) {
      if (dragRef.current.mode === 'pan') {
        setView(v => ({ ...v, translateX: dragRef.current.startViewX + dx, translateY: dragRef.current.startViewY + dy }));
      }
      else if (dragRef.current.mode === 'move_nodes') {
        if (!isDraggingNodes) setIsDraggingNodes(true);
        const mDist = Math.sqrt((e.clientX - window.innerWidth)**2 + (e.clientY - window.innerHeight)**2);
        const newIsOverTrash = mDist < 350;
        if (newIsOverTrash !== isOverTrash) {
             setIsOverTrash(newIsOverTrash);
             if (newIsOverTrash) playSound('click', isMuted); 
        }
      }
      else if (dragRef.current.mode === 'edge_tighten') {
      }
      else if (dragRef.current.mode === 'resize_node' && dragRef.current.resizeNodeId && dragRef.current.initialDimensions) {
         const ddx = (e.clientX - dragRef.current.startX) / view.scale;
         const ddy = (e.clientY - dragRef.current.startY) / view.scale;
         const node = simulationNodes.current.find(n => n.id === dragRef.current.resizeNodeId);
         if (node) {
             if (node.shape === 'circle') {
                 node.dimensions.circleRadius = Math.max(30, dragRef.current.initialDimensions!.circleRadius + ddx);
             } else {
                 node.dimensions.rectWidth = Math.max(100, dragRef.current.initialDimensions!.rectWidth + ddx*2);
                 node.dimensions.rectHeight = Math.max(60, dragRef.current.initialDimensions!.rectHeight + ddy*2);
             }
             setNodes(prev => prev.map(n => n.id === dragRef.current.resizeNodeId ? { ...n, dimensions: { ...node.dimensions } } : n));
         }
      }
      else if (dragRef.current.mode === 'box_select') {
        const sx = dragRef.current.startX, sy = dragRef.current.startY;
        const bx = Math.min(sx, e.clientX), by = Math.min(sy, e.clientY);
        const bw = Math.abs(e.clientX - sx), bh = Math.abs(e.clientY - sy);
        setSelectionBox({ x: bx, y: by, w: bw, h: bh });
        
        const cbx = (bx - view.translateX) / view.scale, cby = (by - view.translateY) / view.scale;
        const cbw = bw / view.scale, cbh = bh / view.scale;
        
        const newSet = new Set(e.ctrlKey || e.metaKey ? dragRef.current.initialSelection : []);
        simulationNodes.current.forEach(n => {
            const w = n.shape === 'circle' ? n.dimensions.circleRadius*2 : n.dimensions.rectWidth;
            const h = n.shape === 'circle' ? n.dimensions.circleRadius*2 : n.dimensions.rectHeight;
            if (!(n.x - w/2 > cbx + cbw || n.x + w/2 < cbx || n.y - h/2 > cby + cbh || n.y + h/2 < cby)) newSet.add(n.id);
        });
        setSelectedNodeIds(newSet);
      }
      else if (dragRef.current.mode === 'link_create') {
        setDragEdges(dragRef.current.linkSources.map(id => {
            const src = simulationNodes.current.find(n => n.id === id);
            return { sourceId: id, x: cx, y: cy };
        }));
        
        const hovered = getNodeAt(cx, cy);
        if (hoveredNodeId !== (hovered?.id || null)) setHoveredNodeId(hovered?.id || null);
        const edge = getEdgeAt(cx, cy);
        if (hoveredEdgeId !== (edge?.id || null)) setHoveredEdgeId(edge?.id || null);

        let text = t.canvas.create;
        let type: 'create' | 'link' | 'unlink' | 'split' = 'create';
        if (hovered) {
          const action = checkLinkAction(dragRef.current.linkSources, hovered.id);
          text = action === 'unlink' ? t.canvas.unlink : t.canvas.link;
          type = action === 'unlink' ? 'unlink' : 'link';
        } else if (edge) {
            text = t.canvas.split;
            type = 'split';
        }
        
        if (tooltipContent?.text !== text || tooltipContent?.type !== type) {
            setTooltipContent({ text, type } as any);
        }
      }
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    const { isDown, mode, startX, startY, button, historySnapshot } = dragRef.current;
    if (!isDown) return;
    const dx = e.clientX - startX, dy = e.clientY - startY;
    const isDrag = Math.sqrt(dx*dx + dy*dy) > 4;

    if ((mode === 'move_nodes' && isDrag)) {
        if (historySnapshot) {
             setPast(prev => {
                const newPast = [...prev, historySnapshot];
                if (newPast.length > 30) newPast.shift();
                return newPast;
             });
             setFuture([]);
        }
        
        if (isFloating) {
             const dt = Date.now() - prevCursorRef.current.time;
             const throwVx = (e.clientX - prevCursorRef.current.x) / view.scale / Math.max(dt, 16) * 15; 
             const throwVy = (e.clientY - prevCursorRef.current.y) / view.scale / Math.max(dt, 16) * 15;
             
             const draggedIds = dragRef.current.draggedNodeIds;
             
             simulationNodes.current.forEach(n => {
                 if (draggedIds.has(n.id)) {
                     const speed = Math.sqrt(throwVx*throwVx + throwVy*throwVy);
                     const maxSpeed = 30;
                     let finalVx = throwVx, finalVy = throwVy;
                     if (speed > maxSpeed) {
                         finalVx = (throwVx/speed)*maxSpeed;
                         finalVy = (throwVy/speed)*maxSpeed;
                     }
                     n.vx = finalVx;
                     n.vy = finalVy;
                 }
             });
        }
        
        syncSimulationToState();
    }

    if (mode === 'resize_node') {
        dragRef.current = { ...dragRef.current, isDown: false, mode: null, resizeNodeId: null }; return;
    }
    
    if (mode === 'edge_tighten') {
        dragRef.current = { ...dragRef.current, isDown: false, mode: null, targetEdgeId: null };
        setTooltipContent(null);
        setHoveredEdgeId(null);
        return;
    }

    const { x: cx, y: cy } = screenToCanvas(e.clientX, e.clientY);
    const clickedNode = getNodeAt(cx, cy);

    if (button === 0) {
      if (mode === 'move_nodes') {
        if (isDrag) {
          if (isOverTrash) deleteNodes(dragRef.current.draggedNodeIds);
        } else {
          if (clickedNode) {
            if (selectedNodeIds.has(clickedNode.id)) {
               if (selectedNodeIds.size > 1 && !e.ctrlKey && !e.metaKey) setSelectedNodeIds(new Set([clickedNode.id]));
            } else setSelectedNodeIds(new Set([clickedNode.id]));
          }
        }
      }
      else if (mode === 'box_select' && !isDrag) {
        setSelectedNodeIds(new Set()); setEditingNodeId(null);
      }
    }
    if (button === 2) {
      if (mode === 'link_create' && isDrag) {
        const target = getNodeAt(cx, cy);
        handleLinkAction(target?.id || null, cx, cy);
      } else if (!isDrag) {
        const edge = getEdgeAt(cx, cy);
        if (clickedNode) {
           setContextMenu({ visible: true, x: e.clientX, y: e.clientY, nodeId: clickedNode.id });
           playSound('click', isMuted);
        } else if (edge) {
            setHoveredEdgeId(edge.id); 
            handleLinkAction(null, cx, cy);
        } else {
          // Right click on empty space -> Create Node
          syncSimulationToState();
          saveHistory();
          const newNodeId = Math.random().toString(36).slice(2);
          const newNode: GraphNode = {
            id: newNodeId, text: t.defaultNode, x: cx, y: cy, color: COLORS[0],
            shape: defaultShape, dimensions: { ...DEFAULT_DIMENSIONS }, vx: 0, vy: 0
          };
          playSound('pop', isMuted);
          triggerEffect(cx, cy, 'create');
          setNodes(prev => [...prev, newNode]);
          setEditingNodeId(newNodeId);
          setSelectedNodeIds(new Set([newNodeId]));
        }
      }
    }

    dragRef.current = { ...dragRef.current, isDown: false, mode: null, linkSources: [] };
    dragRef.current.dragStartPositions.clear();
    setSelectionBox(null); setDragEdges([]); setTooltipContent(null);
    setIsDraggingNodes(false); setIsOverTrash(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (ioModalOpen) return;
    setHasInteracted(true);
    
    // Direct Zoom logic
    const delta = -e.deltaY * ZOOM_SENSITIVITY;
    const newScale = Math.min(Math.max(view.scale * (1 + delta), MIN_ZOOM), MAX_ZOOM);
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Compute new translate to keep mouse pointer fixed
    const dx = x - view.translateX;
    const dy = y - view.translateY;
    const newTx = x - (dx / view.scale) * newScale;
    const newTy = y - (dy / view.scale) * newScale;
    
    setView({ scale: newScale, translateX: newTx, translateY: newTy });
    setContextMenu(null);
  };

  return (
    <div 
      ref={containerRef}
      className={`relative w-screen h-screen overflow-hidden select-none text-slate-800 dark:text-slate-100 ${dragRef.current.mode === 'pan' ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDoubleClick={handleDoubleClick}
      onWheel={handleWheel}
      onContextMenu={(e) => e.preventDefault()}
      style={{
          backgroundPosition: `${view.translateX}px ${view.translateY}px`,
          backgroundSize: `${24 * view.scale}px ${24 * view.scale}px`
      }}
    >
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <g transform={`translate(${view.translateX}, ${view.translateY}) scale(${view.scale})`}>
          
          {effects.map(effect => (
              <g key={effect.id} transform={`translate(${effect.x}, ${effect.y})`}>
                  {effect.type === 'create' && (
                      <circle r="40" fill="none" stroke="#0d9488" strokeWidth="2" className="effect-ripple"/>
                  )}
                  {effect.type === 'delete' && (
                      <circle r="40" fill="none" stroke="#ef4444" strokeWidth="2" className="effect-pop"/>
                  )}
                  {effect.type === 'merge' && (
                      <circle r="60" fill="none" stroke="#d97706" strokeWidth="3" className="effect-ripple"/>
                  )}
              </g>
          ))}

          {edges.map(edge => {
            const s = simulationNodes.current.find(n => n.id === edge.source) || {x:0, y:0};
            const t = simulationNodes.current.find(n => n.id === edge.target) || {x:0, y:0};
            return (
                <g key={edge.id}>
                  <line
                    ref={el => { if (el) edgeRefs.current.set(edge.id, el); else edgeRefs.current.delete(edge.id); }}
                    x1={s.x} y1={s.y} x2={t.x} y2={t.y}
                    stroke={hoveredEdgeId === edge.id ? "#0d9488" : (isDarkMode ? "#475569" : "#cbd5e1")}
                    strokeWidth={hoveredEdgeId === edge.id ? 4 : 2}
                    strokeLinecap="round"
                    className="transition-colors duration-200 pointer-events-auto cursor-pointer" 
                  />
                  <line 
                    x1={s.x} y1={s.y} x2={t.x} y2={t.y}
                    stroke="transparent"
                    strokeWidth="15"
                    className="pointer-events-auto cursor-pointer"
                  />
                </g>
            );
          })}

          {dragEdges.map((de, i) => {
            const s = simulationNodes.current.find(n => n.id === de.sourceId) || {x:0, y:0};
            return (
              <line
                key={`drag-${i}`}
                x1={s.x} y1={s.y} x2={de.x} y2={de.y}
                stroke="#0d9488"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                className="opacity-60"
              />
            );
          })}
          
          {nodes.map(node => {
            const isSelected = selectedNodeIds.has(node.id);
            const isHovered = hoveredNodeId === node.id;
            const isDestruct = isDraggingNodes && isSelected && isOverTrash;
            const isMagnet = node.type === 'magnet';
            const isEditing = editingNodeId === node.id;
            const hasImage = !!node.imageUrl;
            
            const isCircle = node.shape === 'circle';
            const radius = node.dimensions.circleRadius;
            const width = node.dimensions.rectWidth;
            const height = node.dimensions.rectHeight;
            
            const showResizeHandle = !isDestruct && (nearHandleNodeId === node.id || (dragRef.current.mode === 'resize_node' && dragRef.current.resizeNodeId === node.id));
            
            // Dark mode color adjustments
            let nodeColor = node.color && node.color !== '#fff' ? node.color : (isDarkMode ? '#334155' : '#cbd5e1'); 
            if (node.color === '#fff' && !isDarkMode) nodeColor = '#cbd5e1'; // Default light mode border
            if (node.color === '#fff' && isDarkMode) nodeColor = '#475569'; // Default dark mode border
            
            const strokeColor = isDestruct ? '#ef4444' : (isSelected ? nodeColor : (isHovered ? nodeColor : nodeColor)); 
            const strokeWidth = isDestruct || isSelected ? 4 : 1.5; 
            const filterStyle = isSelected ? `drop-shadow(0 0 8px ${nodeColor}33)` : 'drop-shadow(0 2px 4px rgba(0,0,0,0.05))';
            
            const fillColor = isDestruct ? '#fecaca' : (isDarkMode ? '#1e293b' : 'white');
            const textClass = isDestruct ? 'text-red-600' : (hasImage ? 'text-white' : (isDarkMode ? 'text-slate-100' : 'text-slate-700'));

            return (
              <g 
                key={node.id} 
                ref={el => { if (el) nodeRefs.current.set(node.id, el); else nodeRefs.current.delete(node.id); }}
                transform={`translate(${node.x}, ${node.y})`}
                className="will-change-transform"
              >
                <g className="node-appear">
                  {isMagnet ? (
                    <g className="origin-center">
                      <circle r={radius * 1.4} className="animate-pulse" fill={isDarkMode ? "#78350f" : "#fef3c7"} opacity="0.5" />
                      <circle 
                          r={radius}
                          fill={isDarkMode ? "#451a03" : "#fffbeb"} 
                          stroke={isSelected ? '#d97706' : '#f59e0b'}
                          strokeWidth={isSelected ? 3 : 2}
                          style={{ filter: 'drop-shadow(0 8px 16px rgba(245, 158, 11, 0.2))' }}
                      />
                      <foreignObject x={-radius} y={-radius} width={radius*2} height={radius*2} className="pointer-events-none">
                          <div className="w-full h-full flex items-center justify-center">
                              <Magnet size={28} className="text-amber-500" />
                          </div>
                      </foreignObject>
                    </g>
                  ) : (
                    <g>
                      {isCircle ? (
                          <>
                              {hasImage ? (
                                <g>
                                  <defs>
                                      <clipPath id={`clip-${node.id}`}>
                                          <circle r={radius} />
                                      </clipPath>
                                  </defs>
                                  <circle
                                      r={radius}
                                      fill={fillColor}
                                      stroke={strokeColor}
                                      strokeWidth={strokeWidth}
                                      style={{ filter: filterStyle, transition: 'stroke 0.2s, filter 0.2s, stroke-width 0.2s' }}
                                  />
                                </g>
                              ) : (
                                  <circle
                                      r={radius}
                                      fill={fillColor}
                                      stroke={strokeColor}
                                      strokeWidth={strokeWidth}
                                      style={{ filter: filterStyle, transition: 'stroke 0.2s, filter 0.2s, stroke-width 0.2s' }}
                                  />
                              )}

                              {node.pinned && (
                                <g transform={`translate(${radius * 0.707 - 10}, ${-radius * 0.707 + 10})`}>
                                   <circle r="8" fill={isDarkMode ? "#0f172a" : "white"} stroke="#64748b" strokeWidth="1" />
                                   <Pin size={10} className="text-slate-500" x="-5" y="-5"/>
                                </g>
                              )}
                              {showResizeHandle && (
                                  <g transform={`translate(${radius * 0.707}, ${radius * 0.707})`}>
                                      <circle 
                                          data-resize-handle="true"
                                          data-node-id={node.id}
                                          r={14} 
                                          fill="transparent" 
                                          className="cursor-nwse-resize pointer-events-auto"
                                      />
                                      <circle 
                                          r={5}
                                          fill="white"
                                          stroke="#0d9488"
                                          strokeWidth={2}
                                          className="pointer-events-none"
                                      />
                                  </g>
                              )}
                          </>
                      ) : (
                          <>
                              <rect
                                  x={-width/2} y={-height/2}
                                  width={width} height={height}
                                  rx={12} ry={12}
                                  fill={fillColor}
                                  stroke={strokeColor}
                                  strokeWidth={strokeWidth}
                                  style={{ filter: filterStyle, transition: 'stroke 0.2s, filter 0.2s, stroke-width 0.2s' }}
                              />
                              {node.pinned && (
                                <g transform={`translate(${width/2 - 12}, ${-height/2 + 12})`}>
                                   <circle r="8" fill={isDarkMode ? "#0f172a" : "white"} stroke="#64748b" strokeWidth="1" />
                                   <Pin size={10} className="text-slate-500" x="-5" y="-5"/>
                                </g>
                              )}
                              {showResizeHandle && (
                                  <g transform={`translate(${width/2 - 2}, ${height/2 - 2})`}>
                                      <circle 
                                          data-resize-handle="true"
                                          data-node-id={node.id}
                                          r={14} 
                                          fill="transparent" 
                                          className="cursor-nwse-resize pointer-events-auto"
                                      />
                                      <circle 
                                          r={5}
                                          fill="white"
                                          stroke="#0d9488"
                                          strokeWidth={2}
                                          className="pointer-events-none"
                                      />
                                  </g>
                              )}
                          </>
                      )}
                      
                      <foreignObject 
                          x={isCircle ? -radius : -width/2} 
                          y={isCircle ? -radius : -height/2} 
                          width={isCircle ? radius*2 : width} 
                          height={isCircle ? radius*2 : height} 
                          className="pointer-events-none"
                          style={{ borderRadius: isCircle ? '50%' : '12px', overflow: 'hidden' }}
                      >
                        {hasImage && (
                            <div className="absolute inset-0 pointer-events-none">
                                <img src={node.imageUrl} className="w-full h-full object-cover opacity-90" alt="" />
                            </div>
                        )}

                        <div className={`relative w-full h-full flex overflow-hidden z-10 ${isCircle ? 'items-center justify-center text-center p-4' : 'items-start justify-start text-left p-5'}`}>
                          {isEditing ? (
                            <div
                              key="editor"
                              contentEditable
                              suppressContentEditableWarning
                              className={`w-full bg-transparent outline-none font-medium pointer-events-auto ${hasImage ? 'text-white drop-shadow-md font-bold text-shadow' : textClass} ${isCircle ? 'text-center' : 'text-left'}`}
                              style={{ fontSize: '0.875rem', lineHeight: '1.5', minHeight: '1em', whiteSpace: 'pre-wrap', wordBreak: 'break-word', textShadow: hasImage ? '0 1px 2px rgba(0,0,0,0.8)' : 'none' }}
                              onBlur={(e) => {
                                  const text = e.currentTarget.innerText.trim();
                                  syncSimulationToState();
                                  saveHistory();
                                  setNodes(prev => prev.map(n => n.id === editingNodeId ? { ...n, text: text } : n));
                                  setEditingNodeId(null);
                              }}
                              onKeyDown={(e) => {
                                  e.stopPropagation();
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                      e.preventDefault();
                                      e.currentTarget.blur();
                                  }
                              }}
                              onMouseDown={e => e.stopPropagation()}
                              ref={el => {
                                  editRef.current = el; 
                                  if (el && !el.dataset.initialized) {
                                      el.innerText = node.text;
                                      el.dataset.initialized = "true";
                                      if (document.activeElement !== el) {
                                          el.focus();
                                          const range = document.createRange();
                                          range.selectNodeContents(el);
                                          if (node.shape !== 'circle') range.collapse(false);
                                          const sel = window.getSelection();
                                          if (sel) { sel.removeAllRanges(); sel.addRange(range); }
                                      }
                                  }
                              }}
                            />
                          ) : (
                            <div 
                              key="viewer"
                              className={`font-medium select-none ${textClass}`}
                              style={{ fontSize: '0.875rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word', width: '100%', textShadow: hasImage ? '0 1px 3px rgba(0,0,0,0.8)' : 'none' }}
                            >
                              {node.text}
                            </div>
                          )}
                        </div>
                      </foreignObject>
                    </g>
                  )}
                </g>
              </g>
            );
          })}
        </g>
      </svg>
      
      {/* Empty State Call to Action */}
      {nodes.length === 0 && (
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0 opacity-40">
              <div className="text-2xl font-light text-slate-400 dark:text-slate-600 tracking-widest uppercase text-center animate-pulse">
                  {t.canvas.emptyState}
              </div>
          </div>
      )}

      {/* SEARCH BAR OVERLAY */}
      {isSearchOpen && (
          <div className="fixed top-24 right-8 z-[60] search-bar animate-in fade-in slide-in-from-top-4">
              <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search size={18} className="text-slate-400 group-focus-within:text-teal-500 transition-colors"/>
                  </div>
                  <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                          const val = e.target.value;
                          setSearchQuery(val);
                          // Auto focus logic
                          if (val.trim()) {
                              const found = nodes.find(n => n.text.toLowerCase().includes(val.toLowerCase()));
                              if (found) {
                                  setSelectedNodeIds(new Set([found.id]));
                                  setView(prev => ({ ...prev, translateX: (window.innerWidth / 2) - (found.x * prev.scale), translateY: (window.innerHeight / 2) - (found.y * prev.scale) }));
                              }
                          }
                      }}
                      placeholder={t.search.placeholder}
                      className="w-64 bg-white/90 dark:bg-slate-800/90 backdrop-blur shadow-xl border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500 dark:text-slate-100 transition-all"
                  />
                  <div className="absolute top-12 right-0 bg-white dark:bg-slate-800 shadow-xl rounded-lg overflow-hidden border border-slate-100 dark:border-slate-700 w-64 max-h-60 overflow-y-auto">
                      {nodes.filter(n => searchQuery && n.text.toLowerCase().includes(searchQuery.toLowerCase())).map(n => (
                          <div 
                            key={n.id} 
                            className="px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer text-xs text-slate-600 dark:text-slate-300 border-b border-slate-50 dark:border-slate-700/50 last:border-0 truncate"
                            onClick={() => {
                                setSelectedNodeIds(new Set([n.id]));
                                setView(prev => ({ ...prev, translateX: (window.innerWidth / 2) - (n.x * prev.scale), translateY: (window.innerHeight / 2) - (n.y * prev.scale) }));
                                setIsSearchOpen(false);
                            }}
                          >
                              {n.text}
                          </div>
                      ))}
                      {searchQuery && nodes.filter(n => n.text.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                          <div className="px-4 py-2 text-xs text-slate-400 text-center">{t.search.noResults}</div>
                      )}
                  </div>
              </div>
          </div>
      )}
      
      {/* Edge Labels (DOM Overlay for crisper text and interactivity) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="origin-top-left w-full h-full" style={{ transform: `translate(${view.translateX}px, ${view.translateY}px) scale(${view.scale})` }}>
              {edges.map(edge => {
                   if (!edge.label && editingEdgeId !== edge.id) return null;
                   return (
                       <div 
                           key={`label-${edge.id}`}
                           ref={el => { if (el) edgeLabelRefs.current.set(edge.id, el); else edgeLabelRefs.current.delete(edge.id); }}
                           className="absolute pointer-events-auto flex items-center justify-center origin-center"
                           style={{ 
                               left: 0, top: 0, // Base position
                               width: 'fit-content', 
                               height: 'fit-content',
                               transformOrigin: 'center center'
                           }} 
                       >
                           {editingEdgeId === edge.id ? (
                               <input 
                                   ref={edgeEditRef}
                                   defaultValue={edge.label}
                                   className="bg-white border border-teal-500 rounded px-2 py-1 text-xs text-slate-700 shadow-xl outline-none min-w-[60px] text-center"
                                   style={{ transform: 'translate(-50%, -50%)', whiteSpace: 'nowrap' }}
                                   autoFocus
                                   onKeyDown={e => e.stopPropagation()} 
                                   onBlur={(e) => {
                                       const text = e.target.value.trim();
                                       saveHistory();
                                       setEdges(prev => prev.map(ed => ed.id === edge.id ? { ...ed, label: text } : ed));
                                       setEditingEdgeId(null);
                                   }}
                               />
                           ) : (
                               <div 
                                   onDoubleClick={(e) => {
                                       e.stopPropagation();
                                       setEditingEdgeId(edge.id);
                                   }}
                                   className="text-[11px] font-bold text-slate-500 dark:text-slate-400 cursor-text hover:text-teal-600 transition-colors whitespace-nowrap select-none px-1 leading-none py-0.5"
                                   style={{ 
                                       textShadow: isDarkMode ? '0 0 3px #0f172a, 0 0 3px #0f172a' : '0 0 3px white, 0 0 3px white', 
                                       backgroundColor: 'transparent',
                                   }}
                               >
                                   {edge.label}
                               </div>
                           )}
                       </div>
                   );
              })}
          </div>
      </div>

      {/* Immersive Center Guide - Re-designed for 'Artistic Minimalist' style in CHINESE */}
      <div 
        className={`fixed top-[25%] left-1/2 -translate-x-1/2 pointer-events-none z-0 transition-opacity duration-1000 ease-out flex flex-col items-center ${nodes.length >= 2 ? 'opacity-0' : 'opacity-100'}`}
      >
         {/* Title: Huge, Thin, Subtle, Wide Spacing */}
        <h1 className="text-8xl font-light text-slate-200 dark:text-slate-800 tracking-[0.5em] mb-16 select-none whitespace-nowrap transition-colors duration-500" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            {t.appTitle}
        </h1>
        
        {/* Guide: Minimalist Row with Thin Dividers */}
        <div className="flex items-center gap-12 text-slate-300 dark:text-slate-700 font-light text-lg tracking-widest whitespace-nowrap transition-colors duration-500">
            <div className="flex flex-col items-center gap-2 group">
                <MousePointer2 strokeWidth={1} size={32} className="text-slate-400 dark:text-slate-600 group-hover:text-teal-400 transition-colors duration-500" />
                <span className="text-xs uppercase text-slate-400 dark:text-slate-600">{t.tips.drag}</span>
            </div>
            
            <div className="h-12 w-px bg-slate-200/50 dark:bg-slate-700/50" />
            
            <div className="flex flex-col items-center gap-2 group">
                <Move strokeWidth={1} size={32} className="text-slate-400 dark:text-slate-600 group-hover:text-teal-400 transition-colors duration-500" />
                <span className="text-xs uppercase text-slate-400 dark:text-slate-600">{t.tips.rightClick}</span>
            </div>
            
            <div className="h-12 w-px bg-slate-200/50 dark:bg-slate-700/50" />
            
            <div className="flex flex-col items-center gap-2 group">
                <Mouse strokeWidth={1} size={32} className="text-slate-400 dark:text-slate-600 group-hover:text-teal-400 transition-colors duration-500" />
                <span className="text-xs uppercase text-slate-400 dark:text-slate-600">{t.tips.pan}</span>
            </div>
        </div>
      </div>

      {/* Physics Settings Panel */}
      {showPhysicsSettings && (
        <div className="physics-panel fixed top-4 right-8 w-64 bg-white/90 dark:bg-slate-800/90 backdrop-blur shadow-xl border border-slate-200 dark:border-slate-700 rounded-xl p-4 animate-in fade-in zoom-in-95 duration-200 z-50">
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2"><Wind size={16} className="text-teal-500"/> {t.physics.title}</h3>
             <button onClick={() => setShowPhysicsSettings(false)} className="text-slate-400 hover:text-slate-600"><X size={16}/></button>
          </div>
          <div className="space-y-4">
             <div className="space-y-1"><div className="flex justify-between text-xs text-slate-500 dark:text-slate-400"><span>{t.physics.repulsion}</span><span>{physicsParams.repulsion}</span></div><input type="range" min="0" max="100" value={physicsParams.repulsion} onChange={(e) => setPhysicsParams(p => ({...p, repulsion: Number(e.target.value)}))} className="w-full accent-teal-500 h-1 bg-slate-100 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"/></div>
             <div className="space-y-1"><div className="flex justify-between text-xs text-slate-500 dark:text-slate-400"><span>{t.physics.length}</span><span>{physicsParams.length}</span></div><input type="range" min="0" max="100" value={physicsParams.length} onChange={(e) => setPhysicsParams(p => ({...p, length: Number(e.target.value)}))} className="w-full accent-teal-500 h-1 bg-slate-100 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"/></div>
             <div className="space-y-1"><div className="flex justify-between text-xs text-slate-500 dark:text-slate-400"><span>{t.physics.stiffness}</span><span>{physicsParams.stiffness}</span></div><input type="range" min="0" max="100" value={physicsParams.stiffness} onChange={(e) => setPhysicsParams(p => ({...p, stiffness: Number(e.target.value)}))} className="w-full accent-teal-500 h-1 bg-slate-100 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"/></div>
             <div className="space-y-1"><div className="flex justify-between text-xs text-slate-500 dark:text-slate-400"><span>{t.physics.gravity}</span><span>{physicsParams.gravity}</span></div><input type="range" min="0" max="100" value={physicsParams.gravity} onChange={(e) => setPhysicsParams(p => ({...p, gravity: Number(e.target.value)}))} className="w-full accent-teal-500 h-1 bg-slate-100 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"/></div>
             <div className="space-y-1"><div className="flex justify-between text-xs text-slate-500 dark:text-slate-400"><span>{t.physics.friction}</span><span>{physicsParams.friction}</span></div><input type="range" min="0" max="100" value={physicsParams.friction} onChange={(e) => setPhysicsParams(p => ({...p, friction: Number(e.target.value)}))} className="w-full accent-teal-500 h-1 bg-slate-100 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"/></div>
          </div>
        </div>
      )}

      {/* Main Toolbar - Fixed High Frequency Tools */}
      <div className="toolbar-wrapper fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 z-50 max-w-[95vw]">
         
         <div className="toolbar-scroll-area bg-white/90 dark:bg-slate-800/90 backdrop-blur shadow-2xl border border-slate-200 dark:border-slate-700 rounded-2xl p-2 flex items-center gap-1">
            {/* History */}
            <button className={`p-3 rounded-xl transition-all ${past.length > 0 ? 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700' : 'text-slate-300 dark:text-slate-600 cursor-not-allowed'}`} onClick={handleUndo} title={t.toolbar.undo} disabled={past.length === 0}><Undo2 size={20} /></button>
            <button className={`p-3 rounded-xl transition-all ${future.length > 0 ? 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700' : 'text-slate-300 dark:text-slate-600 cursor-not-allowed'}`} onClick={handleRedo} title={t.toolbar.redo} disabled={future.length === 0}><Redo2 size={20} /></button>
            
            <div className="w-px h-8 bg-slate-100 dark:bg-slate-700 mx-1 shrink-0" />
            
            {/* Core Tools */}
            <button className="p-3 rounded-xl text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300 transition-all" onClick={() => { setIsSearchOpen(!isSearchOpen); setTimeout(() => searchInputRef.current?.focus(), 100); }} title={t.toolbar.search}><Search size={20} /></button>
            <button className={`p-3 rounded-xl transition-all ${'bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 shadow-sm'}`} onClick={() => setDefaultShape(prev => prev === 'circle' ? 'rectangle' : 'circle')} title={defaultShape === 'circle' ? t.toolbar.shapeCircle : t.toolbar.shapeRect}> {defaultShape === 'circle' ? <Circle size={20} /> : <Square size={20} />} </button>
            <button className={`p-3 rounded-xl transition-all ${hasMagnet ? 'bg-amber-100 text-amber-600 shadow-sm ring-2 ring-amber-200 ring-offset-1' : 'text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300'}`} onClick={handleMagnetClick} title={hasMagnet ? t.toolbar.magnetActive : t.toolbar.magnetInactive}><Magnet size={20} className={hasMagnet ? "" : ""}/></button>
            <button className={`p-3 rounded-xl transition-all ${!isFloating ? 'bg-teal-50 text-teal-600' : 'text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300'}`} onClick={() => setIsFloating(!isFloating)} title={!isFloating ? t.toolbar.frozen : t.toolbar.floating}><Snowflake size={20} /></button>

            <div className="w-px h-8 bg-slate-100 dark:bg-slate-700 mx-1 shrink-0" />

            {/* Menu Toggle */}
            <div className="relative shrink-0">
                 <button 
                    className={`p-3 rounded-xl transition-all ${isMenuOpen ? 'bg-slate-100 dark:bg-slate-700 text-indigo-600' : 'text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-indigo-600'}`} 
                    onClick={() => setIsMenuOpen(!isMenuOpen)} 
                    title={t.toolbar.menu}
                 >
                     <Settings2 size={20} />
                 </button>

                 {/* Horizontal Menu Popover - Expands Right - Adjusted for perfect alignment */}
                 {isMenuOpen && (
                     <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 flex items-center gap-1 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl shadow-2xl border border-slate-200 dark:border-slate-700 rounded-2xl p-2 animate-in fade-in slide-in-from-left-2 z-50 menu-popover whitespace-nowrap">
                         {/* Secondary Tools */}
                         <button className={`p-3 rounded-xl transition-all flex flex-col items-center gap-1 ${showPhysicsSettings ? 'bg-slate-100 dark:bg-slate-700 text-teal-600' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300'}`} onClick={() => { setShowPhysicsSettings(!showPhysicsSettings); setIsMenuOpen(false); }} title={t.toolbar.physics}><Wind size={20}/></button>
                         <button className="p-3 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300 transition-all flex flex-col items-center gap-1" onClick={handleResetView} title={t.toolbar.fitView}><Maximize size={20} /></button>
                         <button className={`p-3 rounded-xl transition-all ${ioModalOpen ? 'bg-slate-100 dark:bg-slate-700 text-teal-600 dark:text-teal-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300'}`} onClick={() => { handleOpenExport(); setIsMenuOpen(false); }} title={t.toolbar.io}><FileJson size={20}/></button>
                         
                         <div className="w-px h-8 bg-slate-100 dark:bg-slate-700 mx-1 shrink-0" />
                         
                         <button className={`p-3 rounded-xl transition-all flex flex-col items-center gap-1 ${isDarkMode ? 'text-yellow-400' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`} onClick={() => setIsDarkMode(!isDarkMode)} title={isDarkMode ? t.toolbar.lightMode : t.toolbar.darkMode}>{isDarkMode ? <Sun size={20} /> : <Moon size={20} />}</button>
                         <button className={`p-3 rounded-xl transition-all flex flex-col items-center gap-1 ${isMuted ? 'text-slate-400 dark:text-slate-500' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300'}`} onClick={() => setIsMuted(!isMuted)} title={isMuted ? t.toolbar.muted : t.toolbar.soundOn}>{isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}</button>
                         <button className={`p-3 rounded-xl transition-all flex flex-col items-center gap-1 ${helpModalOpen ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300'}`} onClick={() => { setHelpModalOpen(true); setIsMenuOpen(false); }} title={t.toolbar.help}><BookOpen size={20}/></button>
                         <button className="p-3 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-teal-600 transition-all flex flex-col items-center justify-center gap-0.5" onClick={toggleLang} title={t.toolbar.lang}><span>{lang === 'zh' ? '中' : 'En'}</span></button>
                     </div>
                 )}
             </div>
         </div>
      </div>
      
      {/* Help Modal */}
      {helpModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 help-modal">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setHelpModalOpen(false)} />
            <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-2xl max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-xl sticky top-0 z-10">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
                        <span className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg text-teal-600 dark:text-teal-400"><BookOpen size={24}/></span>
                        {t.help.title}
                    </h2>
                    <button onClick={() => setHelpModalOpen(false)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"><X size={20}/></button>
                </div>
                <div className="overflow-y-auto p-6 space-y-8">
                    {/* Basic Section */}
                    <section>
                        <h3 className="text-sm font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-4 flex items-center gap-2"><MousePointer2 size={16}/> {t.help.basic}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700">
                                <div className="font-bold text-slate-700 dark:text-slate-200 mb-1">{t.help.drag}</div>
                                <div className="text-sm text-slate-500 dark:text-slate-400">{t.help.dragDesc}</div>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700">
                                <div className="font-bold text-slate-700 dark:text-slate-200 mb-1">{t.help.create}</div>
                                <div className="text-sm text-slate-500 dark:text-slate-400">{t.help.createDesc}</div>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700">
                                <div className="font-bold text-slate-700 dark:text-slate-200 mb-1">{t.help.right}</div>
                                <div className="text-sm text-slate-500 dark:text-slate-400">{t.help.rightDesc}</div>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700">
                                <div className="font-bold text-slate-700 dark:text-slate-200 mb-1">{t.help.edit}</div>
                                <div className="text-sm text-slate-500 dark:text-slate-400">{t.help.editDesc}</div>
                            </div>
                        </div>
                    </section>

                    {/* Advanced Section */}
                    <section>
                        <h3 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-4 flex items-center gap-2"><Target size={16}/> {t.help.advanced}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700">
                                <div className="font-bold text-slate-700 dark:text-slate-200 mb-1">{t.help.paste}</div>
                                <div className="text-sm text-slate-500 dark:text-slate-400">{t.help.pasteDesc}</div>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700">
                                <div className="font-bold text-slate-700 dark:text-slate-200 mb-1">{t.help.merge}</div>
                                <div className="text-sm text-slate-500 dark:text-slate-400">{t.help.mergeDesc}</div>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700">
                                <div className="font-bold text-slate-700 dark:text-slate-200 mb-1">{t.help.magnet}</div>
                                <div className="text-sm text-slate-500 dark:text-slate-400">{t.help.magnetDesc}</div>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700">
                                <div className="font-bold text-slate-700 dark:text-slate-200 mb-1">{t.help.trash}</div>
                                <div className="text-sm text-slate-500 dark:text-slate-400">{t.help.trashDesc}</div>
                            </div>
                        </div>
                    </section>

                    {/* Shortcuts Section */}
                    <section>
                        <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2"><Keyboard size={16}/> {t.help.shortcuts}</h3>
                        <div className="flex flex-wrap gap-2">
                            <span className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-xs font-mono text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">Ctrl+Z {t.help.undoKey}</span>
                            <span className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-xs font-mono text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">Ctrl+Y {t.help.redoKey}</span>
                            <span className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-xs font-mono text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">Enter {t.help.confirmKey}</span>
                            <span className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-xs font-mono text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">Shift+Enter {t.help.newlineKey}</span>
                            <span className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-xs font-mono text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">Tab {t.help.tabKey}</span>
                            <span className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-xs font-mono text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">Ctrl+F {t.help.searchKey}</span>
                        </div>
                    </section>
                </div>
            </div>
        </div>
      )}
      
      {selectionBox && (
        <div className="absolute border-2 border-teal-500 bg-teal-500/10 pointer-events-none z-50" style={{ left: selectionBox.x, top: selectionBox.y, width: selectionBox.w, height: selectionBox.h }} />
      )}

      {/* Zero Latency Tooltip via Ref */}
      <div 
        ref={tooltipRef}
        className={`fixed pointer-events-none z-50 px-3 py-1.5 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur shadow-sm border border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium flex items-center gap-2 will-change-transform ${!tooltipContent ? 'opacity-0' : 'opacity-100'}`}
        style={{ top: 0, left: 0 }} // Position set by JS directly
      >
        {tooltipContent && (
            <>
                {tooltipContent.type === 'create' && <Plus size={14} className="text-teal-500"/>}
                {tooltipContent.type === 'link' && <LinkIcon size={14} className="text-teal-500"/>}
                {tooltipContent.type === 'unlink' && <Unlink size={14} className="text-red-500"/>}
                {tooltipContent.type === 'split' && <Scissors size={14} className="text-amber-500"/>}
                {tooltipContent.type === 'merge' && <Merge size={14} className="text-amber-500"/>}
                {tooltipContent.text}
            </>
        )}
      </div>

      {/* NEW TRASH DESIGN: Corner Gradient Region */}
      {(isDraggingNodes || dragRef.current.mode === 'move_nodes') && (
        <div ref={trashRef} className={`fixed bottom-0 right-0 z-0 transition-all duration-300 pointer-events-none rounded-tl-full ${isOverTrash ? 'opacity-100' : 'opacity-30'}`} style={{ width: '400px', height: '400px', background: `radial-gradient(circle at 100% 100%, ${isOverTrash ? '#fecaca' : (isDarkMode ? '#334155' : '#cbd5e1')} 0%, transparent 60%)` }}>
            <div className={`absolute bottom-12 right-12 transition-all duration-300 flex flex-col items-center gap-2 ${isOverTrash ? 'scale-125 text-red-500' : 'scale-100 text-slate-400 dark:text-slate-500'}`}>
              <Trash2 size={40} strokeWidth={isOverTrash ? 2 : 1.5} className={isOverTrash ? 'animate-bounce' : ''}/>
              <span className={`text-xs font-medium tracking-widest uppercase transition-opacity ${isOverTrash ? 'opacity-100' : 'opacity-0'}`}>{t.canvas.deleteZone}</span>
            </div>
        </div>
      )}
      
      {/* IO Modal */}
      {ioModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
            <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => setIoModalOpen(false)} />
            <div className="io-modal relative bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 w-[550px] animate-in fade-in zoom-in-95 duration-200 flex flex-col overflow-hidden" style={{ transformOrigin: 'center' }}>
                <div className="flex border-b border-slate-100 dark:border-slate-700">
                    <button onClick={() => setIoMode('export')} className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${ioMode === 'export' ? 'text-teal-600 bg-teal-50/50 dark:bg-teal-900/20 border-b-2 border-teal-600' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}><Code size={16}/> {t.io.tabCode}</button>
                    <button onClick={() => setIoMode('file')} className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${ioMode === 'file' ? 'text-teal-600 bg-teal-50/50 dark:bg-teal-900/20 border-b-2 border-teal-600' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}><FileJson size={16}/> {t.io.tabFile}</button>
                    <button onClick={() => setIoMode('history')} className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${ioMode === 'history' ? 'text-teal-600 bg-teal-50/50 dark:bg-teal-900/20 border-b-2 border-teal-600' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}><History size={16}/> {t.io.tabHistory}</button>
                    <button onClick={() => setIoModalOpen(false)} className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full"><X size={18}/></button>
                </div>
                
                <div className="p-5 flex-1 flex flex-col gap-4 h-[350px]">
                    {ioMode === 'export' && (
                        <>
                            <div className="flex gap-2">
                                <button onClick={() => { setIoMode('export'); handleOpenExport(); }} className="flex-1 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200 rounded-lg font-medium text-xs transition-all flex items-center justify-center gap-2">{t.io.export}</button>
                                <button onClick={() => { setIoMode('import'); setIoText(''); }} className="flex-1 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200 rounded-lg font-medium text-xs transition-all flex items-center justify-center gap-2">{t.io.import}</button>
                                <button onClick={handleExportImage} className="flex-1 py-2 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-lg font-medium text-xs transition-all flex items-center justify-center gap-2"><ImageIcon size={14}/> {t.io.exportImg}</button>
                            </div>
                            <div className="relative flex-1">
                                <textarea value={ioText} onChange={(e) => setIoText(e.target.value)} readOnly={false} placeholder={t.io.placeholderImport} className="w-full h-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4 font-mono text-xs text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-teal-500 outline-none resize-none" spellCheck={false}/>
                                <button onClick={handleCopyCode} className="absolute top-3 right-3 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all active:scale-95" title={t.io.copy}>{copySuccess ? <Check size={16} className="text-green-500"/> : <Copy size={16}/>}</button>
                            </div>
                            <button onClick={handleImportMermaid} className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-sm shadow-teal-200"><Upload size={16}/> {t.io.importBtn}</button>
                        </>
                    )}

                    {ioMode === 'file' && (
                        <div className="flex flex-col gap-4 h-full">
                            <button onClick={handleSaveFile} className="w-full py-6 bg-slate-50 dark:bg-slate-700/50 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:text-teal-600 transition-all flex flex-col items-center justify-center gap-2 group">
                                <Save size={32} className="text-slate-400 dark:text-slate-500 group-hover:text-teal-500 mb-1"/>
                                <span className="font-medium text-slate-700 dark:text-slate-200">{t.io.saveFile}</span>
                            </button>
                            
                            <div className="relative w-full py-6 bg-slate-50 dark:bg-slate-700/50 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 transition-all flex flex-col items-center justify-center gap-2 group cursor-pointer">
                                <FolderOpen size={32} className="text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 mb-1"/>
                                <span className="font-medium text-slate-700 dark:text-slate-200">{t.io.loadFile}</span>
                                <input 
                                    ref={fileInputRef}
                                    type="file" 
                                    accept=".json,.mb" 
                                    onChange={handleLoadFile} 
                                    className="absolute inset-0 opacity-0 cursor-pointer" 
                                />
                            </div>
                        </div>
                    )}
                    
                    {ioMode === 'history' && (
                        <div className="flex flex-col h-full">
                            <p className="text-xs text-slate-400 mb-3 flex items-center gap-2"><History size={14}/> {t.io.snapshotDesc}</p>
                            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                                {snapshots.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                                        <History size={32} className="opacity-20"/>
                                        <span className="text-xs">{t.io.noSnaps}</span>
                                    </div>
                                ) : (
                                    snapshots.map((snap, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-700 hover:border-teal-500 transition-all group">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{new Date(snap.timestamp).toLocaleTimeString()}</span>
                                                <span className="text-[10px] text-slate-400">{new Date(snap.timestamp).toLocaleDateString()} • {snap.nodes.length} nodes</span>
                                            </div>
                                            <button 
                                                onClick={() => restoreSnapshot(snap)}
                                                className="px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium rounded border border-slate-200 dark:border-slate-600 hover:bg-teal-500 hover:text-white hover:border-teal-500 transition-colors"
                                            >
                                                {t.io.restore}
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* BEAUTIFIED CONTEXT MENU: Glassmorphism + Animation */}
      {contextMenu && (
        <>
        <div className="fixed inset-0 z-40" onMouseDown={() => setContextMenu(null)} />
        <div 
            className="absolute bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl shadow-2xl border border-white/40 dark:border-slate-600 ring-1 ring-black/5 rounded-2xl py-2 min-w-[200px] z-50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden origin-top-left" 
            style={{ left: contextMenu.x, top: contextMenu.y }} 
            onMouseDown={(e) => e.stopPropagation()}
        >
           {/* Color Palette */}
           <div className="px-4 py-2 border-b border-slate-100/50 dark:border-slate-700/50">
               <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2 flex items-center gap-1"><Palette size={12}/> {t.context.color}</span>
               <div className="flex gap-1.5 flex-wrap">
                   {/* Default White */}
                    <button 
                        onClick={() => contextMenu.nodeId && updateNodeColor(contextMenu.nodeId, '#fff')}
                        className="w-5 h-5 rounded-full border border-slate-200 hover:scale-110 transition-transform bg-white dark:bg-slate-700 dark:border-slate-600"
                        title={t.context.defaultWhite}
                    />
                   {COLORS.map(color => (
                       <button 
                            key={color}
                            onClick={() => contextMenu.nodeId && updateNodeColor(contextMenu.nodeId, color)}
                            className="w-5 h-5 rounded-full border border-slate-200/50 hover:scale-110 transition-transform"
                            style={{ backgroundColor: color }}
                       />
                   ))}
               </div>
           </div>

           <div className="h-px bg-slate-200/50 dark:bg-slate-700/50 mx-4 my-1"/>

           <button className="group w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50 flex items-center gap-3 transition-all active:scale-95" onClick={() => { if (contextMenu.nodeId) toggleShape(contextMenu.nodeId); }}>
               <div className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 group-hover:bg-teal-100 dark:group-hover:bg-teal-800/30 transition-colors">
                   {nodes.find(n => n.id === contextMenu.nodeId)?.shape === 'circle' ? <Square size={16} /> : <Circle size={16}/>}
               </div>
               <span className="font-medium">{t.context.toggleShape}</span>
           </button>
           
           <div className="h-px bg-slate-200/50 dark:bg-slate-700/50 mx-4 my-1"/>
           
           <button className="group w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50 flex items-center gap-3 transition-all active:scale-95" onClick={() => { if (contextMenu.nodeId) { const targetIds = selectedNodeIds.has(contextMenu.nodeId) ? selectedNodeIds : new Set([contextMenu.nodeId]); const isAnyUnpinned = nodes.some(n => targetIds.has(n.id) && !n.pinned); syncSimulationToState(); saveHistory(); setNodes(prev => prev.map(n => targetIds.has(n.id) ? { ...n, pinned: isAnyUnpinned } : n)); setContextMenu(null); playSound('click', isMuted); } }}> 
               <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 group-hover:bg-slate-200 dark:group-hover:bg-slate-600 transition-colors">
                 {(() => { const targetIds = (contextMenu.nodeId && selectedNodeIds.has(contextMenu.nodeId)) ? selectedNodeIds : new Set([contextMenu.nodeId!]); const isAnyUnpinned = nodes.some(n => targetIds.has(n.id) && !n.pinned); return isAnyUnpinned ? <Pin size={16}/> : <PinOff size={16}/>; })()} 
               </div>
               <span className="font-medium">{(() => { const targetIds = (contextMenu.nodeId && selectedNodeIds.has(contextMenu.nodeId)) ? selectedNodeIds : new Set([contextMenu.nodeId!]); const isAnyUnpinned = nodes.some(n => targetIds.has(n.id) && !n.pinned); return isAnyUnpinned ? t.context.pin : t.context.unpin; })()}</span>
           </button>
           
           <button className="group w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50 flex items-center gap-3 transition-all active:scale-95" onClick={() => { if (contextMenu.nodeId) { const targetIds = selectedNodeIds.has(contextMenu.nodeId) ? selectedNodeIds : new Set([contextMenu.nodeId]); saveHistory(); setEdges(prev => prev.filter(e => !targetIds.has(e.source) && !targetIds.has(e.target))); playSound('unlink', isMuted); } setContextMenu(null); }}>
               <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 group-hover:bg-slate-200 dark:group-hover:bg-slate-600 transition-colors">
                   <Unlink size={16}/>
               </div>
               <span className="font-medium">{t.context.unlink}</span>
           </button>
           
           <div className="h-px bg-slate-200/50 dark:bg-slate-700/50 mx-4 my-1"/>
           
           <button className="group w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50/50 dark:hover:bg-red-900/30 flex items-center gap-3 transition-all active:scale-95" onClick={() => { if (contextMenu.nodeId) { const targetIds = selectedNodeIds.has(contextMenu.nodeId) ? selectedNodeIds : new Set([contextMenu.nodeId]); deleteNodes(targetIds); } setContextMenu(null); }}>
               <div className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-500 group-hover:bg-red-200 dark:group-hover:bg-red-800/40 transition-colors">
                   <Trash2 size={16}/>
               </div>
               <span className="font-medium">{t.context.delete}</span>
           </button>
        </div>
        </>
      )}
    </div>
  );
};

export default App;