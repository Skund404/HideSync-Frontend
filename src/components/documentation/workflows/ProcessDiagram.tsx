// src/components/documentation/workflows/ProcessDiagram.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  ChevronsDown, 
  ChevronsUp, 
  Circle, 
  CircleAlert, 
  CircleCheck, 
  CircleX, 
  Diamond, 
  ExternalLink, 
  Hexagon, 
  Link as LinkIcon, 
  Play, 
  RotateCw, 
  Square, 
  ZoomIn, 
  ZoomOut,
  Download
} from 'lucide-react';

export interface ProcessNode {
  id: string;
  type:
    | 'start'
    | 'end'
    | 'process'
    | 'decision'
    | 'document'
    | 'data'
    | 'subprocess';
  label: string;
  description?: string;
  link?: string;
  status?: 'complete' | 'error' | 'warning' | 'current' | 'pending';
}

export interface ProcessEdge {
  from: string;
  to: string;
  label?: string;
  type?: 'normal' | 'conditional' | 'default';
}

interface ProcessDiagramProps {
  title: string;
  nodes: ProcessNode[];
  edges: ProcessEdge[];
  className?: string;
  interactive?: boolean;
  highlightNodeId?: string;
}

// Custom CSS styles for shape rendering
const customStyles = `
  .process-diagram .shape-document {
    position: relative;
    clip-path: polygon(0% 0%, 100% 0%, 100% 80%, 80% 100%, 0% 100%);
  }

  .process-diagram .shape-data {
    position: relative;
    clip-path: polygon(
      10% 0%,
      90% 0%,
      100% 50%,
      90% 100%,
      10% 100%,
      0% 50%
    );
  }

  @media print {
    .process-diagram .no-print {
      display: none;
    }
    
    .process-diagram .node-link {
      color: black !important;
      text-decoration: none !important;
    }
  }
`;

const ProcessDiagram: React.FC<ProcessDiagramProps> = ({
  title,
  nodes,
  edges,
  className = '',
  interactive = true,
  highlightNodeId,
}) => {
  const navigate = useNavigate();
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Get node shape and styling based on type and status
  const getNodeDisplay = (node: ProcessNode) => {
    // Base styling for all nodes
    let baseClasses = "h-12 flex items-center justify-center text-white rounded";
    let baseShapeClasses = "w-10 h-10 flex items-center justify-center";
    let bgColor = "bg-gray-400";
    let statusIcon = null;

    // Node type styling
    switch (node.type) {
      case 'start':
        baseShapeClasses += " rounded-full";
        bgColor = "bg-green-500";
        break;
      case 'end':
        baseShapeClasses += " rounded-full";
        bgColor = "bg-red-500";
        break;
      case 'process':
        baseShapeClasses += " rounded-md";
        bgColor = "bg-blue-500";
        break;
      case 'decision':
        baseShapeClasses += " transform rotate-45";
        bgColor = "bg-amber-500";
        break;
      case 'document':
        baseShapeClasses += " rounded-md shape-document";
        bgColor = "bg-purple-500";
        break;
      case 'data':
        baseShapeClasses += " shape-data";
        bgColor = "bg-indigo-500";
        break;
      case 'subprocess':
        baseShapeClasses += " rounded-md border-2 border-dashed";
        bgColor = "bg-teal-500";
        break;
      default:
        baseShapeClasses += " rounded-md";
    }

    // Override styling if node is highlighted
    if (highlightNodeId === node.id) {
      bgColor = bgColor.replace('500', '600');
      baseClasses += " ring-2 ring-offset-2 ring-amber-500";
    }

    // Node status styling and icons
    switch (node.status) {
      case 'complete':
        statusIcon = (
          <CircleCheck
            className="absolute -top-1 -right-1 text-green-500 bg-white rounded-full"
            size={16}
          />
        );
        break;
      case 'error':
        statusIcon = (
          <CircleX
            className="absolute -top-1 -right-1 text-red-500 bg-white rounded-full"
            size={16}
          />
        );
        break;
      case 'warning':
        statusIcon = (
          <CircleAlert
            className="absolute -top-1 -right-1 text-amber-500 bg-white rounded-full"
            size={16}
          />
        );
        break;
      case 'current':
        baseClasses += " ring-2 ring-offset-2 ring-amber-500";
        bgColor = bgColor.replace('500', '600');
        break;
      case 'pending':
        bgColor = bgColor.replace('500', '300');
        break;
    }

    // Get shape icon based on node type
    const getShapeIcon = () => {
      switch (node.type) {
        case 'start':
          return <Play size={18} />;
        case 'end':
          return <Square size={18} />;
        case 'process':
          return <Circle size={18} />;
        case 'decision':
          return <Diamond size={18} className="transform -rotate-45" />;
        case 'document':
          return null;
        case 'data':
          return <Hexagon size={18} />;
        case 'subprocess':
          return <Square size={18} />;
        default:
          return null;
      }
    };

    return (
      <div className={baseClasses}>
        <div className={`${baseShapeClasses} ${bgColor} relative`}>
          {getShapeIcon()}
          {statusIcon}
        </div>
      </div>
    );
  };

  // Render a node with its information
  const renderNode = (node: ProcessNode) => {
    const handleNodeClick = () => {
      if (interactive && node.link) {
        navigate(node.link);
      }
    };

    return (
      <div
        key={node.id}
        className={`flex items-center mb-8 ${
          interactive && node.link
            ? 'cursor-pointer hover:bg-gray-50 p-2 -ml-2 rounded-lg transition-colors'
            : ''
        }`}
        onClick={interactive && node.link ? handleNodeClick : undefined}
      >
        {getNodeDisplay(node)}

        <div className="ml-4 flex-1">
          <div className="font-medium">
            {node.label}
            {node.link && (
              <span className="ml-2 text-amber-600">
                <LinkIcon size={16} className="inline" />
              </span>
            )}
          </div>
          {node.description && (
            <div className="text-sm text-gray-600">{node.description}</div>
          )}
          {node.link && interactive && (
            <div className="text-xs text-amber-600 hover:text-amber-800 flex items-center mt-1 node-link">
              <ExternalLink size={12} className="mr-1" />
              View details
            </div>
          )}
        </div>
      </div>
    );
  };

  // Create an edge label
  const renderEdgeLabel = (edge: ProcessEdge) => {
    let classes = 'px-2 py-1 bg-gray-100 text-xs rounded text-gray-600';
    let icon = <ArrowRight size={12} className="mr-1" />;

    if (edge.type === 'conditional') {
      classes = 'px-2 py-1 bg-amber-100 text-xs rounded text-amber-700';
      icon = <ChevronsDown size={12} className="mr-1" />;
    } else if (edge.type === 'default') {
      classes = 'px-2 py-1 bg-blue-100 text-xs rounded text-blue-700';
      icon = <ChevronsUp size={12} className="mr-1" />;
    }

    return (
      <span className={classes}>
        {icon}
        {edge.label || `${edge.from} → ${edge.to}`}
      </span>
    );
  };

  // Handle zoom in
  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 0.1, 2));
  };

  // Handle zoom out
  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 0.1, 0.5));
  };

  // Handle rotation
  const handleRotate = () => {
    setRotation((rotation + 90) % 360);
  };

  // Handle download as SVG
  const handleDownload = () => {
    // Create a simplified SVG representation of the diagram
    // This is a basic implementation and might need enhancements for complex diagrams
    
    const width = 800;
    const height = 600;
    const nodeHeight = 40;
    const verticalSpacing = 80;
    
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
      <style>
        .node-circle { fill: #10B981; }
        .node-square { fill: #EF4444; }
        .node-rect { fill: #3B82F6; }
        .node-diamond { fill: #F59E0B; }
        .node-process-text { font-size: 12px; fill: white; text-anchor: middle; dominant-baseline: middle; }
        .node-label { font-size: 14px; fill: #111827; text-anchor: start; dominant-baseline: middle; }
        .edge-path { stroke: #9CA3AF; stroke-width: 2; fill: none; }
        .edge-label { font-size: 10px; fill: #4B5563; text-anchor: middle; }
      </style>`;
    
    // Draw nodes
    nodes.forEach((node, index) => {
      const y = 50 + index * verticalSpacing;
      const x = 100;
      
      // Shape based on node type
      switch (node.type) {
        case 'start':
          svg += `<circle cx="${x}" cy="${y}" r="20" class="node-circle" />`;
          svg += `<text x="${x}" y="${y}" class="node-process-text">Start</text>`;
          break;
        case 'end':
          svg += `<circle cx="${x}" cy="${y}" r="20" class="node-square" />`;
          svg += `<text x="${x}" y="${y}" class="node-process-text">End</text>`;
          break;
        case 'process':
          svg += `<rect x="${x-30}" y="${y-20}" width="60" height="${nodeHeight}" rx="4" class="node-rect" />`;
          svg += `<text x="${x}" y="${y}" class="node-process-text">Process</text>`;
          break;
        case 'decision':
          svg += `<polygon points="${x},${y-20} ${x+30},${y} ${x},${y+20} ${x-30},${y}" class="node-diamond" />`;
          break;
        default:
          svg += `<rect x="${x-30}" y="${y-20}" width="60" height="${nodeHeight}" rx="4" class="node-rect" />`;
      }
      
      // Label
      svg += `<text x="${x + 50}" y="${y}" class="node-label">${node.label}</text>`;
    });
    
    // Draw edges
    edges.forEach((edge) => {
      const fromNode = nodes.findIndex(n => n.id === edge.from);
      const toNode = nodes.findIndex(n => n.id === edge.to);
      
      if (fromNode !== -1 && toNode !== -1) {
        const y1 = 50 + fromNode * verticalSpacing;
        const y2 = 50 + toNode * verticalSpacing;
        const x = 100;
        
        // Draw line connecting nodes
        svg += `<path d="M ${x+40} ${y1} C ${x+150} ${y1}, ${x+150} ${y2}, ${x+40} ${y2}" class="edge-path" marker-end="url(#arrow)" />`;
        
        // Add edge label if present
        if (edge.label) {
          const midY = (y1 + y2) / 2;
          svg += `<text x="${x+150}" y="${midY-10}" class="edge-label">${edge.label}</text>`;
        }
      }
    });
    
    // Add arrow marker definition
    svg += `<defs>
      <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5"
          markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#9CA3AF"/>
      </marker>
    </defs>`;
    
    svg += '</svg>';
    
    // Create a download link
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/\s+/g, '-').toLowerCase()}-diagram.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`process-diagram p-4 border rounded-lg bg-white ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">{title}</h3>
        
        {/* Controls - non-printable */}
        <div className="flex space-x-2 no-print">
          <button
            onClick={handleZoomIn}
            className="p-1 text-stone-600 hover:text-stone-800 hover:bg-stone-100 rounded"
            aria-label="Zoom in"
          >
            <ZoomIn size={18} />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-1 text-stone-600 hover:text-stone-800 hover:bg-stone-100 rounded"
            aria-label="Zoom out"
          >
            <ZoomOut size={18} />
          </button>
          <button
            onClick={handleRotate}
            className="p-1 text-stone-600 hover:text-stone-800 hover:bg-stone-100 rounded"
            aria-label="Rotate"
          >
            <RotateCw size={18} />
          </button>
          <button
            onClick={handleDownload}
            className="p-1 text-stone-600 hover:text-stone-800 hover:bg-stone-100 rounded"
            aria-label="Download as SVG"
          >
            <Download size={18} />
          </button>
        </div>
      </div>

      <div 
        className="overflow-auto"
        style={{ 
          transform: `scale(${zoom}) rotate(${rotation}deg)`,
          transformOrigin: 'top left',
          transition: 'transform 0.3s ease',
          marginBottom: zoom > 1 ? `${(zoom - 1) * 500}px` : '0', // Add space when zoomed
          marginRight: zoom > 1 ? `${(zoom - 1) * 500}px` : '0'    // Add space when zoomed
        }}
      >
        <div className="min-w-max">
          {/* Nodes section */}
          <div className="flex flex-col space-y-2 mb-8">
            {nodes.map((node) => renderNode(node))}
          </div>

          {/* Edges section */}
          <div className="mt-6 border-t pt-4">
            <h4 className="font-medium mb-2">Process Flow</h4>
            <div className="space-y-2">
              {edges.map((edge, index) => (
                <div
                  key={`${edge.from}-${edge.to}-${index}`}
                  className="text-sm flex items-center"
                >
                  <span className="font-medium mr-2">{edge.from}</span>
                  <ArrowRight size={16} className="mr-2 text-gray-400" />
                  <span className="font-medium mr-3">{edge.to}</span>
                  {edge.label && renderEdgeLabel(edge)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Apply custom styles */}
      <style>{customStyles}</style>
    </div>
  );
};

export default ProcessDiagram;