import React, { useEffect, useRef } from "react";
import * as Y from "yjs";
import { QuillBinding } from "y-quill";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { useSocket } from "../../context/SocketContext";

export default function CollaborativeEditor({ groupId }: { groupId: string }) {
  const editorRef = useRef<HTMLDivElement>(null);
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!editorRef.current || !socket || !isConnected) return;

    // Initialize Yjs Document
    const ydoc = new Y.Doc();
    const ytext = ydoc.getText("quill-editor");

    // Initialize Quill Editor
    const quill = new Quill(editorRef.current, {
      theme: "snow",
      modules: {
        toolbar: [
          [{ header: [1, 2, false] }],
          ["bold", "italic", "underline"],
          ["code-block"]
        ]
      }
    });

    // Bind Yjs to Quill
    const binding = new QuillBinding(ytext, quill);

    // Broadcast local changes to other clients via socket.io
    ydoc.on("update", (update: Uint8Array, origin: any) => {
      // Don't broadcast updates that came from the network
      if (origin !== "network") {
        // We emit the binary update as an array buffer
        socket.emit("sync-update", { groupId, update: Array.from(update) });
      }
    });

    // Apply remote changes from other clients
    const handleRemoteUpdate = (updateArray: number[]) => {
      const update = new Uint8Array(updateArray);
      Y.applyUpdate(ydoc, update, "network");
    };

    socket.on("sync-update", handleRemoteUpdate);

    return () => {
      socket.off("sync-update", handleRemoteUpdate);
      binding.destroy();
      quill.disable();
    };
  }, [groupId, socket, isConnected]);

  return (
    <div className="flex flex-col h-full bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <h3 className="font-semibold text-gray-700">Collaborative Document</h3>
      </div>
      <div className="flex-1 bg-white h-full relative p-4">
        {/* The editor container */}
        <div ref={editorRef} style={{ height: 'calc(100% - 42px)' }} />
      </div>
    </div>
  );
}
