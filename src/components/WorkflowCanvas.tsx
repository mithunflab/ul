import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize, 
  Grid3X3,
  Move,
  MousePointer,
  Hand
} from 'lucide-react';

interface Node {
  id: string;
  name: string;
  type: string;
  position: { x: number; y: number };
  status: 'idle' | 'running' | 'success' | 'error';
  icon: string;
  color: string;
  description?: string;
}

interface Connection {
  from: string;
  to: string;
  fromHandle?: string;
  toHandle?: string;
}

interface WorkflowCanvasProps {
  nodes: Node[];
  connections: Connection[];
  onNodeClick?: (node: Node) => void;
  onNodeDrag?: (nodeId: string, position: { x: number; y: number }) => void;
}

const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  nodes,
  connections,
  onNodeClick,
  onNodeDrag
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [tool, setTool] = useState<'select' | 'pan'>('select');

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.1, Math.min(3, prev * delta)));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (tool === 'pan') {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [tool, pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && tool === 'pan') {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  }, [isDragging, tool, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDraggedNode(null);
  }, []);

  const handleNodeMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    if (tool === 'select') {
      setDraggedNode(nodeId);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  }, [tool]);

  const handleNodeMouseMove = useCallback((e: React.MouseEvent, nodeId: string) => {
    if (draggedNode === nodeId && tool === 'select') {
      const deltaX = (e.clientX - dragStart.x) / zoom;
      const deltaY = (e.clientY - dragStart.y) / zoom;
      
      const node = nodes.find(n => n.id === nodeId);
      if (node && onNodeDrag) {
        onNodeDrag(nodeId, {
          x: node.position.x + deltaX,
          y: node.position.y + deltaY
        });
      }
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  }, [draggedNode, tool, dragStart, zoom, nodes, onNodeDrag]);

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const fitToScreen = () => {
    if (nodes.length === 0) return;
    
    const bounds = nodes.reduce((acc, node) => ({
      minX: Math.min(acc.minX, node.position.x),
      maxX: Math.max(acc.maxX, node.position.x + 200),
      minY: Math.min(acc.minY, node.position.y),
      maxY: Math.max(acc.maxY, node.position.y + 80)
    }), { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity });

    const canvas = canvasRef.current;
    if (!canvas) return;

    const padding = 100;
    const width = bounds.maxX - bounds.minX + padding * 2;
    const height = bounds.maxY - bounds.minY + padding * 2;
    
    const scaleX = canvas.clientWidth / width;
    const scaleY = canvas.clientHeight / height;
    const scale = Math.min(scaleX, scaleY, 1);
    
    setZoom(scale);
    setPan({
      x: (canvas.clientWidth - width * scale) / 2 - bounds.minX * scale + padding * scale,
      y: (canvas.clientHeight - height * scale) / 2 - bounds.minY * scale + padding * scale
    });
  };

  const getIconComponent = (iconName: string) => {
    // This would normally import the actual icons
    return <div className="w-6 h-6 bg-white/20 rounded"></div>;
  };

  return (
    <div className="relative w-full h-full bg-slate-900 overflow-hidden">
      {/* Toolbar */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-slate-800/90 backdrop-blur-sm border border-slate-700/50 rounded-xl p-2">
        <button
          onClick={() => setTool('select')}
          className={`p-2 rounded-lg transition-colors ${
            tool === 'select' 
              ? 'bg-indigo-600 text-white' 
              : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
          }`}
          title="Select Tool"
        >
          <MousePointer className="w-4 h-4" />
        </button>
        <button
          onClick={() => setTool('pan')}
          className={`p-2 rounded-lg transition-colors ${
            tool === 'pan' 
              ? 'bg-indigo-600 text-white' 
              : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
          }`}
          title="Pan Tool"
        >
          <Hand className="w-4 h-4" />
        </button>
        <div className="w-px h-6 bg-slate-600"></div>
        <button
          onClick={() => setZoom(prev => Math.min(3, prev * 1.2))}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom(prev => Math.max(0.1, prev * 0.8))}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={resetView}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
          title="Reset View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={fitToScreen}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
          title="Fit to Screen"
        >
          <Maximize className="w-4 h-4" />
        </button>
      </div>

      {/* Zoom Level Indicator */}
      <div className="absolute top-4 right-4 z-20 bg-slate-800/90 backdrop-blur-sm border border-slate-700/50 rounded-xl px-3 py-2">
        <span className="text-slate-300 text-sm font-medium">
          {Math.round(zoom * 100)}%
        </span>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className={`w-full h-full relative ${tool === 'pan' ? 'cursor-grab' : 'cursor-default'} ${isDragging ? 'cursor-grabbing' : ''}`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Grid Background */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(148, 163, 184, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(148, 163, 184, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
            backgroundPosition: `${pan.x}px ${pan.y}px`
          }}
        />

        {/* Workflow Content */}
        <div
          className="absolute inset-0"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0'
          }}
        >
          {/* Connection Lines */}
          <svg className="absolute inset-0 pointer-events-none" style={{ overflow: 'visible' }}>
            <defs>
              <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.8" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            {connections.map((connection, index) => {
              const fromNode = nodes.find(n => n.id === connection.from);
              const toNode = nodes.find(n => n.id === connection.to);
              
              if (!fromNode || !toNode) return null;
              
              const fromX = fromNode.position.x + 200; // Node width
              const fromY = fromNode.position.y + 40; // Node height / 2
              const toX = toNode.position.x;
              const toY = toNode.position.y + 40;
              
              // Create curved path
              const midX = (fromX + toX) / 2;
              const pathData = `M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`;
              
              return (
                <g key={`${connection.from}-${connection.to}`}>
                  <path
                    d={pathData}
                    stroke="url(#connectionGradient)"
                    strokeWidth="3"
                    fill="none"
                    filter="url(#glow)"
                    className="transition-all duration-300"
                  />
                  {/* Animated flow dots */}
                  <circle r="4" fill="#6366f1" className="opacity-80">
                    <animateMotion dur="3s" repeatCount="indefinite" path={pathData} />
                  </circle>
                  {/* Arrow */}
                  <polygon
                    points={`${toX-12},${toY-6} ${toX},${toY} ${toX-12},${toY+6}`}
                    fill="#8b5cf6"
                    className="opacity-80"
                  />
                </g>
              );
            })}
          </svg>

          {/* Nodes */}
          {nodes.map((node) => (
            <div
              key={node.id}
              className={`absolute group transition-all duration-200 ${
                tool === 'select' ? 'cursor-move' : 'cursor-pointer'
              } hover:z-10`}
              style={{
                left: node.position.x,
                top: node.position.y,
                transform: draggedNode === node.id ? 'scale(1.05)' : 'scale(1)'
              }}
              onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
              onMouseMove={(e) => handleNodeMouseMove(e, node.id)}
              onClick={() => onNodeClick?.(node)}
            >
              {/* Node Container */}
              <div className={`${node.color} text-white rounded-2xl shadow-xl border-2 border-white/20 min-w-[200px] backdrop-blur-sm transition-all duration-200 group-hover:scale-105 group-hover:shadow-2xl`}>
                {/* Node Header */}
                <div className="p-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      {getIconComponent(node.icon)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-lg truncate">{node.name}</h4>
                      <p className="text-white/80 text-sm capitalize">{node.type}</p>
                    </div>
                    {/* Status Indicator */}
                    <div className={`w-3 h-3 rounded-full ${
                      node.status === 'success' ? 'bg-emerald-400' :
                      node.status === 'error' ? 'bg-red-400' :
                      node.status === 'running' ? 'bg-yellow-400 animate-pulse' :
                      'bg-slate-400'
                    }`}></div>
                  </div>
                </div>

                {/* Node Content */}
                <div className="p-4">
                  {node.description && (
                    <p className="text-white/70 text-sm mb-3">{node.description}</p>
                  )}
                  
                  {/* Connection Points */}
                  <div className="flex justify-between items-center">
                    <div className="text-white/60 text-xs">
                      Status: <span className="capitalize text-white/80">{node.status}</span>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-white/40 rounded-full"></div>
                      <div className="w-2 h-2 bg-white/40 rounded-full"></div>
                    </div>
                  </div>
                </div>

                {/* Connection Handles */}
                <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-slate-600 border-2 border-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-slate-600 border-2 border-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>

              {/* Node Selection Indicator */}
              {draggedNode === node.id && (
                <div className="absolute inset-0 border-2 border-indigo-400 rounded-2xl pointer-events-none animate-pulse"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mini Map */}
      <div className="absolute bottom-4 right-4 w-48 h-32 bg-slate-800/90 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="w-full h-full relative">
          <div className="absolute inset-0 bg-slate-900/50"></div>
          {/* Mini nodes */}
          {nodes.map((node) => (
            <div
              key={`mini-${node.id}`}
              className={`absolute w-3 h-2 ${node.color} rounded-sm opacity-80`}
              style={{
                left: (node.position.x / 10) + 'px',
                top: (node.position.y / 10) + 'px'
              }}
            ></div>
          ))}
          {/* Viewport indicator */}
          <div 
            className="absolute border border-indigo-400 bg-indigo-400/10"
            style={{
              left: Math.max(0, -pan.x / 10) + 'px',
              top: Math.max(0, -pan.y / 10) + 'px',
              width: Math.min(192, 192 / zoom) + 'px',
              height: Math.min(128, 128 / zoom) + 'px'
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowCanvas;