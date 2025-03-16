// src/components/documentation/workflows/ProcessDiagram.tsx

import {
  ArrowRight,
  ChevronsDown,
  ChevronsUp,
  CircleAlert,
  CircleCheck,
  CircleX,
  ExternalLink,
  Hexagon,
  Link as LinkIcon,
  Play,
  Square,
} from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

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

// Add CSS styles as a string - this will be added to the style element
const customStyles = `
  .shape-document {
    position: relative;
    clip-path: polygon(0% 0%, 100% 0%, 100% 80%, 80% 100%, 0% 100%);
  }

  .shape-data {
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

  // Get node shape and styling based on type and status
  const getNodeDisplay = (node: ProcessNode) => {
    // Base styling for all nodes
    let baseClasses =
      'h-12 flex items-center justify-center text-white rounded';
    let baseShapeClasses = 'w-10 h-10 flex items-center justify-center';
    let bgColor = 'bg-gray-400';
    let statusIcon = null;

    // Node type styling
    switch (node.type) {
      case 'start':
        baseShapeClasses += ' rounded-full';
        bgColor = 'bg-green-500';
        break;
      case 'end':
        baseShapeClasses += ' rounded-full';
        bgColor = 'bg-red-500';
        break;
      case 'process':
        baseShapeClasses += ' rounded-md';
        bgColor = 'bg-blue-500';
        break;
      case 'decision':
        baseShapeClasses += ' transform rotate-45';
        bgColor = 'bg-amber-500';
        break;
      case 'document':
        baseShapeClasses += ' rounded-md shape-document';
        bgColor = 'bg-purple-500';
        break;
      case 'data':
        baseShapeClasses += ' shape-data';
        bgColor = 'bg-indigo-500';
        break;
      case 'subprocess':
        baseShapeClasses += ' rounded-md border-2 border-dashed';
        bgColor = 'bg-teal-500';
        break;
      default:
        baseShapeClasses += ' rounded-md';
    }

    // Override styling if node is highlighted
    if (highlightNodeId === node.id) {
      bgColor = bgColor.replace('500', '600');
      baseClasses += ' ring-2 ring-offset-2 ring-amber-500';
    }

    // Node status styling and icons
    switch (node.status) {
      case 'complete':
        statusIcon = (
          <CircleCheck
            className='absolute -top-1 -right-1 text-green-500 bg-white rounded-full'
            size={16}
          />
        );
        break;
      case 'error':
        statusIcon = (
          <CircleX
            className='absolute -top-1 -right-1 text-red-500 bg-white rounded-full'
            size={16}
          />
        );
        break;
      case 'warning':
        statusIcon = (
          <CircleAlert
            className='absolute -top-1 -right-1 text-amber-500 bg-white rounded-full'
            size={16}
          />
        );
        break;
      case 'current':
        baseClasses += ' ring-2 ring-offset-2 ring-amber-500';
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
        case 'decision':
          return <Hexagon size={18} className='transform -rotate-45' />;
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

        <div className='ml-4 flex-1'>
          <div className='font-medium'>
            {node.label}
            {node.link && (
              <span className='ml-2 text-amber-600'>
                <LinkIcon size={16} className='inline' />
              </span>
            )}
          </div>
          {node.description && (
            <div className='text-sm text-gray-600'>{node.description}</div>
          )}
          {node.link && interactive && (
            <div className='text-xs text-amber-600 hover:text-amber-800 flex items-center mt-1'>
              <ExternalLink size={12} className='mr-1' />
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
    let icon = <ArrowRight size={12} className='mr-1' />;

    if (edge.type === 'conditional') {
      classes = 'px-2 py-1 bg-amber-100 text-xs rounded text-amber-700';
      icon = <ChevronsDown size={12} className='mr-1' />;
    } else if (edge.type === 'default') {
      classes = 'px-2 py-1 bg-blue-100 text-xs rounded text-blue-700';
      icon = <ChevronsUp size={12} className='mr-1' />;
    }

    return (
      <span className={classes}>
        {icon}
        {edge.label || `${edge.from} → ${edge.to}`}
      </span>
    );
  };

  return (
    <div
      className={`process-diagram p-4 border rounded-lg bg-white ${className}`}
    >
      <h3 className='text-lg font-medium mb-4'>{title}</h3>

      <div className='overflow-x-auto'>
        <div className='min-w-max'>
          {/* Nodes section */}
          <div className='flex flex-col space-y-2 mb-8'>
            {nodes.map((node) => renderNode(node))}
          </div>

          {/* Edges section */}
          <div className='mt-6 border-t pt-4'>
            <h4 className='font-medium mb-2'>Process Flow</h4>
            <div className='space-y-2'>
              {edges.map((edge, index) => (
                <div
                  key={`${edge.from}-${edge.to}-${index}`}
                  className='text-sm flex items-center'
                >
                  <span className='font-medium mr-2'>{edge.from}</span>
                  <ArrowRight size={16} className='mr-2 text-gray-400' />
                  <span className='font-medium mr-3'>{edge.to}</span>
                  {edge.label && renderEdgeLabel(edge)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add styles as a regular style element without jsx prop */}
      <style>{customStyles}</style>
    </div>
  );
};

export default ProcessDiagram;
