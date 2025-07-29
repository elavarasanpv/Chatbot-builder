/** @format */

import React, { useState } from "react";
import "./App.css";
import FlowBuilder from "./components/FlowBuilder";
import Sidebar from "./components/Sidebar";
import { DnDProvider } from "./components/DnDContext";
import { ReactFlowProvider } from "@xyflow/react";
import { BsRobot, BsSave } from "react-icons/bs";

function App() {
  const [editState, setEditState] = useState({
    isEditing: false,
    editText: "",
    selectedNodeId: null,
    handleSaveEdit: null,
    handleCancelEdit: null,
    setEditText: null,
  });

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("error");
  const [isHiding, setIsHiding] = useState(false);

  const handleSaveChanges = () => {
    console.log("=== SAVE CHANGES CLICKED ===");

    // Get current flow data from FlowBuilder
    if (window.logFlowContext) {
      window.logFlowContext();
    } else {
      console.log("Flow context logging function not available");
    }

    // Validate flow before saving
    validateFlowAndSave();
  };

  const validateFlowAndSave = () => {
    //validate the flow such that atleast two node to there should be one edge
    const nodes = window.getNodes ? window.getNodes() : [];
    const edges = window.getEdges ? window.getEdges() : [];

    console.log(
      "Validating flow with nodes:",
      nodes.length,
      "edges:",
      edges.length
    );

    if (nodes.length <= 1) {
      displayToast("Flow must have at least 2 nodes to save", "error");
      return;
    }

    const nodesWithEmptyTargets = nodes.filter((node) => {
      const hasIncomingEdge = edges.some((edge) => edge.target === node.id);
      return !hasIncomingEdge;
    });

    console.log("Nodes with empty targets:", nodesWithEmptyTargets.length);

    if (nodesWithEmptyTargets.length > 1) {
      displayToast("Multiple nodes have no incoming connections", "error");
      return;
    }

    // If validation passes, proceed with save
    displayToast("Flow saved successfully!", "success");
  };

  // Toast Notification foe saving the flow
  const displayToast = (message, type = "error") => {
    setToastMessage(message);
    setToastType(type);
    setIsHiding(false);
    setShowToast(true);

    setTimeout(() => {
      hideToast();
    }, 3000);
  };

  const hideToast = () => {
    setIsHiding(true);
    setTimeout(() => {
      setShowToast(false);
      setIsHiding(false);
    }, 300);
  };

  // Stage where we can edit the node label
  const handleEditStateChange = (newEditState) => {
    setEditState(newEditState);
  };

  return (
    <ReactFlowProvider>
      <DnDProvider>
        <div className="app">
          <div className="header">
            <div className="header-title">
              <BsRobot size={24} className="header-icon" />
              <h1>Chatbot Builder</h1>
            </div>
            <button onClick={handleSaveChanges} className="save-button">
              <BsSave size={16} />
              <span>Save changes</span>
            </button>
          </div>
          <div className="main-content">
            <div className="flow-container">
              <FlowBuilder onEditStateChange={handleEditStateChange} />
            </div>
            <div className="sidebar-container">
              <Sidebar editState={editState} />
            </div>
          </div>

          {/* Toast Notification */}
          {showToast && (
            <div className={`toast ${toastType} ${isHiding ? "hiding" : ""}`}>
              <div className="toast-content">
                <span className="toast-message">{toastMessage}</span>
                <button className="toast-close" onClick={hideToast}>
                  ×
                </button>
              </div>
            </div>
          )}
        </div>
      </DnDProvider>
    </ReactFlowProvider>
  );
}

export default App;
