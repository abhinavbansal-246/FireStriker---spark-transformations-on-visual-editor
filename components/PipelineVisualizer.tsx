import React, { useState, useMemo, useCallback, useRef } from 'react';
import { 
  ReactFlow, 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState, 
  MiniMap, 
  ReactFlowProvider, 
  useReactFlow 
} from '@xyflow/react';
// FIX: The `NodeTypes` import is no longer needed as the type will be inferred.
import type { Node, Edge } from '@xyflow/react';
import { GoogleGenAI } from "@google/genai";
import type { Step } from '../types';
import { StepType } from '../types';
import NodeDetailPanel from './NodeDetailPanel';
import CustomNode from './CustomNode';
import Sidebar from './Sidebar';
import { PROTOCOL_DEFINITION_MD_STRING } from '../constants';
import CodeGenerationModal from './CodeGenerationModal';


interface PipelineVisualizerProps {
  pipelineSteps: Step[];
}

// FIX: The explicit `NodeTypes` annotation is removed to allow TypeScript to correctly infer the type,
// which is necessary when using custom nodes with generic data props.
const nodeTypes = {
  custom: CustomNode,
};

const getDefaultParams = (type: StepType): Step['params'] => {
  switch (type) {
    case StepType.Read:
      return { format: '', path: '' };
    case StepType.Transform:
      return { operations: [] };
    case StepType.Aggregate:
      return { group_by_cols: [], agg_expressions: [] };
    case StepType.Join:
      return { join_type: 'inner', join_conditions: [] };
    case StepType.SQL:
      return { query: '' };
    case StepType.Write:
      return { format: '', path: '' };
    default:
        // This case should not be hit with a valid StepType
        return {} as any;
  }
};


const FlowCanvas: React.FC<PipelineVisualizerProps> = ({ pipelineSteps }) => {
  const [selectedNode, setSelectedNode] = useState<Step | null>(null);

  const { initialNodes, initialEdges } = useMemo(() => {
    // FIX: Use the specific `Node<Step>` type to ensure type safety for node data.
    const nodes: Node<Step>[] = [];
    const edges: Edge[] = [];
    if (!pipelineSteps || pipelineSteps.length === 0) {
      return { initialNodes: [], initialEdges: [] };
    }

    const levels: { [key: number]: string[] } = {};
    const stepMap = new Map<string, Step>(pipelineSteps.map(s => [s.id, s]));
    const nodeDepths = new Map<string, number>();

    const getDepth = (stepId: string): number => {
      if (nodeDepths.has(stepId)) {
        return nodeDepths.get(stepId)!;
      }
      const step = stepMap.get(stepId);
      if (!step || step.inputs.length === 0) {
        nodeDepths.set(stepId, 0);
        return 0;
      }
      const maxParentDepth = Math.max(...step.inputs.map(getDepth));
      const depth = maxParentDepth + 1;
      nodeDepths.set(stepId, depth);
      return depth;
    };

    pipelineSteps.forEach(step => {
      const depth = getDepth(step.id);
      if (!levels[depth]) {
        levels[depth] = [];
      }
      levels[depth].push(step.id);
    });

    Object.keys(levels).forEach(levelKey => {
      const level = parseInt(levelKey, 10);
      const levelNodes = levels[level];
      
      levelNodes.forEach((stepId, index) => {
        const step = stepMap.get(stepId)!;
        nodes.push({
          id: step.id,
          type: 'custom',
          position: {
            x: level * 350 + 50,
            y: index * 150 + 50 - (levelNodes.length > 3 ? 100: 0),
          },
          // FIX: The `data` property is now safely typed as `Step`, resolving the assignment error.
          data: step,
        });

        step.inputs.forEach(inputId => {
          edges.push({
            id: `e-${inputId}-${step.id}`,
            source: inputId,
            target: step.id,
            type: 'smoothstep',
            animated: true,
            style: { strokeWidth: 2, stroke: '#4b5563' },
          });
        });
      });
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [pipelineSteps]);

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  // FIX: Explicitly type `useNodesState` with `Node<Step>` to ensure `nodes` and `setNodes` are correctly typed.
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<Step>>(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);
  // FIX: Explicitly type `useReactFlow` with `<Step>` to ensure `getNodes` and other methods return correctly typed data.
  const { screenToFlowPosition, getNodes } = useReactFlow<Step>();

  // Code Generation State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingCode, setIsLoadingCode] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // FIX: The node parameter is now correctly typed as `Node<Step>`, removing the need for an unsafe cast.
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node<Step>) => {
    setSelectedNode(node.data);
  }, []);

  const handlePaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow') as StepType;
      if (typeof type === 'undefined' || !Object.values(StepType).includes(type)) {
        return;
      }
      
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // FIX: The new node is explicitly typed as `Node<Step>` for type safety.
      const newNode: Node<Step> = {
        id: `dndnode_${+new Date()}`,
        type: 'custom',
        position,
        data: {
          id: `new_step_${+new Date()}`,
          type: type,
          inputs: [],
          params: getDefaultParams(type),
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes]
  );
  
  const handleGenerateCode = useCallback(async () => {
    setIsModalOpen(true);
    setIsLoadingCode(true);
    setGeneratedCode(null);
    setGenerationError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      // FIX: The `as Step` cast is no longer needed because `getNodes()` now correctly returns `Node<Step>[]`.
      const currentNodes = getNodes().map(node => node.data);
      const pipelineJson = JSON.stringify({ steps: currentNodes }, null, 2);

      const prompt = `You are a senior Apache Spark developer specializing in Scala. Your task is to translate a JSON object representing a data pipeline into a complete, runnable Scala script using the Spark DataFrame API.

Here is the protocol definition for the JSON format:
${PROTOCOL_DEFINITION_MD_STRING}

Based on this protocol, convert the following JSON object into a Scala Spark script. The script must:
1.  Include a 'main' method as the entry point.
2.  Initialize a SparkSession.
3.  Contain all necessary imports (e.g., 'org.apache.spark.sql.SparkSession', 'org.apache.spark.sql.functions._').
4.  Process each step from the JSON. The result of each step should be stored in a DataFrame variable named after the step's 'id'.
5.  Correctly handle dependencies by processing nodes in an order that respects the DAG. A step should only be processed after all its 'inputs' have been processed.
6.  For the 'SQL' step type, you MUST register the input DataFrames as temporary views using their respective 'id's as the view names before executing the query.
7.  For the 'Join' step, correctly parse the join condition string.
8.  The final output should be ONLY the raw Scala code, without any explanatory text before or after. Enclose the code in a single markdown block for Scala.

Here is the pipeline JSON:
\`\`\`json
${pipelineJson}
\`\`\`
`;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
      });

      const rawText = response.text;
      const scalaBlock = rawText.match(/```scala\n([\s\S]*?)```/);
      const code = scalaBlock ? scalaBlock[1].trim() : rawText.trim();
      setGeneratedCode(code);
    } catch (e) {
      console.error("Code generation failed:", e);
      setGenerationError(e instanceof Error ? e.message : "An unknown error occurred during code generation.");
    } finally {
      setIsLoadingCode(false);
    }
  }, [getNodes]);

  return (
    <div className="w-full h-full flex">
      <Sidebar onGenerateCode={handleGenerateCode} />
      <div className="flex-grow h-full relative" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onPaneClick={handlePaneClick}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          fitView
          className="bg-gray-900"
        >
          <Background color="#4a5568" gap={16} />
          <Controls />
          <MiniMap nodeStrokeWidth={3} pannable zoomable />
        </ReactFlow>
      </div>
      <NodeDetailPanel node={selectedNode} onClose={() => setSelectedNode(null)} />
      <CodeGenerationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isLoading={isLoadingCode}
        code={generatedCode}
        error={generationError}
      />
    </div>
  );
};


const PipelineVisualizer: React.FC<PipelineVisualizerProps> = ({ pipelineSteps }) => {
  if (!pipelineSteps || pipelineSteps.length === 0) {
    return <div className="text-center text-gray-500">No pipeline data to display.</div>;
  }

  return (
    <div className="w-full h-[calc(100vh-120px)] flex rounded-lg overflow-hidden bg-gray-800 shadow-2xl border border-gray-700">
      <ReactFlowProvider>
        <FlowCanvas pipelineSteps={pipelineSteps} />
      </ReactFlowProvider>
    </div>
  );
};

export default PipelineVisualizer;
