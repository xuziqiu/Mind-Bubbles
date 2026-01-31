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
  Download,
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
  Eye,
  EyeOff,
  BookOpen,
  Keyboard,
  Palette,
  Type,
  Maximize,
  Languages
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
      shapeCircle: "当前：圆形",
      shapeRect: "当前：矩形",
      magnetActive: "定位并吸引想法",
      magnetInactive: "在中心生成磁铁",
      frozen: "已冻结",
      floating: "已悬浮",
      physics: "物理参数设置",
      fitView: "适应画布",
      zenMode: "禅模式 (隐藏界面)",
      io: "导出/导入 Mermaid 代码",
      muted: "已静音",
      soundOn: "开启音效",
      help: "操作说明",
      exitZen: "退出禅模式",
      lang: "切换语言"
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
      export: "导出 Mermaid",
      import: "导入 Mermaid",
      exportImg: "导出为图片 (PNG)",
      placeholderExport: "",
      placeholderImport: "粘贴 Mermaid 流程图代码...\n例如：\nA[想法] --> B((灵感))",
      copy: "复制",
      importBtn: "导入并生成脑图",
      importHint: "复制上方代码，可在 Notion 或 GitHub 中直接展示流程图。",
      error: "未能识别有效的 Mermaid 代码。"
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
      newlineKey: "换行"
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
      zenMode: "Zen Mode (Hide UI)",
      io: "Import / Export",
      muted: "Muted",
      soundOn: "Sound On",
      help: "Guide",
      exitZen: "Exit Zen Mode",
      lang: "Switch Language"
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
      export: "Export Mermaid",
      import: "Import Mermaid",
      exportImg: "Export Image (PNG)",
      placeholderExport: "",
      placeholderImport: "Paste Mermaid code...\ne.g.,\nA[Idea] --> B((Spark))",
      copy: "Copy",
      importBtn: "Import & Generate",
      importHint: "Copy code above for Notion or GitHub.",
      error: "Invalid Mermaid code."
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
      newlineKey: "New Line"
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
}

const STORAGE_KEY = 'mindbubbles_data_v1';
const LANG_KEY = 'mindbubbles_lang';

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
  const [isZenMode, setIsZenMode] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [lang, setLang] = useState<'zh' | 'en'>(() => {
      return (localStorage.getItem(LANG_KEY) as 'zh' | 'en') || 'zh';
  });

  const t = TRANSLATIONS[lang];

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
  const [ioMode, setIoMode] = useState<'export' | 'import'>('export');
  const [ioText, setIoText] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  
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
      const newPast = [...prev, { nodes: JSON.parse(JSON.stringify(snapshotNodes)), edges: JSON.parse(JSON.stringify(edges)) }];
      if (newPast.length > 30) newPast.shift(); 
      return newPast;
    });
    setFuture([]);
  }, [nodes, edges]);

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (editingNodeId) {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (editRef.current) editRef.current.blur();
          }
          return; 
      }
      if (editingEdgeId) {
          if (e.key === 'Enter') {
            e.preventDefault();
            if (edgeEditRef.current) edgeEditRef.current.blur();
          }
          return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) handleRedo(); else handleUndo();
        e.preventDefault();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) {
         handleRedo(); e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, editingNodeId, editingEdgeId]);

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
                 el.setAttribute('stroke', '#cbd5e1');
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
  }, [isFloating, edges, editingNodeId, physicsParams, view.scale, hoveredEdgeId, editingEdgeId]);


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
          textEl.setAttribute("fill", "#334155");
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
             ctx.scale(2, 2);
             ctx.drawImage(img, 0, 0, width, height);
             try {
                const link = document.createElement('a');
                link.href = canvas.toDataURL('image/png');
                link.download = `mindbubbles-export.png`;
                link.click();
             } catch (e) {}
          }
          URL.revokeObjectURL(url);
      };
      img.src = url;
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

  const toggleShape = (targetId: string) => {
    syncSimulationToState();
    saveHistory();
    playSound('click', isMuted);
    
    const targetIds = selectedNodeIds.has(targetId) ? selectedNodeIds : new Set([targetId]);
    
    setNodes(prev => prev.map(n => {
        if (targetIds.has(n.id)) {
            return { ...n, shape: n.shape === 'circle' ? 'rectangle' : 'circle' };
        }
        return n;
    }));
    
    setContextMenu(null);
  };

  const checkLinkAction = (sources: string[], targetId: string | null) => {
    if (!targetId) return 'create';
    const isConnected = sources.every(src => edges.some(e => (e.source === src && e.target === targetId) || (e.source === targetId && e.target === src)));
    return isConnected ? 'unlink' : 'link';
  };

  const handleLinkAction = (targetNodeId: string | null, mouseCanvasX: number, mouseCanvasY: number) => {
    const sources = dragRef.current.linkSources;
    if (sources.length === 0 && !hoveredEdgeId) return; 

    if (targetNodeId) {
       const action = checkLinkAction(sources, targetNodeId);
       if (action === 'link' || action === 'unlink') saveHistory();
       
       if (action === 'link') playSound('link', isMuted);
       if (action === 'unlink') playSound('unlink', isMuted);

       setEdges(prev => {
         if (action === 'unlink') {
            return prev.filter(e => !((sources.includes(e.source) && e.target === targetNodeId) || (sources.includes(e.target) && e.source === targetNodeId)));
         } else {
            const newEdges = [...prev];
            sources.forEach(src => {
                if (src === targetNodeId) return;
                const exists = prev.some(e => (e.source === src && e.target === targetNodeId) || (e.source === targetNodeId && e.target === src));
                if (!exists) newEdges.push({ id: Math.random().toString(36).slice(2), source: src, target: targetNodeId });
            });
            return newEdges;
         }
       });
    } 
    else if (hoveredEdgeId) {
        syncSimulationToState(); 
        saveHistory();
        playSound('pop', isMuted);
        const splitEdge = edges.find(e => e.id === hoveredEdgeId);
        if (splitEdge) {
            const newNodeId = Math.random().toString(36).slice(2);
            const newNode: GraphNode = {
                id: newNodeId, text: t.defaultNode, x: mouseCanvasX, y: mouseCanvasY,
                color: COLORS[0], shape: defaultShape, dimensions: { ...DEFAULT_DIMENSIONS }, vx: 0, vy: 0
            };
            triggerEffect(mouseCanvasX, mouseCanvasY, 'create');
            
            setEdges(prev => [
                ...prev.filter(e => e.id !== hoveredEdgeId),
                { id: Math.random().toString(36), source: splitEdge.source, target: newNodeId, label: splitEdge.label },
                { id: Math.random().toString(36), source: newNodeId, target: splitEdge.target },
                ...sources.map(src => ({ id: Math.random().toString(36), source: src, target: newNodeId }))
            ]);
            setNodes(prev => [...prev, newNode]);
            setEditingNodeId(newNodeId);
            setSelectedNodeIds(new Set([newNodeId]));
        }
    }
    else if (sources.length > 0) {
      syncSimulationToState();
      saveHistory();
      playSound('pop', isMuted);
      const newNodeId = Math.random().toString(36).slice(2);
      const newNode: GraphNode = {
        id: newNodeId, text: t.defaultNode, x: mouseCanvasX, y: mouseCanvasY,
        color: COLORS[0], shape: defaultShape, dimensions: { ...DEFAULT_DIMENSIONS }, vx: 0, vy: 0
      };
      triggerEffect(mouseCanvasX, mouseCanvasY, 'create');
      const newEdges = sources.map(srcId => ({ id: Math.random().toString(36).slice(2), source: srcId, target: newNodeId }));
      setNodes(prev => [...prev, newNode]);
      setEdges(prev => [...prev, ...newEdges]);
      setEditingNodeId(newNodeId);
      setSelectedNodeIds(new Set([newNodeId]));
    }
  };

  const spawnMagnetNode = (x: number, y: number) => {
    syncSimulationToState();
    saveHistory();
    playSound('pop', isMuted);
    const magnetId = 'magnet-' + Math.random().toString(36).slice(2);
    const magnetNode: GraphNode = {
      id: magnetId, text: t.magnetNode, type: 'magnet', x, y, color: '#d97706', shape: 'circle',
      dimensions: { circleRadius: 60, rectWidth: 180, rectHeight: 120 }, vx: 0, vy: 0
    };
    triggerEffect(x, y, 'create');
    setNodes(prev => [...prev, magnetNode]);
    setEdges(prev => {
      const connected = new Set<string>();
      prev.forEach(e => { connected.add(e.source); connected.add(e.target); });
      const isolated = nodes.filter(n => !connected.has(n.id) && n.id !== magnetId);
      return [...prev, ...isolated.map(n => ({ id: `edge-${Math.random()}`, source: magnetId, target: n.id }))];
    });
    setSelectedNodeIds(new Set([magnetId]));
  };

  const handleCaptureAndLocate = () => {
    const magnet = simulationNodes.current.find(n => n.type === 'magnet');
    if (!magnet) return;
    
    syncSimulationToState();
    saveHistory();
    playSound('link', isMuted);
    
    triggerEffect(magnet.x, magnet.y, 'link');

    setEdges(prev => {
        const pureEdges = prev.filter(e => e.source !== magnet.id && e.target !== magnet.id);
        const connectedNodeIds = new Set<string>();
        pureEdges.forEach(e => {
            connectedNodeIds.add(e.source);
            connectedNodeIds.add(e.target);
        });
        
        const nextEdges = prev.filter(e => {
            if (e.source !== magnet.id && e.target !== magnet.id) return true;
            const otherId = e.source === magnet.id ? e.target : e.source;
            if (connectedNodeIds.has(otherId)) return false;
            return true;
        });

        const isolatedNodes = nodes.filter(n => n.id !== magnet.id && !connectedNodeIds.has(n.id));
        
        isolatedNodes.forEach(n => {
            const alreadyLinked = nextEdges.some(e => 
                (e.source === magnet.id && e.target === n.id) || 
                (e.target === magnet.id && e.source === n.id)
            );
            if (!alreadyLinked) {
                nextEdges.push({ 
                    id: `edge-${Math.random().toString(36).slice(2)}`, 
                    source: magnet.id, 
                    target: n.id 
                });
            }
        });
        return nextEdges;
    });
    
    const targetTx = (window.innerWidth / 2) - (magnet.x * view.scale);
    const targetTy = (window.innerHeight / 2) - (magnet.y * view.scale);
    const startTx = view.translateX, startTy = view.translateY, startT = performance.now();
    const animate = (time: number) => {
        const t = Math.min((time - startT) / 500, 1);
        const ease = t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        setView({ scale: view.scale, translateX: startTx + (targetTx - startTx) * ease, translateY: startTy + (targetTy - startTy) * ease });
        if (t < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  };

  const handleMagnetClick = (e: React.MouseEvent) => {
      e.stopPropagation(); setHasInteracted(true);
      if (hasMagnet) {
          handleCaptureAndLocate();
      } else {
          const cx = (window.innerWidth / 2 - view.translateX) / view.scale;
          const cy = (window.innerHeight / 2 - view.translateY) / view.scale;
          spawnMagnetNode(cx, cy);
      }
  };

  const handleResetView = () => {
      setHasInteracted(true);
      playSound('click', isMuted);
      performFitView(simulationNodes.current);
  };

  // --- Event Handlers ---
  const handleDoubleClick = (e: React.MouseEvent) => {
     setHasInteracted(true);
     const { x, y } = screenToCanvas(e.clientX, e.clientY);
     const node = getNodeAt(x, y);
     const edge = getEdgeAt(x, y); 
     
     if (node) {
         if (node.type === 'magnet') {
             handleCaptureAndLocate();
         } else {
             setEditingNodeId(node.id); 
             setContextMenu(null); 
             playSound('click', isMuted);
         }
     } else if (edge) {
         setEditingEdgeId(edge.id);
         setContextMenu(null);
         playSound('click', isMuted);
     } else {
        syncSimulationToState();
        saveHistory();
        const newNodeId = Math.random().toString(36).slice(2);
        const newNode: GraphNode = {
          id: newNodeId, text: t.defaultNode, x: x, y: y, color: COLORS[0], 
          shape: defaultShape, dimensions: { ...DEFAULT_DIMENSIONS }, vx: 0, vy: 0
        };
        playSound('pop', isMuted);
        triggerEffect(x, y, 'create');
        setNodes(prev => [...prev, newNode]);
        setEditingNodeId(newNodeId);
        setSelectedNodeIds(new Set([newNodeId]));
     }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    initAudio(); 
    setHasInteracted(true);
    if ((e.target as HTMLElement).closest('.physics-panel') || (e.target as HTMLElement).closest('.io-modal') || (e.target as HTMLElement).closest('.help-modal') || (e.target as HTMLElement).closest('.toolbar-container')) return; 
    if ((e.target as HTMLElement).isContentEditable) return;
    if (editingEdgeId && (e.target as HTMLElement).tagName === 'INPUT') return; 

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
    const delta = -e.deltaY * ZOOM_SENSITIVITY;
    const newScale = Math.min(Math.max(view.scale * (1 + delta), MIN_ZOOM), MAX_ZOOM);
    const { x, y } = screenToCanvas(e.clientX, e.clientY);
    const newTx = e.clientX - x * newScale;
    const newTy = e.clientY - y * newScale;
    setView({ scale: newScale, translateX: newTx, translateY: newTy });
    setContextMenu(null);
  };

  return (
    <div 
      ref={containerRef}
      className={`relative w-screen h-screen overflow-hidden select-none text-slate-800 ${dragRef.current.mode === 'pan' ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
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
                    stroke={hoveredEdgeId === edge.id ? "#0d9488" : "#cbd5e1"}
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
            
            const nodeColor = node.color && node.color !== '#fff' ? node.color : '#cbd5e1'; 
            const strokeColor = isDestruct ? '#ef4444' : (isSelected ? nodeColor : (isHovered ? nodeColor : nodeColor)); 
            const strokeWidth = isDestruct || isSelected ? 4 : 1.5; 
            const filterStyle = isSelected ? `drop-shadow(0 0 8px ${nodeColor}33)` : 'drop-shadow(0 2px 4px rgba(0,0,0,0.05))';

            return (
              <g 
                key={node.id} 
                ref={el => { if (el) nodeRefs.current.set(node.id, el); else nodeRefs.current.delete(node.id); }}
                transform={`translate(${node.x}, ${node.y})`}
                className="will-change-transform"
              >
                <g className="animate-in">
                  {isMagnet ? (
                    <g className="origin-center">
                      <circle r={radius * 1.4} className="animate-pulse" fill="#fef3c7" opacity="0.5" />
                      <circle 
                          r={radius}
                          fill="#fffbeb" 
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
                                      fill="white"
                                      stroke={strokeColor}
                                      strokeWidth={strokeWidth}
                                      style={{ filter: filterStyle, transition: 'stroke 0.2s, filter 0.2s, stroke-width 0.2s' }}
                                  />
                                </g>
                              ) : (
                                  <circle
                                      r={radius}
                                      fill={isDestruct ? '#fecaca' : 'white'}
                                      stroke={strokeColor}
                                      strokeWidth={strokeWidth}
                                      style={{ filter: filterStyle, transition: 'stroke 0.2s, filter 0.2s, stroke-width 0.2s' }}
                                  />
                              )}

                              {node.pinned && (
                                <g transform={`translate(${radius * 0.707 - 10}, ${-radius * 0.707 + 10})`}>
                                   <circle r="8" fill="white" stroke="#64748b" strokeWidth="1" />
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
                                  fill={isDestruct ? '#fecaca' : 'white'}
                                  stroke={strokeColor}
                                  strokeWidth={strokeWidth}
                                  style={{ filter: filterStyle, transition: 'stroke 0.2s, filter 0.2s, stroke-width 0.2s' }}
                              />
                              {node.pinned && (
                                <g transform={`translate(${width/2 - 12}, ${-height/2 + 12})`}>
                                   <circle r="8" fill="white" stroke="#64748b" strokeWidth="1" />
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
                              className={`w-full bg-transparent outline-none font-medium pointer-events-auto ${hasImage ? 'text-white drop-shadow-md font-bold text-shadow' : 'text-slate-700'} ${isCircle ? 'text-center' : 'text-left'}`}
                              style={{ fontSize: '0.875rem', lineHeight: '1.5', minHeight: '1em', whiteSpace: 'pre-wrap', wordBreak: 'break-word', textShadow: hasImage ? '0 1px 2px rgba(0,0,0,0.8)' : 'none' }}
                              onBlur={(e) => {
                                  const text = e.currentTarget.innerText.trim();
                                  syncSimulationToState();
                                  saveHistory();
                                  setNodes(prev => prev.map(n => n.id === editingNodeId ? { ...n, text: text } : n));
                                  setEditingNodeId(null);
                              }}
                              onKeyDown={(e) => e.stopPropagation()}
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
                              className={`font-medium select-none ${isDestruct ? 'text-red-600' : (hasImage ? 'text-white' : 'text-slate-700')}`}
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
      {!isZenMode && nodes.length === 0 && (
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0 opacity-40">
              <div className="text-2xl font-light text-slate-400 tracking-widest uppercase text-center animate-pulse">
                  {t.canvas.emptyState}
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
                                   className="text-[11px] font-bold text-slate-500 cursor-text hover:text-teal-600 transition-colors whitespace-nowrap select-none px-1 leading-none py-0.5"
                                   style={{ 
                                       textShadow: '0 0 3px white, 0 0 3px white, 0 0 3px white, 0 0 3px white, 0 0 6px white', 
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
      {!isZenMode && (
          <div 
            className={`fixed top-[25%] left-1/2 -translate-x-1/2 pointer-events-none z-0 transition-opacity duration-1000 ease-out flex flex-col items-center ${nodes.length >= 2 ? 'opacity-0' : 'opacity-100'}`}
          >
             {/* Title: Huge, Thin, Subtle, Wide Spacing */}
            <h1 className="text-8xl font-light text-slate-200 tracking-[0.5em] mb-16 select-none whitespace-nowrap" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                {t.appTitle}
            </h1>
            
            {/* Guide: Minimalist Row with Thin Dividers */}
            <div className="flex items-center gap-12 text-slate-300 font-light text-lg tracking-widest whitespace-nowrap">
                <div className="flex flex-col items-center gap-2 group">
                    <MousePointer2 strokeWidth={1} size={32} className="text-slate-400 group-hover:text-teal-400 transition-colors duration-500" />
                    <span className="text-xs uppercase text-slate-400">{t.tips.drag}</span>
                </div>
                
                <div className="h-12 w-px bg-slate-200/50" />
                
                <div className="flex flex-col items-center gap-2 group">
                    <Move strokeWidth={1} size={32} className="text-slate-400 group-hover:text-teal-400 transition-colors duration-500" />
                    <span className="text-xs uppercase text-slate-400">{t.tips.rightClick}</span>
                </div>
                
                <div className="h-12 w-px bg-slate-200/50" />
                
                <div className="flex flex-col items-center gap-2 group">
                    <Mouse strokeWidth={1} size={32} className="text-slate-400 group-hover:text-teal-400 transition-colors duration-500" />
                    <span className="text-xs uppercase text-slate-400">{t.tips.pan}</span>
                </div>
            </div>
          </div>
      )}

      {/* Physics Settings Panel */}
      {!isZenMode && showPhysicsSettings && (
        <div className="physics-panel fixed top-6 right-6 w-64 bg-white/90 backdrop-blur shadow-xl border border-slate-200 rounded-xl p-4 animate-in z-50">
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-sm font-bold text-slate-700">{t.physics.title}</h3>
             <button onClick={() => setShowPhysicsSettings(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
               <X size={16} />
             </button>
          </div>
          <div className="space-y-4">
            {[
              { key: 'repulsion', label: t.physics.repulsion },
              { key: 'length', label: t.physics.length },
              { key: 'stiffness', label: t.physics.stiffness },
              { key: 'gravity', label: t.physics.gravity },
              { key: 'friction', label: t.physics.friction }
            ].map(({ key, label }) => (
              <div key={key} className="space-y-1">
                <div className="flex justify-between text-xs text-slate-500 font-medium">
                  <span>{label}</span>
                  <span>{physicsParams[key as keyof typeof physicsParams]}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" step="1"
                  value={physicsParams[key as keyof typeof physicsParams]}
                  onChange={(e) => setPhysicsParams(p => ({ ...p, [key]: Number(e.target.value) }))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600 hover:accent-teal-500 transition-all"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Toolbar */}
      {!isZenMode && (
        <div className="toolbar-container fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 p-2 bg-white/90 backdrop-blur-md border border-slate-200/60 shadow-2xl rounded-2xl z-40 transition-all duration-300 hover:shadow-teal-500/10 hover:-translate-y-1">
          
          <div className="flex items-center gap-1 pr-3 border-r border-slate-200">
             <button onClick={handleUndo} className="p-2 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all disabled:opacity-30" disabled={past.length === 0} title={t.toolbar.undo}>
                <Undo2 size={20} />
             </button>
             <button onClick={handleRedo} className="p-2 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all disabled:opacity-30" disabled={future.length === 0} title={t.toolbar.redo}>
                <Redo2 size={20} />
             </button>
          </div>

          <div className="flex items-center gap-2 pr-3 border-r border-slate-200">
             <button onClick={() => setDefaultShape(s => s === 'circle' ? 'rectangle' : 'circle')} className="p-2 text-slate-600 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all" title={defaultShape === 'circle' ? t.toolbar.shapeCircle : t.toolbar.shapeRect}>
                {defaultShape === 'circle' ? <Circle size={20} /> : <Square size={20} />}
             </button>
             
             <button onClick={handleMagnetClick} className={`p-2 rounded-xl transition-all relative group ${hasMagnet ? 'text-amber-500 hover:bg-amber-50' : 'text-slate-500 hover:text-teal-600 hover:bg-teal-50'}`} title={hasMagnet ? t.toolbar.magnetActive : t.toolbar.magnetInactive}>
                <Magnet size={20} className={hasMagnet ? 'animate-pulse' : ''} />
                {hasMagnet && <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full animate-ping" />}
             </button>
             
             <button onClick={() => setIsFloating(!isFloating)} className={`p-2 rounded-xl transition-all ${!isFloating ? 'text-sky-500 bg-sky-50' : 'text-slate-500 hover:text-teal-600 hover:bg-teal-50'}`} title={!isFloating ? t.toolbar.frozen : t.toolbar.floating}>
                <Snowflake size={20} />
             </button>

             <button onClick={() => setShowPhysicsSettings(!showPhysicsSettings)} className={`p-2 rounded-xl transition-all ${showPhysicsSettings ? 'text-teal-600 bg-teal-50' : 'text-slate-500 hover:text-teal-600 hover:bg-teal-50'}`} title={t.toolbar.physics}>
                <Settings2 size={20} />
             </button>
          </div>

          <div className="flex items-center gap-1">
             <button onClick={() => setIsZenMode(true)} className="p-2 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all" title={t.toolbar.zenMode}>
                <Maximize size={20} />
             </button>
             <button onClick={handleOpenExport} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title={t.toolbar.io}>
                <Download size={20} />
             </button>
             <button onClick={() => setIsMuted(!isMuted)} className="p-2 text-slate-500 hover:text-pink-600 hover:bg-pink-50 rounded-xl transition-all" title={isMuted ? t.toolbar.muted : t.toolbar.soundOn}>
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
             </button>
             <button onClick={() => setHelpModalOpen(true)} className="p-2 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all" title={t.toolbar.help}>
                <BookOpen size={20} />
             </button>
             <button onClick={toggleLang} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all font-bold text-xs w-9 h-9 flex items-center justify-center" title={t.toolbar.lang}>
                {lang === 'zh' ? 'EN' : '中'}
             </button>
          </div>
        </div>
      )}

      {/* Zen Mode Exit Button */}
      {isZenMode && (
        <button onClick={() => setIsZenMode(false)} className="fixed top-6 right-6 p-3 bg-white/10 backdrop-blur hover:bg-white/20 text-white rounded-full transition-all z-50">
           <Maximize size={24} className="text-white opacity-60 hover:opacity-100" />
        </button>
      )}

      {/* Selection Box */}
      {selectionBox && (
          <div 
             className="fixed border-2 border-teal-500 bg-teal-500/20 pointer-events-none z-30 rounded-lg"
             style={{ 
                 left: selectionBox.x, 
                 top: selectionBox.y, 
                 width: selectionBox.w, 
                 height: selectionBox.h 
             }}
          />
      )}

      {/* Tooltip */}
      {tooltipContent && (
        <div 
          ref={tooltipRef}
          className={`fixed px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-xl pointer-events-none z-50 flex items-center gap-2 transition-transform duration-75 ease-out will-change-transform ${
            tooltipContent.type === 'delete' ? 'bg-red-500' : 
            tooltipContent.type === 'link' ? 'bg-teal-500' :
            tooltipContent.type === 'unlink' ? 'bg-orange-500' :
            tooltipContent.type === 'merge' ? 'bg-amber-500' :
            'bg-slate-800'
          }`}
          style={{ top: 0, left: 0 }}
        >
          {tooltipContent.type === 'link' && <LinkIcon size={12} />}
          {tooltipContent.type === 'unlink' && <Unlink size={12} />}
          {tooltipContent.type === 'create' && <Plus size={12} />}
          {tooltipContent.type === 'merge' && <Merge size={12} />}
          {tooltipContent.type === 'split' && <Scissors size={12} />}
          {tooltipContent.text}
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && contextMenu.visible && (
        <div 
           className="fixed bg-white shadow-2xl border border-slate-100 rounded-xl p-2 z-50 min-w-[160px] animate-in slide-in-from-top-2 duration-200"
           style={{ top: contextMenu.y, left: contextMenu.x }}
           onClick={(e) => e.stopPropagation()}
        >
           <div className="flex gap-1 mb-2 p-1">
              {COLORS.map(c => (
                 <button 
                    key={c} 
                    className="w-5 h-5 rounded-full hover:scale-110 transition-transform shadow-sm ring-1 ring-slate-100" 
                    style={{ backgroundColor: c }}
                    onClick={() => updateNodeColor(contextMenu.nodeId!, c)}
                 />
              ))}
              <button 
                 className="w-5 h-5 rounded-full bg-white border border-slate-300 flex items-center justify-center hover:bg-slate-50"
                 onClick={() => updateNodeColor(contextMenu.nodeId!, '#fff')}
                 title={t.context.defaultWhite}
              >
                  <div className="w-full h-px bg-slate-300 rotate-45" />
              </button>
           </div>
           
           <div className="h-px bg-slate-100 my-1" />
           
           <button onClick={() => toggleShape(contextMenu.nodeId!)} className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-teal-600 rounded-lg flex items-center gap-2 transition-colors">
              <Square size={14} />
              {t.context.toggleShape}
           </button>

           <button 
             onClick={() => {
                 const n = nodes.find(node => node.id === contextMenu.nodeId);
                 if (n) {
                    saveHistory();
                    setNodes(prev => prev.map(node => node.id === contextMenu.nodeId ? { ...node, pinned: !node.pinned } : node));
                    setContextMenu(null);
                 }
             }} 
             className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-teal-600 rounded-lg flex items-center gap-2 transition-colors"
           >
              {nodes.find(n => n.id === contextMenu.nodeId)?.pinned ? <PinOff size={14} /> : <Pin size={14} />}
              {nodes.find(n => n.id === contextMenu.nodeId)?.pinned ? t.context.unpin : t.context.pin}
           </button>

           <div className="h-px bg-slate-100 my-1" />
           
           <button onClick={() => { deleteNodes(new Set([contextMenu.nodeId!])); setContextMenu(null); }} className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg flex items-center gap-2 transition-colors">
              <Trash2 size={14} />
              {t.context.delete}
           </button>
        </div>
      )}

      {/* IO Modal */}
      {ioModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
           <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                 <div className="flex gap-4">
                    <button onClick={() => setIoMode('export')} className={`text-sm font-bold px-3 py-1.5 rounded-lg transition-colors ${ioMode === 'export' ? 'bg-teal-50 text-teal-600' : 'text-slate-500 hover:bg-slate-50'}`}>
                       {t.io.export}
                    </button>
                    <button onClick={() => setIoMode('import')} className={`text-sm font-bold px-3 py-1.5 rounded-lg transition-colors ${ioMode === 'import' ? 'bg-teal-50 text-teal-600' : 'text-slate-500 hover:bg-slate-50'}`}>
                       {t.io.import}
                    </button>
                    <button onClick={handleExportImage} className="text-sm font-bold px-3 py-1.5 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors flex items-center gap-2">
                       <ImageIcon size={14} />
                       {t.io.exportImg}
                    </button>
                 </div>
                 <button onClick={() => setIoModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
              </div>
              
              <div className="relative">
                 <textarea 
                    value={ioText}
                    onChange={(e) => setIoText(e.target.value)}
                    placeholder={ioMode === 'export' ? t.io.placeholderExport : t.io.placeholderImport}
                    className="w-full h-64 p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-mono text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none"
                 />
                 {ioMode === 'export' && (
                     <button 
                        onClick={handleCopyCode}
                        className="absolute top-4 right-4 bg-white shadow-sm border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-teal-600 flex items-center gap-2"
                     >
                        {copySuccess ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                        {t.io.copy}
                     </button>
                 )}
              </div>

              {ioMode === 'import' && (
                  <div className="flex justify-between items-center bg-blue-50 p-3 rounded-lg border border-blue-100">
                      <span className="text-xs text-blue-600 flex items-center gap-2">
                          <BookOpen size={14} />
                          {t.io.importHint}
                      </span>
                      <button 
                          onClick={handleImportMermaid}
                          className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-teal-700 transition-all shadow-lg shadow-teal-500/30 active:scale-95"
                      >
                          {t.io.importBtn}
                      </button>
                  </div>
              )}
           </div>
        </div>
      )}

      {/* Help Modal */}
      {helpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in" onClick={() => setHelpModalOpen(false)}>
            <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl p-8 overflow-hidden relative" onClick={e => e.stopPropagation()}>
               <button onClick={() => setHelpModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 p-2 hover:bg-slate-100 rounded-full transition-all">
                  <X size={24} />
               </button>
               
               <h2 className="text-3xl font-light text-slate-800 mb-8 tracking-tight">{t.help.title}</h2>
               
               <div className="grid grid-cols-2 gap-12">
                   <div>
                       <h3 className="text-sm font-bold text-teal-600 uppercase tracking-wider mb-4 border-b border-teal-100 pb-2">{t.help.basic}</h3>
                       <div className="space-y-6">
                           <div className="flex gap-4 group">
                               <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
                                   <MousePointer2 size={24} />
                               </div>
                               <div>
                                   <div className="font-bold text-slate-700">{t.help.drag}</div>
                                   <div className="text-sm text-slate-500 leading-relaxed">{t.help.dragDesc}</div>
                               </div>
                           </div>
                           <div className="flex gap-4 group">
                               <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
                                   <Plus size={24} />
                               </div>
                               <div>
                                   <div className="font-bold text-slate-700">{t.help.create}</div>
                                   <div className="text-sm text-slate-500 leading-relaxed">{t.help.createDesc}</div>
                               </div>
                           </div>
                           <div className="flex gap-4 group">
                               <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
                                   <Mouse size={24} />
                               </div>
                               <div>
                                   <div className="font-bold text-slate-700">{t.help.right}</div>
                                   <div className="text-sm text-slate-500 leading-relaxed">{t.help.rightDesc}</div>
                               </div>
                           </div>
                       </div>
                   </div>

                   <div>
                       <h3 className="text-sm font-bold text-purple-600 uppercase tracking-wider mb-4 border-b border-purple-100 pb-2">{t.help.advanced}</h3>
                       <div className="space-y-6">
                           <div className="flex gap-4 group">
                               <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-purple-50 group-hover:text-purple-600 transition-colors">
                                   <ImageIcon size={24} />
                               </div>
                               <div>
                                   <div className="font-bold text-slate-700">{t.help.paste}</div>
                                   <div className="text-sm text-slate-500 leading-relaxed">{t.help.pasteDesc}</div>
                               </div>
                           </div>
                           <div className="flex gap-4 group">
                               <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-purple-50 group-hover:text-purple-600 transition-colors">
                                   <Merge size={24} />
                               </div>
                               <div>
                                   <div className="font-bold text-slate-700">{t.help.merge}</div>
                                   <div className="text-sm text-slate-500 leading-relaxed">{t.help.mergeDesc}</div>
                               </div>
                           </div>
                           <div className="flex gap-4 group">
                               <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-purple-50 group-hover:text-purple-600 transition-colors">
                                   <Magnet size={24} />
                               </div>
                               <div>
                                   <div className="font-bold text-slate-700">{t.help.magnet}</div>
                                   <div className="text-sm text-slate-500 leading-relaxed">{t.help.magnetDesc}</div>
                               </div>
                           </div>
                       </div>
                   </div>
               </div>
               
               <div className="mt-8 pt-8 border-t border-slate-100 flex gap-4 text-xs text-slate-400">
                   <div className="bg-slate-50 px-3 py-1 rounded border border-slate-100">Ctrl + Z : {t.help.undoKey}</div>
                   <div className="bg-slate-50 px-3 py-1 rounded border border-slate-100">Ctrl + Y : {t.help.redoKey}</div>
                   <div className="bg-slate-50 px-3 py-1 rounded border border-slate-100">Enter : {t.help.confirmKey}</div>
                   <div className="bg-slate-50 px-3 py-1 rounded border border-slate-100">Shift + Enter : {t.help.newlineKey}</div>
               </div>
            </div>
        </div>
      )}

      {/* Trash Zone */}
      {!isZenMode && (
          <div 
            ref={trashRef}
            className={`fixed bottom-0 right-0 w-48 h-48 flex items-center justify-center transition-all duration-300 pointer-events-none z-10 
              ${isDraggingNodes ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
            `}
            style={{ 
               background: isOverTrash ? 'radial-gradient(circle at bottom right, #fee2e2 0%, transparent 70%)' : 'radial-gradient(circle at bottom right, #f1f5f9 0%, transparent 70%)'
            }}
          >
             <div className={`transition-transform duration-300 ${isOverTrash ? 'scale-125 text-red-500' : 'text-slate-300'}`}>
                <Trash2 size={48} />
             </div>
          </div>
      )}

    </div>
  );
};

export default App;