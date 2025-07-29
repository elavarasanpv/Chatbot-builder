/** @format */

import React from "react";
import { useDnD } from "./DnDContext";
import { BsChatText, BsSave, BsX } from "react-icons/bs";

export default function Sidebar({ editState }) {
  const [_, setType] = useDnD();

  const onDragStart = (event, nodeType) => {
    setType(nodeType);
    event.dataTransfer.setData("text/plain", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  const handleSaveEdit = () => {
    if (editState.handleSaveEdit) {
      editState.handleSaveEdit();
    }
  };

  const handleCancelEdit = () => {
    if (editState.handleCancelEdit) {
      editState.handleCancelEdit();
    }
  };

  const handleTextChange = (e) => {
    const newText = e.target.value;
    if (editState.setEditText) {
      editState.setEditText(newText);
    }
  };

  if (editState.isEditing) {
    return (
      <aside>
        <div className="edit-node-section">
          <h3>Edit Node</h3>
          <p>Modify the message content for the selected node.</p>

          <div className="edit-form">
            <label htmlFor="node-textarea">Message Content:</label>
            <textarea
              id="node-textarea"
              value={editState.editText || ""}
              onChange={handleTextChange}
              placeholder="Enter your message here..."
              rows={6}
              className="node-textarea"
            />

            <div className="edit-buttons">
              <button
                onClick={handleSaveEdit}
                className="save-edit-btn"
                disabled={!editState.editText?.trim()}
              >
                <BsSave size={16} />
                <span>Save</span>
              </button>
              <button onClick={handleCancelEdit} className="cancel-edit-btn">
                <BsX size={16} />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside>
      {/* For now we only have text message, but we can add more later */}
      <div className="node-types">
        <div
          className="dndnode text-message"
          onDragStart={(event) => onDragStart(event, "textMessage")}
          draggable
          title="Add a text message to your chatbot flow"
        >
          <div className="node-icon">
            <BsChatText size={24} />
          </div>
          <div className="node-label">Text Message</div>
          <div className="node-description">Add a text message node</div>
        </div>
      </div>
    </aside>
  );
}
