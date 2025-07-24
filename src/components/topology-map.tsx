import React, { useCallback, useEffect, useState } from 'react';
import {
  Background,
  ReactFlow,
  addEdge,
  ConnectionLineType,
  Panel,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import ELK from 'elkjs/lib/elk.bundled.js';

import '@xyflow/react/dist/style.css';
import { testScenarioGraph1 } from '@/features/scenarios/data/scenarios';

const initialNodes = testScenarioGraph1.nodes;
const initialEdges = testScenarioGraph1.edges;

const elk = new ELK();

const nodeWidth = 172;
const nodeHeight = 36;

// 使用 ELKjs 的异步布局函数
const getLayoutedElements = async (nodes, edges, direction = 'TB') => {
  const isHorizontal = direction === 'LR';
  const elkOptions = {
    'elk.algorithm': 'layered',
    'elk.direction': isHorizontal ? 'RIGHT' : 'DOWN',
    'elk.layered.spacing.nodeNodeBetweenLayers': '100',
    'elk.spacing.nodeNode': '80',
    'elk.insideSelfLoops.spacing': '20',
  };

  const graph = {
    id: 'root',
    layoutOptions: elkOptions,
    // 对于 group 节点，React Flow 通过 style 属性传递尺寸，我们需要将其映射到 ELK 的 width/height
    children: nodes.map((node) => ({
      ...node,
      width: node.style?.width || nodeWidth,
      height: node.style?.height || nodeHeight,
    })),
    edges: edges,
  };

  try {
    const layoutedGraph = await elk.layout(graph);
    const newNodes = layoutedGraph.children.map((node) => {
        // 对于 Group 节点，我们需要保留它的 style 属性
        const style = nodes.find(n => n.id === node.id)?.style;
        return {
            ...node,
            // 从 ELK 结果中删除 width/height，让 React Flow 处理
            width: undefined,
            height: undefined,
            position: { x: node.x, y: node.y },
            style: style, // 重新应用 style
        };
    });
    return { nodes: newNodes, edges };
  } catch (e) {
    console.error(e);
    return { nodes, edges };
  }
};


const TopologyMap = () => {
  // 注意：初始状态为空数组，通过 useEffect 异步加载
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 使用 useEffect 进行初始的异步布局
  useEffect(() => {
    setIsLoading(true);
    getLayoutedElements(initialNodes, initialEdges, 'TB').then(({ nodes: layoutedNodes, edges: layoutedEdges }) => {
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
      setIsLoading(false);
    });
  }, []); // 空依赖数组确保只在挂载时运行一次

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge({ ...params, type: 'straight', animated: true }, eds),
      ),
    [],
  );

  // onLayout 回调需要是 async 函数
  const onLayout = useCallback(
    async (direction) => {
      setIsLoading(true);
      const { nodes: layoutedNodes, edges: layoutedEdges } = await getLayoutedElements(
        nodes,
        edges,
        direction,
      );
      // 使用最新的布局更新状态
      setNodes([...layoutedNodes]);
      setEdges([...layoutedEdges]);
      // 延迟一点取消加载状态，让视图有时间重新渲染
      setTimeout(() => setIsLoading(false), 100);
    },
    [nodes, edges, setNodes, setEdges],
  );

  if (isLoading) {
    return <div>Loading layout...</div>; // 可以添加一个加载指示器
  }

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      connectionLineType={ConnectionLineType.Straight}
      fitView
    >
      <Panel position="top-right">
        <button className="xy-theme__button" onClick={() => onLayout('TB')}>
          vertical layout
        </button>
        <button className="xy-theme__button" onClick={() => onLayout('LR')}>
          horizontal layout
        </button>
      </Panel>
      <Background />
    </ReactFlow>
  );
};

export default TopologyMap;