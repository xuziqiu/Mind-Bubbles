import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Node, Edge, ViewState, ContextMenuState } from './types';
import { COLORS, INITIAL_NODES, INITIAL_EDGES, ZOOM_SENSITIVITY, MIN_ZOOM, MAX_ZOOM, DEFAULT_DIMENSIONS, DEFAULT_PHYSICS } from './constants';
import { 
  MousePointer2, 
  Trash2,
  Unlink,
  Link as LinkIcon,
  Plus,
  CornerDownRight,
  Wind,
  Settings2,
  X,
  Magnet,
  HelpCircle,
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
  Maximize,
  Zap,
  Scissors,
  Undo2,
  Redo2,
  Pin,
  PinOff,
  Image as ImageIcon
} from 'lucide-react';

const TRASH_SIZE_NORMAL = 100;
const TRASH_SIZE_ACTIVE = 400;

// Helper to get effective radius for physics/links based on shape
const getPhysicsRadius = (node: Node) => {
  if (node.shape === 'circle') {
    return node.dimensions.circleRadius;
  } else {
    return (node.dimensions.rectWidth + node.dimensions.rectHeight) / 4;
  }
};

// Helper: Map range [0, 100] to [min, max]
const mapRange = (value: number, outMin: number, outMax: number) => {
    return outMin + (value / 100) * (outMax - outMin);
};

interface VisualEffect {
    id: string;
    x: number;
    y: number;
    type: 'create' | 'delete' | 'link' | 'unlink';
    timestamp: number;
}

// History Snapshot Type
interface HistoryState {
  nodes: Node[];
  edges: Edge[];
}

const App: React.FC = () => {
  // --- Core Data ---
  const [nodes, setNodes] = useState<Node[]>(INITIAL_NODES);
  const [edges, setEdges] = useState<Edge[]>(INITIAL_EDGES);
  const [view, setView] = useState<ViewState>({ scale: 1, translateX: window.innerWidth / 2, translateY: window.innerHeight / 2 });
  const [effects, setEffects] = useState<VisualEffect[]>([]);
  
  // --- History State ---
  const [past, setPast] = useState<HistoryState[]>([]);
  const [future, setFuture] = useState<HistoryState[]>([]);

  // --- Selection & Edit State ---
  const [selectedNodeIds, setSelectedNodeIds] = useState<Set<string>>(new Set());
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [nearHandleNodeId, setNearHandleNodeId] = useState<string | null>(null); 
  
  // Physics & Modes
  const [isFloating, setIsFloating] = useState(true); // true = unfrozen (physics on), false = frozen
  const [showPhysicsSettings, setShowPhysicsSettings] = useState(false);
  
  // UI Configuration
  const [showHelp, setShowHelp] = useState(false);
  const [isHelpHovered, setIsHelpHovered] = useState(false); // For floating hints
  const [defaultShape, setDefaultShape] = useState<'circle' | 'rectangle'>('circle');

  // --- IO State ---
  const [ioModalOpen, setIoModalOpen] = useState(false);
  const [ioMode, setIoMode] = useState<'export' | 'import'>('export');
  const [ioText, setIoText] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  
  // --- Physics Parameters (Normalized 0-100) ---
  const [physicsParams, setPhysicsParams] = useState(DEFAULT_PHYSICS);

  // --- UI State ---
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [selectionBox, setSelectionBox] = useState<{x: number, y: number, w: number, h: number} | null>(null);
  const [dragEdges, setDragEdges] = useState<{sourceId: string, x: number, y: number}[]>([]);
  const [gestureFeedback, setGestureFeedback] = useState<{ text: string, type: 'create' | 'link' | 'unlink' | 'neutral', x: number, y: number } | null>(null);
  const [isOverTrash, setIsOverTrash] = useState(false);
  const [isDraggingNodes, setIsDraggingNodes] = useState(false);

  // --- Interaction Logic Refs ---
  const editRef = useRef<HTMLDivElement>(null); 
  
  const dragRef = useRef<{
    isDown: boolean;
    button: number; 
    mode: 'pan' | 'move_nodes' | 'box_select' | 'link_create' | 'resize_node' | null;
    startX: number; 
    startY: number; 
    startViewX: number;
    startViewY: number;
    nodeSnapshots: Map<string, {x: number, y: number}>;
    initialSelection: Set<string>;
    linkSources: string[];
    resizeNodeId: string | null;
    initialDimensions: { circleRadius: number; rectWidth: number; rectHeight: number } | null;
    historySnapshot: HistoryState | null; // Stores state at start of drag for undo
  }>({
    isDown: false,
    button: -1,
    mode: null,
    startX: 0,
    startY: 0,
    startViewX: 0,
    startViewY: 0,
    nodeSnapshots: new Map(),
    initialSelection: new Set(),
    linkSources: [],
    resizeNodeId: null,
    initialDimensions: null,
    historySnapshot: null,
  });

  const trashRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // --- Helpers ---
  const screenToCanvas = useCallback((sx: number, sy: number) => ({
    x: (sx - view.translateX) / view.scale,
    y: (sy - view.translateY) / view.scale
  }), [view]);

  const getNodeAt = (x: number, y: number) => {
    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i];
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

  const hasMagnet = nodes.some(n => n.type === 'magnet');

  // --- History Management ---
  // Call this BEFORE making a state change that should be undoable
  const saveHistory = useCallback(() => {
    setPast(prev => {
      const newPast = [...prev, { nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) }];
      if (newPast.length > 30) newPast.shift(); // Limit history depth
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

  // Keyboard Shortcuts (Undo/Redo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (editingNodeId) return; // Allow text editing keys
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
        e.preventDefault();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) {
         handleRedo();
         e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, editingNodeId]);


  // --- Effects Logic ---
  const triggerEffect = (x: number, y: number, type: VisualEffect['type']) => {
      const id = Math.random().toString(36).slice(2);
      setEffects(prev => [...prev, { id, x, y, type, timestamp: Date.now() }]);
      setTimeout(() => {
          setEffects(prev => prev.filter(e => e.id !== id));
      }, 800); 
  };

  // --- Export Image Logic ---
  const handleExportImage = () => {
      if (nodes.length === 0) return;

      // 1. Calculate Bounds
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      nodes.forEach(n => {
          const r = n.shape === 'circle' ? n.dimensions.circleRadius : Math.max(n.dimensions.rectWidth, n.dimensions.rectHeight) / 2;
          // Add extra safety margin
          minX = Math.min(minX, n.x - r - 20);
          minY = Math.min(minY, n.y - r - 20);
          maxX = Math.max(maxX, n.x + r + 20);
          maxY = Math.max(maxY, n.y + r + 20);
      });

      const width = maxX - minX;
      const height = maxY - minY;

      if (width <= 0 || height <= 0) return;

      // 2. Clone the SVG content
      const svgElement = containerRef.current?.querySelector('svg');
      if (!svgElement) return;

      const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;
      
      // 3. Reset Transform on the group to ensure we get raw coordinates relative to viewBox
      const contentGroup = clonedSvg.querySelector('g');
      if (contentGroup) {
          contentGroup.setAttribute('transform', 'translate(0, 0) scale(1)');
      }

      // 4. REPLACE foreignObject WITH text TO AVOID SECURITY ERROR (Tainted Canvas)
      const foreignObjects = clonedSvg.querySelectorAll('foreignObject');
      foreignObjects.forEach(fo => {
          const parent = fo.parentElement;
          if (!parent) return;

          // Check for Icon (SVG) - specifically for Magnet node
          const iconSvg = fo.querySelector('svg');
          if (iconSvg) {
              const newIcon = iconSvg.cloneNode(true) as SVGElement;
              // Hardcode style since Tailwind classes won't apply
              newIcon.setAttribute("stroke", "#f59e0b"); // Amber 500
              // Center it (assume 24x24 default)
              newIcon.setAttribute("x", "-12");
              newIcon.setAttribute("y", "-12");
              newIcon.setAttribute("width", "24");
              newIcon.setAttribute("height", "24");
              parent.replaceChild(newIcon, fo);
              return;
          }

          // Text Handling
          const textDiv = fo.querySelector('div');
          // Use innerText to respect newlines, fallback to textContent
          const textContent = (textDiv as HTMLElement)?.innerText || textDiv?.textContent || '';
          
          const isCircle = parent.querySelector('circle') !== null;
          
          const textEl = document.createElementNS("http://www.w3.org/2000/svg", "text");
          textEl.setAttribute("fill", "#334155"); // slate-700
          textEl.setAttribute("font-family", "system-ui, -apple-system, sans-serif");
          textEl.setAttribute("font-size", "14px");
          textEl.setAttribute("font-weight", "500");
          textEl.setAttribute("pointer-events", "none");
          
          if (isCircle) {
              textEl.setAttribute("x", "0");
              textEl.setAttribute("y", "0");
              textEl.setAttribute("text-anchor", "middle");
              textEl.setAttribute("dominant-baseline", "middle");
          } else {
              // Rectangle logic
              const rect = parent.querySelector('rect');
              const w = rect ? parseFloat(rect.getAttribute('width') || '0') : 0;
              const h = rect ? parseFloat(rect.getAttribute('height') || '0') : 0;
              // Align top-left with padding
              textEl.setAttribute("x", `${-w/2 + 20}`); 
              textEl.setAttribute("y", `${-h/2 + 25}`); 
              textEl.setAttribute("text-anchor", "start");
          }

          // Handle multi-line text
          const lines = textContent.split('\n');
          lines.forEach((line, i) => {
              const tspan = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
              tspan.textContent = line;
              if (isCircle) {
                  tspan.setAttribute("x", "0");
                  // Vertical centering adjustment for multiline
                  if (lines.length === 1) {
                      tspan.setAttribute("dy", "0.3em");
                  } else {
                      // Simple stack centering logic
                      const lineHeight = 1.2; // em
                      const startY = -((lines.length - 1) * lineHeight) / 2;
                      tspan.setAttribute("dy", i === 0 ? `${startY + 0.3}em` : `${lineHeight}em`);
                  }
              } else {
                  const rect = parent.querySelector('rect');
                  const w = rect ? parseFloat(rect.getAttribute('width') || '0') : 0;
                  tspan.setAttribute("x", `${-w/2 + 20}`);
                  tspan.setAttribute("dy", i === 0 ? "0" : "1.4em");
              }
              textEl.appendChild(tspan);
          });

          parent.replaceChild(textEl, fo);
      });

      // 5. Set viewBox to crop to content
      clonedSvg.setAttribute('viewBox', `${minX} ${minY} ${width} ${height}`);
      clonedSvg.setAttribute('width', `${width}`);
      clonedSvg.setAttribute('height', `${height}`);
      
      // 6. Serialize
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(clonedSvg);
      
      // 7. Convert to Image
      const img = new Image();
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      img.onload = () => {
          const canvas = document.createElement('canvas');
          // Double resolution for better quality
          const scale = 2;
          canvas.width = width * scale;
          canvas.height = height * scale;
          const ctx = canvas.getContext('2d');
          if (ctx) {
             ctx.scale(scale, scale);
             // Fill background (optional, otherwise transparent)
             // ctx.fillStyle = "#f8fafc";
             // ctx.fillRect(0, 0, width, height);
             
             ctx.drawImage(img, 0, 0, width, height);
             
             try {
                const pngUrl = canvas.toDataURL('image/png');
                const link = document.createElement('a');
                link.href = pngUrl;
                link.download = `mindbubbles-export-${Date.now()}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
             } catch (e) {
                 console.error("Export failed:", e);
                 alert("导出图片失败：浏览器安全限制 (Tainted Canvas)。");
             }
          }
          URL.revokeObjectURL(url);
      };
      img.onerror = (e) => {
          console.error("Image load failed", e);
          URL.revokeObjectURL(url);
      };
      img.src = url;
  };

  // --- IO Logic ---
  const handleOpenExport = () => {
    let mermaid = "graph TD\n";
    nodes.forEach(n => {
        const safeText = n.text.replace(/"/g, "'").replace(/\n/g, ' ');
        const safeId = n.id.replace(/[^a-zA-Z0-9_-]/g, '_');
        
        if (n.type === 'magnet') return; 

        if (n.shape === 'circle') {
            mermaid += `    ${safeId}(("${safeText}"))\n`;
        } else {
            mermaid += `    ${safeId}["${safeText}"]\n`;
        }
    });
    mermaid += "\n";
    edges.forEach(e => {
        const sourceId = e.source.replace(/[^a-zA-Z0-9_-]/g, '_');
        const targetId = e.target.replace(/[^a-zA-Z0-9_-]/g, '_');
        if (nodes.find(n => n.id === e.source && n.type !== 'magnet') && nodes.find(n => n.id === e.target && n.type !== 'magnet')) {
            mermaid += `    ${sourceId} --> ${targetId}\n`;
        }
    });

    setIoText(mermaid);
    setIoMode('export');
    setCopySuccess(false);
    setIoModalOpen(true);
  };

  const handleCopyCode = async () => {
      try {
          await navigator.clipboard.writeText(ioText);
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
      } catch (err) {
          console.error('Failed to copy', err);
      }
  };

  const handleImportMermaid = () => {
      saveHistory(); // Save before import
      const lines = ioText.split('\n');
      const newNodes: Node[] = [];
      const newEdges: Edge[] = [];
      const nodeMap = new Map<string, Node>();
      
      let nodeCounter = 0;
      const centerX = (window.innerWidth / 2 - view.translateX) / view.scale;
      const centerY = (window.innerHeight / 2 - view.translateY) / view.scale;

      const createNode = (id: string, text: string, shape: 'circle' | 'rectangle'): Node => {
        if (nodeMap.has(id)) {
            const n = nodeMap.get(id)!;
            if (text && text !== id) n.text = text;
            if (shape) n.shape = shape;
            return n;
        }

        const angle = nodeCounter * 0.8; 
        const radius = 60 + (nodeCounter * 45);
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;

        const newNode: Node = {
            id,
            text: text || id,
            x,
            y,
            color: COLORS[nodeCounter % COLORS.length],
            shape: shape,
            dimensions: { ...DEFAULT_DIMENSIONS }
        };
        nodeMap.set(id, newNode);
        newNodes.push(newNode);
        nodeCounter++;
        return newNode;
      };

      lines.forEach(line => {
          line = line.trim();
          if (!line || line.startsWith('graph') || line.startsWith('flowchart')) return;

          if (line.includes('-->')) {
              const parts = line.split('-->');
              const s = parseNodeStr(parts[0].trim());
              const t = parseNodeStr(parts[1].trim());

              createNode(s.id, s.text, s.shape);
              createNode(t.id, t.text, t.shape);

              newEdges.push({
                  id: `edge-${Math.random().toString(36).slice(2)}`,
                  source: s.id,
                  target: t.id
              });
          } else {
              const parsed = parseNodeStr(line);
              if (parsed.text) createNode(parsed.id, parsed.text, parsed.shape);
          }
      });
      
      // Helper for parsing node string inside loop
      function parseNodeStr(raw: string) {
          let id = raw;
          let text = '';
          let shape: 'circle' | 'rectangle' = 'rectangle';
          const circleMatch = raw.match(/^([a-zA-Z0-9_-]+)\s*\(\((.*?)\)\)/);
          const rectMatch = raw.match(/^([a-zA-Z0-9_-]+)\s*\[(.*?)\]/);
          
          if (circleMatch) {
              id = circleMatch[1];
              text = circleMatch[2].replace(/^"|"$/g, '');
              shape = 'circle';
          } else if (rectMatch) {
              id = rectMatch[1];
              text = rectMatch[2].replace(/^"|"$/g, '');
              shape = 'rectangle';
          } else {
              id = raw.replace(/\s/g, '');
          }
          return { id, text, shape };
      }

      if (newNodes.length > 0) {
          setNodes(newNodes);
          setEdges(newEdges);
          setIoModalOpen(false);
          setIsFloating(true);
          setTimeout(() => setIsFloating(true), 100); 
      } else {
          alert('未能识别有效的 Mermaid 代码。');
      }
  };

  // --- Keyboard Shortcuts (Delete) ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (editingNodeId || ioModalOpen) return;
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNodeIds.size > 0) {
          deleteNodes(selectedNodeIds);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeIds, editingNodeId, ioModalOpen]);

  // --- Physics Simulation ---
  useEffect(() => {
    if (!isFloating) return;
    let animationFrameId: number;

    // Physics constants derived from UI params (0-100)
    const repulsionStrength = mapRange(physicsParams.repulsion, 5000, 200000);
    const targetLength = mapRange(physicsParams.length, 50, 500);
    const stiffness = mapRange(physicsParams.stiffness, 0.005, 0.3);
    const gravityStrength = mapRange(physicsParams.gravity, 0, 0.05);
    const friction = mapRange(physicsParams.friction, 0.1, 0.95);

    const tick = () => {
      setNodes(prevNodes => {
        const nodeMap = new Map(prevNodes.map(n => [n.id, n]));
        
        const forces = prevNodes.map(node => {
           // Skip physics if dragging, editing, OR PINNED
           if ((dragRef.current.isDown && dragRef.current.mode === 'move_nodes' && selectedNodeIds.has(node.id)) || 
               editingNodeId === node.id ||
               (dragRef.current.isDown && dragRef.current.mode === 'resize_node' && dragRef.current.resizeNodeId === node.id) ||
               node.pinned) {
             return { dx: 0, dy: 0 };
           }

           let fx = 0, fy = 0;
           const myRadius = getPhysicsRadius(node);

           // Repulsion
           prevNodes.forEach(other => {
             if (node.id === other.id) return;
             const otherRadius = getPhysicsRadius(other);
             const dx = node.x - other.x;
             const dy = node.y - other.y;
             let distSq = dx * dx + dy * dy;
             if (distSq === 0) distSq = 1; 
             const dist = Math.sqrt(distSq);
             const sizeMultiplier = (myRadius + otherRadius) / 80;
             const repulsionMult = (node.type === 'magnet' || other.type === 'magnet') ? 2 : 1;
             const force = (repulsionStrength * repulsionMult * sizeMultiplier) / (distSq * dist); 
             fx += dx * force;
             fy += dy * force;
           });

           // Attraction
           edges.forEach(edge => {
             let otherId: string | null = null;
             if (edge.source === node.id) otherId = edge.target;
             else if (edge.target === node.id) otherId = edge.source;

             if (otherId && nodeMap.has(otherId)) {
               const other = nodeMap.get(otherId)!;
               const otherRadius = getPhysicsRadius(other);
               const dx = other.x - node.x;
               const dy = other.y - node.y;
               const dist = Math.sqrt(dx * dx + dy * dy);
               const desiredLen = targetLength + (myRadius + otherRadius) * 0.5;
               const displacement = dist - desiredLen;
               const force = stiffness * displacement; 
               fx += (dx / dist) * force;
               fy += (dy / dist) * force;
             }
           });

           // Gravity (Center pull)
           fx -= node.x * gravityStrength; 
           fy -= node.y * gravityStrength;

           return { dx: fx, dy: fy };
        });

        return prevNodes.map((node, i) => {
          // If node is pinned, don't update position from physics
          if ((dragRef.current.isDown && dragRef.current.mode === 'move_nodes' && selectedNodeIds.has(node.id)) || 
               editingNodeId === node.id ||
               (dragRef.current.isDown && dragRef.current.mode === 'resize_node' && dragRef.current.resizeNodeId === node.id) ||
               node.pinned) {
             return node;
          }
          const { dx, dy } = forces[i];
          const maxStep = 15; 
          
          // Apply friction implicitly by just taking the calculated force displacement directly 
          // (in a real Verlet integration, friction applies to velocity, but here we use a simplified iterative displacement)
          // We can simulate "sluggishness" by dampening the step.
          const dampening = 1.0 - (friction * 0.5); // Higher friction = lower multiplier

          let moveX = dx * dampening;
          let moveY = dy * dampening;

          const moveDist = Math.sqrt(moveX*moveX + moveY*moveY);
          if (moveDist > maxStep) {
            moveX = (moveX / moveDist) * maxStep;
            moveY = (moveY / moveDist) * maxStep;
          }
          if (moveDist < 0.05) return node;
          return { ...node, x: node.x + moveX, y: node.y + moveY };
        });
      });
      animationFrameId = requestAnimationFrame(tick);
    };
    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isFloating, edges, selectedNodeIds, editingNodeId, physicsParams]);

  // --- Actions ---
  const deleteNodes = (idsToDelete: Set<string>) => {
    if (idsToDelete.size > 0) saveHistory(); // Save before delete
    
    // Trigger Effects before deletion
    nodes.forEach(n => {
        if (idsToDelete.has(n.id)) {
            triggerEffect(n.x, n.y, 'delete');
        }
    });

    setNodes(prev => prev.filter(n => !idsToDelete.has(n.id)));
    setEdges(prev => prev.filter(e => !idsToDelete.has(e.source) && !idsToDelete.has(e.target)));
    setSelectedNodeIds(new Set());
    setEditingNodeId(null);
  };

  const toggleShape = (nodeId: string) => {
    saveHistory(); // Save before shape toggle
    setNodes(prev => prev.map(n => {
      if (n.id === nodeId) {
        return {
          ...n,
          shape: n.shape === 'circle' ? 'rectangle' : 'circle'
        };
      }
      return n;
    }));
    setContextMenu(null);
  };

  const checkLinkAction = (sources: string[], targetId: string | null) => {
    if (!targetId) return 'create';
    const isConnected = sources.every(src => 
      edges.some(e => (e.source === src && e.target === targetId) || (e.source === targetId && e.target === src))
    );
    return isConnected ? 'unlink' : 'link';
  };

  const handleLinkAction = (targetNodeId: string | null, mouseCanvasX: number, mouseCanvasY: number) => {
    const sources = dragRef.current.linkSources;
    if (sources.length === 0) return;

    if (targetNodeId) {
       const action = checkLinkAction(sources, targetNodeId);
       
       if (action === 'link' || action === 'unlink') saveHistory(); // Save before link/unlink

       // Trigger Link Effects
       const targetNode = nodes.find(n => n.id === targetNodeId);
       if (targetNode) {
           if (action === 'unlink') {
               // Removed unlink visual effect
           } else {
              // Removed link animation trigger as requested
           }
       }

       setEdges(prev => {
         if (action === 'unlink') {
            return prev.filter(e => 
              !((sources.includes(e.source) && e.target === targetNodeId) || 
                (sources.includes(e.target) && e.source === targetNodeId))
            );
         } else {
            const newEdges = [...prev];
            sources.forEach(src => {
                if (src === targetNodeId) return;
                const exists = prev.some(e => (e.source === src && e.target === targetNodeId) || (e.source === targetNodeId && e.target === src));
                if (!exists) {
                    newEdges.push({
                        id: Math.random().toString(36).slice(2),
                        source: src,
                        target: targetNodeId
                    });
                }
            });
            return newEdges;
         }
       });
    } else {
      saveHistory(); // Save before creating new node via drag
      const newNodeId = Math.random().toString(36).slice(2);
      const newNode: Node = {
        id: newNodeId,
        text: '想法',
        x: mouseCanvasX,
        y: mouseCanvasY,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        shape: defaultShape,
        dimensions: { ...DEFAULT_DIMENSIONS }
      };
      
      triggerEffect(mouseCanvasX, mouseCanvasY, 'create'); // Trigger ripple

      const newEdges = sources.map(srcId => ({
        id: Math.random().toString(36).slice(2),
        source: srcId,
        target: newNodeId
      }));
      
      setNodes(prev => [...prev, newNode]);
      setEdges(prev => [...prev, ...newEdges]);
      setEditingNodeId(newNodeId);
      setSelectedNodeIds(new Set([newNodeId]));
    }
  };

  const spawnMagnetNode = (x: number, y: number) => {
    saveHistory(); // Save before spawn
    const magnetId = 'magnet-' + Math.random().toString(36).slice(2);
    const magnetNode: Node = {
      id: magnetId,
      text: 'MAGNET',
      type: 'magnet',
      x,
      y,
      color: '#d97706',
      shape: 'circle',
      dimensions: { circleRadius: 60, rectWidth: 180, rectHeight: 120 }
    };

    triggerEffect(x, y, 'create');

    setNodes(prevNodes => [...prevNodes, magnetNode]);
    setEdges(prevEdges => {
      const connectedNodeIds = new Set<string>();
      prevEdges.forEach(e => { connectedNodeIds.add(e.source); connectedNodeIds.add(e.target); });
      const isolatedNodes = nodes.filter(n => !connectedNodeIds.has(n.id) && n.id !== magnetId);
      const newEdges = isolatedNodes.map(n => ({
        id: 'edge-' + Math.random().toString(36).slice(2),
        source: magnetId,
        target: n.id
      }));
      return [...prevEdges, ...newEdges];
    });
    setSelectedNodeIds(new Set([magnetId]));
  };

  const smoothPanTo = (targetTx: number, targetTy: number) => {
    const startTx = view.translateX;
    const startTy = view.translateY;
    const startTime = performance.now();
    const duration = 500; 

    const animate = (time: number) => {
        const elapsed = time - startTime;
        const t = Math.min(elapsed / duration, 1);
        const ease = t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t; 
        setView(prev => ({
            ...prev,
            translateX: startTx + (targetTx - startTx) * ease,
            translateY: startTy + (targetTy - startTy) * ease
        }));
        if (t < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  };

  const handleCaptureAndLocate = () => {
    const magnet = nodes.find(n => n.type === 'magnet');
    if (!magnet) return;
    
    saveHistory(); // Save before capture

    // Trigger effect on magnet
    triggerEffect(magnet.x, magnet.y, 'link');

    setEdges(prevEdges => {
        const magnetId = magnet.id;
        const magnetEdges = prevEdges.filter(e => e.source === magnetId || e.target === magnetId);
        const otherEdges = prevEdges.filter(e => e.source !== magnetId && e.target !== magnetId);
        const nodesInOtherEdges = new Set<string>();
        otherEdges.forEach(e => { nodesInOtherEdges.add(e.source); nodesInOtherEdges.add(e.target); });
        const keptMagnetEdges = magnetEdges.filter(e => {
            const otherNodeId = e.source === magnetId ? e.target : e.source;
            return !nodesInOtherEdges.has(otherNodeId);
        });
        const connectedToOthers = nodesInOtherEdges;
        const connectedToMagnet = new Set<string>();
        keptMagnetEdges.forEach(e => { connectedToMagnet.add(e.source === magnetId ? e.target : e.source); });
        const orphans = nodes.filter(n => n.id !== magnetId && !connectedToOthers.has(n.id) && !connectedToMagnet.has(n.id));
        const newEdges = orphans.map(n => ({
            id: 'edge-' + Math.random().toString(36).slice(2),
            source: magnetId,
            target: n.id
        }));
        return [...otherEdges, ...keptMagnetEdges, ...newEdges];
    });

    const targetTx = (window.innerWidth / 2) - (magnet.x * view.scale);
    const targetTy = (window.innerHeight / 2) - (magnet.y * view.scale);
    smoothPanTo(targetTx, targetTy);
  };

  const handleMagnetClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (hasMagnet) {
          handleCaptureAndLocate();
      } else {
          const cx = (window.innerWidth / 2 - view.translateX) / view.scale;
          const cy = (window.innerHeight / 2 - view.translateY) / view.scale;
          spawnMagnetNode(cx, cy);
      }
  };

  // --- Event Handlers ---
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.physics-panel')) return;
    if ((e.target as HTMLElement).closest('.help-modal')) return;
    if ((e.target as HTMLElement).closest('.io-modal')) return;
    if ((e.target as HTMLElement).closest('.toolbar-container')) return; 

    if ((e.target as HTMLElement).isContentEditable) return;

    if (editingNodeId) {
        if (editRef.current) {
            saveHistory(); // Save before finishing edit
            const text = editRef.current.innerText.trim();
            setNodes(prev => prev.map(n => n.id === editingNodeId ? { ...n, text: text } : n));
        }
        setEditingNodeId(null);
    }

    e.preventDefault(); 
    setContextMenu(null); 
    if (showHelp) setShowHelp(false);

    // Save snapshot for potential history push on mouse up
    dragRef.current.historySnapshot = { 
        nodes: JSON.parse(JSON.stringify(nodes)), 
        edges: JSON.parse(JSON.stringify(edges)) 
    };

    if ((e.target as HTMLElement).getAttribute('data-resize-handle')) {
        const nodeId = (e.target as HTMLElement).getAttribute('data-node-id');
        const node = nodes.find(n => n.id === nodeId);
        if (node) {
            dragRef.current = {
                ...dragRef.current,
                isDown: true,
                button: 0,
                mode: 'resize_node',
                resizeNodeId: nodeId,
                initialDimensions: { ...node.dimensions },
                startX: e.clientX,
                startY: e.clientY
            };
        }
        return;
    }

    const { x: cx, y: cy } = screenToCanvas(e.clientX, e.clientY);
    const clickedNode = getNodeAt(cx, cy);

    dragRef.current = {
      ...dragRef.current, // keep historySnapshot
      isDown: true,
      button: e.button,
      mode: null,
      startX: e.clientX,
      startY: e.clientY,
      startViewX: view.translateX,
      startViewY: view.translateY,
      nodeSnapshots: new Map(),
      initialSelection: new Set(selectedNodeIds),
      linkSources: [],
      resizeNodeId: null,
      initialDimensions: null,
    };

    // Middle Mouse = Pan (Removed Spacebar pan)
    if (e.button === 1) {
      dragRef.current.mode = 'pan';
      return;
    }

    if (e.button === 2) {
      if (clickedNode) {
        dragRef.current.mode = 'link_create';
        let sources: string[] = [];
        if (selectedNodeIds.has(clickedNode.id)) {
          sources = Array.from(selectedNodeIds);
        } else {
          sources = [clickedNode.id];
          setSelectedNodeIds(new Set([clickedNode.id]));
        }
        dragRef.current.linkSources = sources;
        setDragEdges(sources.map(id => ({ sourceId: id, x: cx, y: cy })));
      }
      return;
    }

    if (e.button === 0) {
      if (clickedNode) {
        dragRef.current.mode = 'move_nodes';
        let newSelection = new Set(selectedNodeIds);
        if (e.ctrlKey || e.metaKey) {
          if (newSelection.has(clickedNode.id)) newSelection.delete(clickedNode.id);
          else newSelection.add(clickedNode.id);
          setSelectedNodeIds(newSelection);
        } else {
          if (!newSelection.has(clickedNode.id)) {
             newSelection = new Set([clickedNode.id]);
             setSelectedNodeIds(newSelection);
          }
        }
        const effectiveSelection = (e.ctrlKey || e.metaKey || !selectedNodeIds.has(clickedNode.id)) 
                                    ? newSelection 
                                    : selectedNodeIds;
        effectiveSelection.forEach(id => {
          const n = nodes.find(node => node.id === id);
          if (n) dragRef.current.nodeSnapshots.set(id, { x: n.x, y: n.y });
        });
      } else {
        dragRef.current.mode = 'box_select';
        if (!e.ctrlKey && !e.metaKey) {
            setSelectedNodeIds(new Set());
            dragRef.current.initialSelection = new Set();
        }
        setEditingNodeId(null);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const { x: cx, y: cy } = screenToCanvas(e.clientX, e.clientY);

    // --- PROXIMITY CHECK FOR RESIZE HANDLES ---
    let closestHandleNodeId: string | null = null;
    let minHandleDist = Infinity;
    for (let i = nodes.length - 1; i >= 0; i--) {
        const n = nodes[i];
        if (n.type === 'magnet') continue;

        let hx, hy;
        if (n.shape === 'circle') {
             const r = n.dimensions.circleRadius;
             hx = n.x + r * 0.707;
             hy = n.y + r * 0.707;
        } else {
             const w = n.dimensions.rectWidth;
             const h = n.dimensions.rectHeight;
             hx = n.x + w/2 - 2;
             hy = n.y + h/2 - 2;
        }
        const dist = Math.sqrt((cx - hx)**2 + (cy - hy)**2);
        const threshold = 30 / view.scale; 

        if (dist < threshold && dist < minHandleDist) {
            minHandleDist = dist;
            closestHandleNodeId = n.id;
        }
    }
    setNearHandleNodeId(closestHandleNodeId);

    if (!dragRef.current.isDown) {
      const hovered = getNodeAt(cx, cy);
      setHoveredNodeId(hovered?.id || null);
      return;
    }

    // Resize Logic
    if (dragRef.current.mode === 'resize_node' && dragRef.current.resizeNodeId && dragRef.current.initialDimensions) {
        const node = nodes.find(n => n.id === dragRef.current.resizeNodeId);
        if (node) {
            const dx = (e.clientX - dragRef.current.startX) / view.scale;
            const dy = (e.clientY - dragRef.current.startY) / view.scale;

            setNodes(prev => prev.map(n => {
                if (n.id === dragRef.current.resizeNodeId) {
                    const newDims = { ...n.dimensions };
                    if (n.shape === 'circle') {
                        newDims.circleRadius = Math.max(30, dragRef.current.initialDimensions!.circleRadius + dx);
                    } else {
                        newDims.rectWidth = Math.max(100, dragRef.current.initialDimensions!.rectWidth + dx * 2);
                        newDims.rectHeight = Math.max(60, dragRef.current.initialDimensions!.rectHeight + dy * 2);
                    }
                    return { ...n, dimensions: newDims };
                }
                return n;
            }));
        }
        return;
    }

    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    const dist = Math.sqrt(dx*dx + dy*dy);
    const isDragging = dist > 4;

    if (isDragging) {
      if (dragRef.current.mode === 'pan') {
        setView(v => ({
          ...v,
          translateX: dragRef.current.startViewX + dx,
          translateY: dragRef.current.startViewY + dy
        }));
      }
      else if (dragRef.current.mode === 'move_nodes') {
        setIsDraggingNodes(true);
        const canvasDx = dx / view.scale;
        const canvasDy = dy / view.scale;
        setNodes(prev => prev.map(n => {
          const snap = dragRef.current.nodeSnapshots.get(n.id);
          if (snap) {
            return { ...n, x: snap.x + canvasDx, y: snap.y + canvasDy };
          }
          return n;
        }));
        // Improved Trash Detection - Large corner area
        const cornerX = window.innerWidth;
        const cornerY = window.innerHeight;
        const mouseDist = Math.sqrt((e.clientX - cornerX)**2 + (e.clientY - cornerY)**2);
        setIsOverTrash(mouseDist < 350); // Large hit area
      }
      else if (dragRef.current.mode === 'box_select') {
        const sx = dragRef.current.startX;
        const sy = dragRef.current.startY;
        const bx = Math.min(sx, e.clientX);
        const by = Math.min(sy, e.clientY);
        const bw = Math.abs(e.clientX - sx);
        const bh = Math.abs(e.clientY - sy);
        setSelectionBox({ x: bx, y: by, w: bw, h: bh });
        const cBx = (bx - view.translateX) / view.scale;
        const cBy = (by - view.translateY) / view.scale;
        const cBw = bw / view.scale;
        const cBh = bh / view.scale;
        const newSet = new Set(e.ctrlKey || e.metaKey ? dragRef.current.initialSelection : []);
        nodes.forEach(n => {
          const w = n.shape === 'circle' ? n.dimensions.circleRadius * 2 : n.dimensions.rectWidth;
          const h = n.shape === 'circle' ? n.dimensions.circleRadius * 2 : n.dimensions.rectHeight;
          const nx = n.x - w/2;
          const ny = n.y - h/2;
          const overlap = !(nx > cBx + cBw || nx + w < cBx || ny > cBy + cBh || ny + h < cBy);
          if (overlap) newSet.add(n.id);
        });
        setSelectedNodeIds(newSet);
      }
      else if (dragRef.current.mode === 'link_create') {
        setDragEdges(dragRef.current.linkSources.map(id => ({ sourceId: id, x: cx, y: cy })));
        const hovered = getNodeAt(cx, cy);
        setHoveredNodeId(hovered?.id || null);
        let text = '创建气泡';
        let type: 'create' | 'link' | 'unlink' = 'create';
        if (hovered) {
          const action = checkLinkAction(dragRef.current.linkSources, hovered.id);
          if (action === 'unlink') {
            text = '断开连接';
            type = 'unlink';
          } else {
            text = '建立连接';
            type = 'link';
          }
        }
        setGestureFeedback({ text, type, x: e.clientX, y: e.clientY });
      }
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    const { isDown, mode, startX, startY, button, historySnapshot } = dragRef.current;
    if (!isDown) return;
    
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    const isDrag = Math.sqrt(dx*dx + dy*dy) > 4;

    // HISTORY: Save state if dragging nodes or resizing actually happened
    if ((mode === 'move_nodes' && isDrag) || mode === 'resize_node') {
        if (historySnapshot) {
             setPast(prev => {
                const newPast = [...prev, historySnapshot];
                if (newPast.length > 30) newPast.shift();
                return newPast;
             });
             setFuture([]);
        }
    }

    if (mode === 'resize_node') {
        dragRef.current.isDown = false;
        dragRef.current.mode = null;
        dragRef.current.resizeNodeId = null;
        return;
    }

    const { x: cx, y: cy } = screenToCanvas(e.clientX, e.clientY);
    const clickedNode = getNodeAt(cx, cy);

    if (button === 0) {
      if (mode === 'move_nodes') {
        if (isDrag) {
          if (isOverTrash) {
             // deleteNodes handles history internally, but since we are mid-drag and logic is split, 
             // we need to be careful. deleteNodes calls saveHistory() which saves CURRENT state.
             // But we just dragged them.
             // Actually, if we delete, we want to undo to BEFORE drag? 
             // Simplest: The drag history above saved "before drag". 
             // deleteNodes will save "after drag, before delete".
             // This means undoing delete brings back nodes in new position. Undoing again moves them back.
             // That is acceptable behavior.
             deleteNodes(new Set(dragRef.current.nodeSnapshots.keys()));
          }
        } else {
          if (clickedNode) {
            if (selectedNodeIds.has(clickedNode.id)) {
               if (selectedNodeIds.size > 1 && !e.ctrlKey && !e.metaKey) {
                  setSelectedNodeIds(new Set([clickedNode.id]));
               } else if (selectedNodeIds.size === 1) {
                  setEditingNodeId(clickedNode.id);
               }
            } else {
               setSelectedNodeIds(new Set([clickedNode.id]));
            }
          }
        }
      }
      else if (mode === 'box_select' && !isDrag) {
        setSelectedNodeIds(new Set());
        setEditingNodeId(null);
      }
    }
    if (button === 2) {
      if (mode === 'link_create' && isDrag) {
        const target = getNodeAt(cx, cy);
        handleLinkAction(target?.id || null, cx, cy);
      } else if (!isDrag) {
        if (clickedNode) {
           setContextMenu({ visible: true, x: e.clientX, y: e.clientY, nodeId: clickedNode.id });
        } else {
          saveHistory(); // Save before create
          const newNodeId = Math.random().toString(36).slice(2);
          const newNode: Node = {
            id: newNodeId, text: '想法', x: cx, y: cy, color: '#64748b',
            shape: defaultShape,
            dimensions: { ...DEFAULT_DIMENSIONS }
          };
          triggerEffect(cx, cy, 'create'); // Ripple effect
          setNodes(prev => [...prev, newNode]);
          const magnet = nodes.find(n => n.type === 'magnet');
          if (magnet) {
             setEdges(prev => [...prev, {
                id: 'edge-' + Math.random().toString(36).slice(2),
                source: magnet.id,
                target: newNodeId
             }]);
          }
          setEditingNodeId(newNodeId);
          setSelectedNodeIds(new Set([newNodeId]));
        }
      }
    }

    dragRef.current.isDown = false;
    dragRef.current.mode = null;
    dragRef.current.linkSources = [];
    dragRef.current.nodeSnapshots.clear();
    setSelectionBox(null);
    setDragEdges([]);
    setGestureFeedback(null);
    setIsDraggingNodes(false);
    setIsOverTrash(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (showHelp || ioModalOpen) return;
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
      onWheel={handleWheel}
      onContextMenu={(e) => e.preventDefault()}
    >
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <g transform={`translate(${view.translateX}, ${view.translateY}) scale(${view.scale})`}>
          
          {edges.map(edge => {
            const s = nodes.find(n => n.id === edge.source);
            const t = nodes.find(n => n.id === edge.target);
            if (!s || !t) return null;
            return (
              <line
                key={edge.id}
                x1={s.x} y1={s.y} x2={t.x} y2={t.y}
                stroke="#cbd5e1"
                strokeWidth="2"
                strokeLinecap="round"
              />
            );
          })}

          {dragEdges.map((de, i) => {
            const s = nodes.find(n => n.id === de.sourceId);
            if (!s) return null;
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
            
            const isCircle = node.shape === 'circle';
            const radius = node.dimensions.circleRadius;
            const width = node.dimensions.rectWidth;
            const height = node.dimensions.rectHeight;
            
            // Only show handle if mouse is near THIS node's handle
            const showResizeHandle = !isDestruct && (nearHandleNodeId === node.id || (dragRef.current.mode === 'resize_node' && dragRef.current.resizeNodeId === node.id));

            return (
              <g 
                key={node.id} 
                transform={`translate(${node.x}, ${node.y})`}
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
                              <circle
                                r={radius}
                                fill={isDestruct ? '#fecaca' : 'white'}
                                stroke={isDestruct ? '#ef4444' : (isSelected ? '#0d9488' : (isHovered ? '#64748b' : '#cbd5e1'))}
                                strokeWidth={isDestruct || isSelected ? 3 : (isHovered ? 2 : 1.5)}
                                style={{ filter: isSelected ? 'drop-shadow(0 10px 20px rgba(13, 148, 136, 0.25))' : 'drop-shadow(0 4px 8px rgba(0,0,0,0.08))' }}
                              />
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
                                  stroke={isDestruct ? '#ef4444' : (isSelected ? '#0d9488' : (isHovered ? '#64748b' : '#cbd5e1'))}
                                  strokeWidth={isDestruct || isSelected ? 3 : (isHovered ? 2 : 1.5)}
                                  style={{ filter: isSelected ? 'drop-shadow(0 10px 20px rgba(13, 148, 136, 0.25))' : 'drop-shadow(0 4px 8px rgba(0,0,0,0.08))' }}
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
                      >
                        <div className={`w-full h-full flex overflow-hidden ${isCircle ? 'items-center justify-center text-center p-4' : 'items-start justify-start text-left p-5'}`}>
                          {isEditing ? (
                            <div
                              key="editor"
                              contentEditable
                              suppressContentEditableWarning
                              className={`w-full bg-transparent outline-none font-medium text-slate-700 pointer-events-auto ${isCircle ? 'text-center' : 'text-left'}`}
                              style={{ 
                                  fontSize: '0.875rem', 
                                  lineHeight: '1.5',
                                  minHeight: '1em',
                                  whiteSpace: 'pre-wrap',
                                  wordBreak: 'break-word'
                              }}
                              onBlur={(e) => {
                                  const text = e.currentTarget.innerText.trim();
                                  saveHistory(); // Save before update on blur
                                  setNodes(prev => prev.map(n => n.id === node.id ? { ...n, text: text } : n));
                                  setEditingNodeId(null);
                              }}
                              onKeyDown={(e) => {
                                  e.stopPropagation();
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
                                          if (node.shape !== 'circle') {
                                              range.collapse(false);
                                          }
                                          const sel = window.getSelection();
                                          if (sel) { sel.removeAllRanges(); sel.addRange(range); }
                                      }
                                  }
                              }}
                            />
                          ) : (
                            <div 
                              key="viewer"
                              className={`font-medium select-none ${isDestruct ? 'text-red-600' : 'text-slate-700'}`}
                              style={{ 
                                  fontSize: '0.875rem', 
                                  whiteSpace: 'pre-wrap', 
                                  wordBreak: 'break-word',
                                  width: '100%',
                              }}
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

          {/* Visual Effects Layer (Inside SVG to move with Pan/Zoom) */}
          {effects.map(effect => (
              <g key={effect.id} transform={`translate(${effect.x}, ${effect.y})`}>
                  {effect.type === 'create' && (
                      <circle r="40" fill="none" stroke="#0d9488" strokeWidth="2" className="effect-ripple"/>
                  )}
                  {effect.type === 'delete' && (
                      /* Pop Bubble Effect */
                      <circle r="40" fill="none" stroke="#ef4444" strokeWidth="2" className="effect-pop"/>
                  )}
              </g>
          ))}
        </g>
      </svg>
      
      {/* Physics Settings Panel */}
      {showPhysicsSettings && isFloating && (
        <div className="physics-panel fixed top-6 right-6 w-64 bg-white/90 backdrop-blur shadow-xl border border-slate-200 rounded-xl p-4 animate-in z-50">
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Wind size={16} className="text-teal-500"/> 物理参数
             </h3>
             <button onClick={() => setShowPhysicsSettings(false)} className="text-slate-400 hover:text-slate-600"><X size={16}/></button>
          </div>
          
          <div className="space-y-4">
             <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-500">
                   <span>排斥力</span>
                   <span>{physicsParams.repulsion}</span>
                </div>
                <input 
                  type="range" min="0" max="100"
                  value={physicsParams.repulsion}
                  onChange={(e) => setPhysicsParams(p => ({...p, repulsion: Number(e.target.value)}))}
                  className="w-full accent-teal-500 h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                />
             </div>
             
             <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-500">
                   <span>连线长度</span>
                   <span>{physicsParams.length}</span>
                </div>
                <input 
                  type="range" min="0" max="100"
                  value={physicsParams.length}
                  onChange={(e) => setPhysicsParams(p => ({...p, length: Number(e.target.value)}))}
                  className="w-full accent-teal-500 h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                />
             </div>

             <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-500">
                   <span>弹性刚度</span>
                   <span>{physicsParams.stiffness}</span>
                </div>
                <input 
                  type="range" min="0" max="100"
                  value={physicsParams.stiffness}
                  onChange={(e) => setPhysicsParams(p => ({...p, stiffness: Number(e.target.value)}))}
                  className="w-full accent-teal-500 h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                />
             </div>
             
             <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-500">
                   <span>向心力 (Gravity)</span>
                   <span>{physicsParams.gravity}</span>
                </div>
                <input 
                  type="range" min="0" max="100"
                  value={physicsParams.gravity}
                  onChange={(e) => setPhysicsParams(p => ({...p, gravity: Number(e.target.value)}))}
                  className="w-full accent-teal-500 h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                />
             </div>

             <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-500">
                   <span>阻尼 (Friction)</span>
                   <span>{physicsParams.friction}</span>
                </div>
                <input 
                  type="range" min="0" max="100"
                  value={physicsParams.friction}
                  onChange={(e) => setPhysicsParams(p => ({...p, friction: Number(e.target.value)}))}
                  className="w-full accent-teal-500 h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                />
             </div>
          </div>
        </div>
      )}

      {/* Main Toolbar */}
      <div className="toolbar-container fixed bottom-8 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur shadow-2xl border border-slate-200 rounded-2xl p-2 flex items-center gap-1 z-50">
         <div className="flex items-center gap-1 pr-2 border-r border-slate-100 mr-2">
             {/* Combined Shape Button */}
             <button
               className={`p-3 rounded-xl transition-all ${'bg-teal-50 text-teal-600 shadow-sm'}`}
               onClick={() => setDefaultShape(prev => prev === 'circle' ? 'rectangle' : 'circle')}
               title={defaultShape === 'circle' ? "当前：圆形 (点击切换)" : "当前：矩形 (点击切换)"}
             >
                {defaultShape === 'circle' ? <Circle size={20} /> : <Square size={20} />}
             </button>
         </div>

         {/* Undo/Redo Group */}
         <div className="flex items-center gap-1 pr-2 border-r border-slate-100 mr-2">
             <button
               className={`p-3 rounded-xl transition-all ${past.length > 0 ? 'text-slate-600 hover:bg-slate-50' : 'text-slate-300 cursor-not-allowed'}`}
               onClick={handleUndo}
               title="撤销 (Ctrl+Z)"
               disabled={past.length === 0}
             >
                <Undo2 size={20} />
             </button>
             <button
               className={`p-3 rounded-xl transition-all ${future.length > 0 ? 'text-slate-600 hover:bg-slate-50' : 'text-slate-300 cursor-not-allowed'}`}
               onClick={handleRedo}
               title="重做 (Ctrl+Y)"
               disabled={future.length === 0}
             >
                <Redo2 size={20} />
             </button>
         </div>

         {/* Freeze Toggle */}
         <button
           className={`p-3 rounded-xl transition-all ${!isFloating ? 'bg-teal-50 text-teal-600 shadow-sm ring-1 ring-teal-200' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
           onClick={() => setIsFloating(!isFloating)}
           title={!isFloating ? "已冻结 (点击解冻)" : "已悬浮 (点击冻结)"}
         >
            <Snowflake size={20} />
         </button>

         {/* Physics Settings - Always visible now */}
         <button
           className={`p-3 rounded-xl transition-all ${showPhysicsSettings ? 'bg-slate-100 text-slate-700' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
           onClick={() => setShowPhysicsSettings(!showPhysicsSettings)}
           title="物理参数设置"
         >
            <Settings2 size={20} />
         </button>

         <div className="w-px h-8 bg-slate-100 mx-1" />

         <button
           className={`p-3 rounded-xl transition-all ${hasMagnet ? 'bg-amber-100 text-amber-600 shadow-sm ring-2 ring-amber-200 ring-offset-1' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
           onClick={handleMagnetClick}
           title={hasMagnet ? "定位并吸引想法" : "在中心生成磁铁"}
         >
            <Magnet size={20} className={hasMagnet ? "" : ""}/>
         </button>
         
         <button
           className={`p-3 rounded-xl transition-all ${ioModalOpen ? 'bg-slate-100 text-teal-600' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
           onClick={handleOpenExport}
           title="导出/导入 Mermaid 代码"
         >
           <Code size={20}/>
         </button>

         <div className="w-px h-8 bg-slate-100 mx-1" />

         {/* Help Button with Hover Hints */}
         <div 
            className="relative"
            onMouseEnter={() => setIsHelpHovered(true)}
            onMouseLeave={() => setIsHelpHovered(false)}
         >
             {isHelpHovered && !showHelp && (
                 <div className="absolute bottom-full right-0 mb-4 w-72 bg-white/95 backdrop-blur shadow-xl border border-slate-200 rounded-2xl p-5 pointer-events-none animate-in origin-bottom-right">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 border border-teal-100">
                                <MousePointer2 size={16}/>
                             </div>
                             <div>
                                 <div className="text-sm font-bold text-slate-700">左键拖拽</div>
                                 <div className="text-xs text-slate-400">移动气泡位置</div>
                             </div>
                        </div>
                        <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 border border-teal-100">
                                <Move size={16}/>
                             </div>
                             <div>
                                 <div className="text-sm font-bold text-slate-700">右键拖拽</div>
                                 <div className="text-xs text-slate-400">从气泡拖出连线 / 空白处新建</div>
                             </div>
                        </div>
                        <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 border border-teal-100">
                                <Plus size={16}/>
                             </div>
                             <div>
                                 <div className="text-sm font-bold text-slate-700">空白处右键</div>
                                 <div className="text-xs text-slate-400">直接创建新气泡</div>
                             </div>
                        </div>
                         <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 border border-teal-100">
                                <Mouse size={16}/>
                             </div>
                             <div>
                                 <div className="text-sm font-bold text-slate-700">中键按住</div>
                                 <div className="text-xs text-slate-400">平移整张画布</div>
                             </div>
                        </div>
                    </div>
                 </div>
             )}
             <button
                className="p-3 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all"
                onClick={() => setShowHelp(true)}
                title="帮助与详情"
             >
                <HelpCircle size={20} />
             </button>
         </div>
      </div>
      
      {selectionBox && (
        <div 
          className="absolute border-2 border-teal-500 bg-teal-500/10 pointer-events-none z-50"
          style={{ 
            left: selectionBox.x, 
            top: selectionBox.y, 
            width: selectionBox.w, 
            height: selectionBox.h 
          }}
        />
      )}

      {gestureFeedback && (
        <div 
            className="fixed pointer-events-none z-50 px-3 py-1.5 rounded-full bg-slate-800 text-white text-xs font-medium shadow-lg flex items-center gap-2 transform -translate-x-1/2 -translate-y-8"
            style={{ left: gestureFeedback.x, top: gestureFeedback.y }}
        >
            {gestureFeedback.type === 'create' && <Plus size={14}/>}
            {gestureFeedback.type === 'link' && <LinkIcon size={14}/>}
            {gestureFeedback.type === 'unlink' && <Unlink size={14}/>}
            {gestureFeedback.text}
        </div>
      )}

      {/* NEW TRASH DESIGN: Corner Gradient Region */}
      {(isDraggingNodes || dragRef.current.mode === 'move_nodes') && (
        <div 
            ref={trashRef}
            className={`fixed bottom-0 right-0 z-0 transition-all duration-300 pointer-events-none rounded-tl-full
              ${isOverTrash ? 'opacity-100' : 'opacity-30'}
            `}
            style={{ 
              width: '400px', 
              height: '400px',
              background: `radial-gradient(circle at 100% 100%, ${isOverTrash ? '#fecaca' : '#cbd5e1'} 0%, transparent 60%)`
            }}
        >
            <div className={`absolute bottom-12 right-12 transition-all duration-300 flex flex-col items-center gap-2 ${isOverTrash ? 'scale-125 text-red-500' : 'scale-100 text-slate-400'}`}>
              <Trash2 size={40} strokeWidth={isOverTrash ? 2 : 1.5} className={isOverTrash ? 'animate-bounce' : ''}/>
              <span className={`text-xs font-medium tracking-widest uppercase transition-opacity ${isOverTrash ? 'opacity-100' : 'opacity-0'}`}>
                  释放删除
              </span>
            </div>
        </div>
      )}
      
      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
            <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={() => setShowHelp(false)} />
            <div className="help-modal relative bg-white rounded-2xl shadow-2xl border border-slate-100 p-8 w-[420px] animate-in overflow-hidden" style={{ transformOrigin: 'center' }}>
                <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-teal-50 text-teal-600 rounded-lg">
                            <Wind size={20}/>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">MindBubbles</h2>
                            <p className="text-xs text-slate-400">思绪气泡 - 让想法自然生长</p>
                        </div>
                    </div>
                    <button onClick={() => setShowHelp(false)} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-50 rounded-full transition-colors"><X size={20}/></button>
                </div>

                <div className="space-y-6">
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                            <MousePointer2 size={14} className="text-teal-500"/> 基础交互
                        </h3>
                        <div className="space-y-2.5">
                            <div className="flex gap-3 text-sm text-slate-600">
                                <span className="shrink-0 w-12 font-medium text-slate-400 text-xs mt-0.5">左键</span>
                                <span>点击选中，拖拽移动气泡。</span>
                            </div>
                            <div className="flex gap-3 text-sm text-slate-600">
                                <span className="shrink-0 w-12 font-medium text-slate-400 text-xs mt-0.5">右键</span>
                                <span>空白处新建 / 拖拽连线 / 右键气泡菜单。</span>
                            </div>
                            <div className="flex gap-3 text-sm text-slate-600">
                                <span className="shrink-0 w-12 font-medium text-slate-400 text-xs mt-0.5">多选</span>
                                <span>按住 Ctrl/Meta 键点击或框选气泡。</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                            <Settings2 size={14} className="text-teal-500"/> 实用功能
                        </h3>
                        <div className="space-y-2.5">
                            <div className="flex gap-3 text-sm text-slate-600">
                                <span className="shrink-0 w-12 font-medium text-slate-400 text-xs mt-0.5">固定</span>
                                <span>右键气泡选择“固定位置”，防止其被物理力推走。</span>
                            </div>
                            <div className="flex gap-3 text-sm text-slate-600">
                                <span className="shrink-0 w-12 font-medium text-slate-400 text-xs mt-0.5">冻结</span>
                                <span>点击 <Snowflake size={12} className="inline text-teal-500 align-text-top"/> 暂停所有物理效果。</span>
                            </div>
                            <div className="flex gap-3 text-sm text-slate-600">
                                <span className="shrink-0 w-12 font-medium text-slate-400 text-xs mt-0.5">磁铁</span>
                                <span>点击 <Magnet size={12} className="inline text-amber-500 align-text-top"/> 收集孤立气泡。</span>
                            </div>
                            <div className="flex gap-3 text-sm text-slate-600">
                                <span className="shrink-0 w-12 font-medium text-slate-400 text-xs mt-0.5">导出</span>
                                <span>点击 <Code size={12} className="inline text-slate-400 align-text-top"/> 导出 Mermaid 代码或 PNG 图片。</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* IO Modal */}
      {ioModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
            <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => setIoModalOpen(false)} />
            <div className="io-modal relative bg-white rounded-xl shadow-2xl border border-slate-200 w-[500px] animate-in flex flex-col overflow-hidden" style={{ transformOrigin: 'center' }}>
                <div className="flex border-b border-slate-100">
                    <button 
                        onClick={() => { setIoMode('export'); handleOpenExport(); }}
                        className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${ioMode === 'export' ? 'text-teal-600 bg-teal-50/50 border-b-2 border-teal-600' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        <Download size={16}/> 导出 Mermaid
                    </button>
                    <button 
                        onClick={() => { setIoMode('import'); setIoText(''); }}
                        className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${ioMode === 'import' ? 'text-teal-600 bg-teal-50/50 border-b-2 border-teal-600' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        <Upload size={16}/> 导入 Mermaid
                    </button>
                    <button onClick={() => setIoModalOpen(false)} className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-full">
                        <X size={18}/>
                    </button>
                </div>
                
                <div className="p-5 flex-1 flex flex-col gap-4">
                    {ioMode === 'export' && (
                        <button 
                            onClick={handleExportImage}
                            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 mb-2"
                        >
                            <ImageIcon size={16}/> 导出为图片 (PNG)
                        </button>
                    )}

                    <div className="relative flex-1">
                        <textarea
                            value={ioText}
                            onChange={(e) => setIoText(e.target.value)}
                            readOnly={ioMode === 'export'}
                            placeholder={ioMode === 'import' ? "粘贴 Mermaid 流程图代码...\n例如：\nA[想法] --> B((灵感))" : ""}
                            className="w-full h-64 bg-slate-50 border border-slate-200 rounded-lg p-4 font-mono text-xs text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none resize-none"
                            spellCheck={false}
                        />
                        {ioMode === 'export' && (
                             <button 
                                onClick={handleCopyCode}
                                className="absolute top-3 right-3 p-2 bg-white border border-slate-200 rounded-md shadow-sm hover:bg-slate-50 text-slate-600 transition-all active:scale-95"
                                title="复制"
                             >
                                 {copySuccess ? <Check size={16} className="text-green-500"/> : <Copy size={16}/>}
                             </button>
                        )}
                    </div>

                    {ioMode === 'import' ? (
                        <button 
                            onClick={handleImportMermaid}
                            className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-sm shadow-teal-200"
                        >
                            <Upload size={16}/> 导入并生成脑图
                        </button>
                    ) : (
                         <div className="text-xs text-slate-400 text-center">
                            复制上方代码，可在 Notion 或 GitHub 中直接展示流程图。
                         </div>
                    )}
                </div>
            </div>
        </div>
      )}

      {contextMenu && (
        <>
        <div className="fixed inset-0 z-40" onMouseDown={() => setContextMenu(null)} />
        <div 
          className="absolute bg-white shadow-xl border border-slate-100 rounded-xl py-1.5 min-w-[170px] z-50 animate-in overflow-hidden"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onMouseDown={(e) => e.stopPropagation()} 
        >
           <button 
             className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 text-slate-700 flex items-center gap-3 transition-colors"
             onClick={() => {
               if (contextMenu.nodeId) toggleShape(contextMenu.nodeId);
             }}
           >
             {nodes.find(n => n.id === contextMenu.nodeId)?.shape === 'circle' ? <Square size={16} className="text-teal-500"/> : <Circle size={16} className="text-teal-500"/>}
             切换形状
           </button>
           <div className="h-px bg-slate-50 mx-2 my-0.5"/>
           <button 
             className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 text-slate-700 flex items-center gap-3 transition-colors"
             onClick={() => {
               if (contextMenu.nodeId) {
                  const targetIds = selectedNodeIds.has(contextMenu.nodeId) ? selectedNodeIds : new Set([contextMenu.nodeId]);
                  const isAnyUnpinned = nodes.some(n => targetIds.has(n.id) && !n.pinned);
                  saveHistory();
                  setNodes(prev => prev.map(n => targetIds.has(n.id) ? { ...n, pinned: isAnyUnpinned } : n));
                  setContextMenu(null);
               }
             }}
           >
             {(() => {
                 const targetIds = (contextMenu.nodeId && selectedNodeIds.has(contextMenu.nodeId)) ? selectedNodeIds : new Set([contextMenu.nodeId!]);
                 const isAnyUnpinned = nodes.some(n => targetIds.has(n.id) && !n.pinned);
                 return isAnyUnpinned ? <Pin size={16} className="text-slate-400"/> : <PinOff size={16} className="text-slate-400"/>;
             })()}
             {(() => {
                 const targetIds = (contextMenu.nodeId && selectedNodeIds.has(contextMenu.nodeId)) ? selectedNodeIds : new Set([contextMenu.nodeId!]);
                 const isAnyUnpinned = nodes.some(n => targetIds.has(n.id) && !n.pinned);
                 return isAnyUnpinned ? "固定位置" : "解除固定";
             })()}
           </button>
           <div className="h-px bg-slate-50 mx-2 my-0.5"/>
           <button 
             className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 text-slate-700 flex items-center gap-3 transition-colors"
             onClick={() => {
                if (contextMenu.nodeId) {
                  const targetIds = selectedNodeIds.has(contextMenu.nodeId) ? selectedNodeIds : new Set([contextMenu.nodeId]);
                  saveHistory();
                  setEdges(prev => prev.filter(e => !targetIds.has(e.source) && !targetIds.has(e.target)));
                }
                setContextMenu(null);
             }}
           >
             <Unlink size={16} className="text-slate-400"/> 
             断开所有连接
           </button>
           <div className="h-px bg-slate-50 mx-2 my-0.5"/>
           <button 
             className="w-full text-left px-4 py-2.5 text-sm hover:bg-red-50 text-red-600 flex items-center gap-3 font-medium transition-colors"
             onClick={() => {
               if (contextMenu.nodeId) {
                   const targetIds = selectedNodeIds.has(contextMenu.nodeId) ? selectedNodeIds : new Set([contextMenu.nodeId]);
                   deleteNodes(targetIds);
               }
               setContextMenu(null);
             }}
           >
             <Trash2 size={16}/> 
             删除气泡
           </button>
        </div>
        </>
      )}
    </div>
  );
};

export default App;