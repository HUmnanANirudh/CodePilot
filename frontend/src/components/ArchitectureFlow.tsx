import React from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { ModuleDiagram, ModuleNode, ModuleEdge } from '@/types';

interface ArchitectureFlowProps {
  data: ModuleDiagram;
}

const ArchitectureFlow: React.FC<ArchitectureFlowProps> = ({ data }) => {
  const initialNodes = data.nodes.map((node: ModuleNode) => ({
    ...node,
    style: {
      background: 'hsl(var(--card))',
      color: 'hsl(var(--foreground))',
      border: '2px solid hsl(var(--border))',
      borderRadius: '4px',
      padding: '10px',
      fontFamily: 'var(--font-hand)',
      fontWeight: 'bold',
      boxShadow: '4px 4px 0px 0px hsl(var(--border))',
    },
  }));

  const initialEdges = data.edges.map((edge: ModuleEdge) => ({
    ...edge,
    animated: true,
    style: { stroke: 'hsl(var(--primary))', strokeWidth: 2 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: 'hsl(var(--primary))',
    },
  }));

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update when data changes
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
        fitView
        attributionPosition="bottom-right"
      >
        <MiniMap 
          nodeColor={(node) => {
            if (node.type === 'input') return 'hsl(var(--primary))';
            if (node.type === 'output') return 'hsl(var(--destructive))';
            return 'hsl(var(--secondary))';
          }}
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
