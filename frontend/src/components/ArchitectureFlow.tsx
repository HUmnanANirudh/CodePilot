import React, { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  type NodeMouseHandler,
  ReactFlowProvider,
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

function FlowGraph({ data, onNodeSelect }: { data: ModuleDiagram; onNodeSelect?: (node: ModuleNode | null) => void }) {
  const initialNodes = useMemo(() => {
    if (!data.nodes || data.nodes.length === 0) return [];
    return data.nodes.map((node: ModuleNode) => ({
      ...node,
      id: node.id,
      position: node.position ?? { x: 0, y: 0 },
      style: {
        background: layerColors[node.data?.layer as string] || '#8b5cf6',
        color: '#ffffff',
        border: 'none',
        borderRadius: '10px',
        padding: '14px 18px',
        fontSize: '13px',
        fontWeight: 700,
        fontFamily: 'Georgia, serif',
        boxShadow: '5px 5px 0px rgba(0,0,0,0.35)',
        minWidth: 130,
        width: 'auto',
        height: 'auto',
        textAlign: 'center' as const,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
    }));
  }, [data.nodes]);

  const initialEdges = useMemo(() => {
    if (!data.edges) return [];
    return data.edges.map((edge: ModuleEdge) => ({
      ...edge,
      type: 'smoothstep',
      animated: true,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
        color: '#6366f1',
      },
      style: {
        stroke: '#6366f1',
        strokeWidth: 2,
        opacity: 0.55,
      },
    }));
  }, [data.edges]);

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
    if (initialNodes.length > 0) {
      setNodes(initialNodes);
      setEdges(initialEdges);
    }
  }, [data, initialNodes, initialEdges, setNodes, setEdges]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={onNodeClick}
      onPaneClick={onPaneClick}
      fitView
      fitViewOptions={{ padding: 0.15 }}
      minZoom={0.1}
      maxZoom={2}
      attributionPosition="bottom-right"
      proOptions={{ hideAttribution: true }}
    >
      <MiniMap
        nodeColor={(n) => layerColors[n.data?.layer as string] || '#8b5cf6'}
        maskColor="rgba(0,0,0,0.15)"
        style={{ background: 'hsl(var(--muted))' }}
        pannable
        zoomable
      />
      <Controls
        style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
      />
      <Background gap={20} color="hsl(var(--border))" />
    </ReactFlow>
  );
}

const ArchitectureFlow: React.FC<ArchitectureFlowProps> = (props) => {
  return (
    <ReactFlowProvider>
      <div style={{ width: '100%', height: '100%', minHeight: 500 }}>
        <FlowGraph {...props} />
      </div>
    </ReactFlowProvider>
  );
};

export default ArchitectureFlow;
