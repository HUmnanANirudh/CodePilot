import React, { useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  type NodeMouseHandler,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { ModuleDiagram, ModuleNode, ModuleEdge } from '@/types';

interface ArchitectureFlowProps {
  data: ModuleDiagram;
  onNodeSelect?: (node: ModuleNode | null) => void;
}

const layerColors: Record<string, string> = {
  'ui': '#6366f1',
  'core-service': '#f59e0b',
  'service': '#10b981',
  'domain': '#8b5cf6',
  'infrastructure': '#64748b',
  'utility': '#6b7280',
};

const ArchitectureFlow: React.FC<ArchitectureFlowProps> = ({ data, onNodeSelect }) => {
  const initialNodes = data.nodes.map((node: ModuleNode) => ({
    ...node,
    style: {
      background: layerColors[node.data?.layer] || 'hsl(var(--secondary))',
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      padding: '12px 16px',
      fontFamily: 'var(--font-hand)',
      fontWeight: 'bold',
      fontSize: '14px',
      boxShadow: '4px 4px 0px 0px rgba(0,0,0,0.3)',
      minWidth: '120px',
      textAlign: 'center' as const,
    },
  }));

  const initialEdges = data.edges.map((edge: ModuleEdge) => ({
    ...edge,
    animated: true,
    style: { stroke: 'hsl(var(--primary))', strokeWidth: 2, opacity: 0.6 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: 'hsl(var(--primary))',
    },
    label: edge.label,
    labelStyle: { fontFamily: 'var(--font-hand)', fontSize: '12px', fill: 'hsl(var(--muted-foreground))' },
    labelBgStyle: { fill: 'hsl(var(--background))', opacity: 0.8 },
  }));

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onNodeClick: NodeMouseHandler = useCallback((_event, node) => {
    if (onNodeSelect) {
      onNodeSelect(node as unknown as ModuleNode);
    }
  }, [onNodeSelect]);

  const onPaneClick = useCallback(() => {
    if (onNodeSelect) {
      onNodeSelect(null);
    }
  }, [onNodeSelect]);

  React.useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [data]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        fitView
        attributionPosition="bottom-right"
      >
        <MiniMap
          nodeColor={(node) => layerColors[node.data?.layer as string] || 'hsl(var(--secondary))'}
          nodeStrokeWidth={3}
          zoomable
          pannable
        />
        <Controls />
        <Background color="hsl(var(--muted-foreground))" gap={16} />
      </ReactFlow>
    </div>
  );
};

export default ArchitectureFlow;
