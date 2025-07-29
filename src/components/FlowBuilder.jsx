/** @format */
import React, { useCallback, useState, useEffect } from "react";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  useReactFlow,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useDnD } from "./DnDContext";
import BaseNode from "./BaseNode";

const initialNodes = [
  {
    id: "n1",
    position: { x: 250, y: 100 },
    data: { label: "Welcome! How can I help you today?" },
    type: "baseNode",
    sourcePosition: "right",
    targetPosition: "left",
  },
];
const initialEdges = [];

// Node Types is defined here , further nodes can be added here
const nodeTypes = {
  baseNode: BaseNode,
};

export default function FlowBuilder({ onEditStateChange }) {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [type, setType] = useDnD();
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const { screenToFlowPosition } = useReactFlow();

  // Function to log full flow context
  const logFlowContext = useCallback(() => {
    console.log("=== FLOW BUILDER FULL CONTEXT ===");
    console.log("Nodes:", JSON.stringify(nodes, null, 2));
    console.log("Edges:", JSON.stringify(edges, null, 2));
    console.log("Total Nodes:", nodes.length);
    console.log("Total Edges:", edges.length);
    console.log("Node Details:");
    nodes.forEach((node, index) => {
      console.log(`Node ${index + 1}:`, {
        id: node.id,
        type: node.type,
        position: node.position,
        data: node.data,
        style: node.style,
        className: node.className,
        targetPosition: node.targetPosition,
        sourcePosition: node.sourcePosition,
        hidden: node.hidden,
        selected: node.selected,
        dragging: node.dragging,
        zIndex: node.zIndex,
      });
    });
    console.log("Edge Details:");
    edges.forEach((edge, index) => {
      console.log(`Edge ${index + 1}:`, {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
        label: edge.label,
        type: edge.type,
        animated: edge.animated,
        style: edge.style,
        className: edge.className,
        data: edge.data,
        zIndex: edge.zIndex,
        selected: edge.selected,
      });
    });
    console.log("=== END FLOW CONTEXT ===");
  }, [nodes, edges]);

  const onNodesChange = useCallback((changes) => {
    setNodes((nodesSnapshot) => {
      const updatedNodes = applyNodeChanges(changes, nodesSnapshot);
      console.log("Nodes changed:", changes);
      console.log("Updated nodes:", updatedNodes);
      return updatedNodes;
    });
  }, []);

  const onEdgesChange = useCallback((changes) => {
    setEdges((edgesSnapshot) => {
      const updatedEdges = applyEdgeChanges(changes, edgesSnapshot);
      console.log("Edges changed:", changes);
      console.log("Updated edges:", updatedEdges);
      return updatedEdges;
    });
  }, []);

  const onConnect = useCallback(
    (params) => {
      console.log("Connection attempt:", params);

      // Check if source node already has any outgoing edge
      const existingEdgeFromSource = edges.find(
        (edge) => edge.source === params.source
      );

      if (existingEdgeFromSource) {
        console.log(
          "Source node already has an outgoing edge, connection blocked"
        );
        alert("Each node can only have one outgoing connection!");
        return;
      }

      // Add arrow marker to the new edge as per in the image given
      const newEdge = {
        ...params,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 10,
          height: 10,
          color: "#000",
        },
        style: {
          strokeWidth: 2,
        },
      };

      setEdges((edgesSnapshot) => {
        const updatedEdges = addEdge(newEdge, edgesSnapshot);
        console.log("New connection created:", newEdge);
        console.log("Updated edges:", updatedEdges);
        return updatedEdges;
      });
    },
    [edges]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);
  // on drop we are creating a new node
  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      // check if the dropped element is valid
      if (!type) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: `${type}-${Date.now()}`,
        type: "baseNode",
        position,
        data: {
          label: "New Text Message",
          message: "Enter your message here...",
        },
        sourcePosition: "right",
        targetPosition: "left",
      };

      console.log("New node created:", newNode);
      setNodes((nds) => {
        const updatedNodes = nds.concat(newNode);
        console.log("All nodes after creation:", updatedNodes);
        return updatedNodes;
      });
      setType(null);
    },
    [screenToFlowPosition, type, setType]
  );

  // Handle node click
  const onNodeClick = useCallback(
    (event, node) => {
      console.log("=== NODE CLICK EVENT ===");
      console.log("Event:", event);
      console.log("Node:", node);
      console.log("Node ID:", node.id);
      console.log("Node Data:", node.data);
      console.log("Node Position:", node.position);
      console.log("Node Type:", node.type);
      console.log("=== END NODE CLICK ===");

      setSelectedNodeId(node.id);
      setIsEditing(true);
      setEditText(node.data.label || "");

      // Notify parent component about edit state
      if (onEditStateChange) {
        onEditStateChange({
          isEditing: true,
          editText: node.data.label || "",
          selectedNodeId: node.id,
        });
      }
    },
    [onEditStateChange]
  );

  // Handle pane click (outside click) to remove the active class from all nodes
  const onPaneClick = useCallback(
    (event) => {
      console.log("=== PANE CLICK (OUTSIDE CLICK) ===");
      console.log("Event:", event);
      console.log("Removing active class from all nodes");
      console.log("=== END PANE CLICK ===");

      setSelectedNodeId(null);
      setIsEditing(false);
      setEditText("");

      // Notify parent component about edit state
      if (onEditStateChange) {
        onEditStateChange({
          isEditing: false,
          editText: "",
          selectedNodeId: null,
        });
      }
    },
    [onEditStateChange]
  );

  // Handle save edit
  const handleSaveEdit = useCallback(() => {
    if (selectedNodeId && editText.trim()) {
      setNodes((prevNodes) =>
        prevNodes.map((node) =>
          node.id === selectedNodeId
            ? { ...node, data: { ...node.data, label: editText.trim() } }
            : node
        )
      );
    }
    setSelectedNodeId(null);
    setIsEditing(false);
    setEditText("");

    // Notify parent component about edit state
    if (onEditStateChange) {
      onEditStateChange({
        isEditing: false,
        editText: "",
        selectedNodeId: null,
      });
    }
  }, [selectedNodeId, editText, onEditStateChange]);

  // Handle cancel edit
  const handleCancelEdit = useCallback(() => {
    setSelectedNodeId(null);
    setIsEditing(false);
    setEditText("");

    // Notify parent component about edit state
    if (onEditStateChange) {
      onEditStateChange({
        isEditing: false,
        editText: "",
        selectedNodeId: null,
      });
    }
  }, [onEditStateChange]);

  // Update nodes with active class
  useEffect(() => {
    setNodes((prevNodes) =>
      prevNodes.map((node) => ({
        ...node,
        className: node.id === selectedNodeId ? "active-node" : "",
      }))
    );
  }, [selectedNodeId]);

  // Expose logFlowContext to parent component
  useEffect(() => {
    if (window.logFlowContext) {
      window.logFlowContext = logFlowContext;
    } else {
      window.logFlowContext = logFlowContext;
    }
  }, [logFlowContext]);

  // Expose nodes and edges to parent component
  useEffect(() => {
    window.getNodes = () => nodes;
    window.getEdges = () => edges;
  }, [nodes, edges]);

  // Expose edit functions to parent component
  useEffect(() => {
    if (onEditStateChange) {
      onEditStateChange({
        isEditing,
        editText,
        selectedNodeId,
        handleSaveEdit,
        handleCancelEdit,
        setEditText,
      });
    }
  }, [
    isEditing,
    editText,
    selectedNodeId,
    handleSaveEdit,
    handleCancelEdit,
    onEditStateChange,
  ]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        fitView={false}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        connectionMode="strict"
        onConnectStart={(event, { nodeId, handleId, handleType }) => {
          console.log("Connection start:", { nodeId, handleId, handleType });
        }}
        onConnectEnd={(event) => {
          console.log("Connection end:", event);
        }}
      >
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}
