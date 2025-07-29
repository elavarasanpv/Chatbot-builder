/** @format */
import React from "react";
import { Handle, Position } from "@xyflow/react";
import { IoLogoWhatsapp } from "react-icons/io";
import { BsChatText } from "react-icons/bs";

const BaseNode = ({ data }) => {
  return (
    <div className="base-node">
      <Handle type="target" position={Position.Left} className="handle" />

      <div className="node-content">
        <div className="node-header">
          <span
            className="node-type"
            style={{ display: "flex", alignItems: "center", gap: "4px" }}
          >
            <BsChatText size={16} />
            Send Message
          </span>
          <div className="whatsapp-icon-container">
            <IoLogoWhatsapp size={16} className="whatsapp-icon" />
          </div>
        </div>

        <div className="node-body">
          <div className="message-content">
            {data.label || "Enter your message here..."}
          </div>
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="handle" />
    </div>
  );
};

export default BaseNode;
