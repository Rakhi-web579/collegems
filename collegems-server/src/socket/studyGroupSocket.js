import ChatMessage from "../models/ChatMessage.model.js";
import StudyGroup from "../models/StudyGroup.model.js";

export const initializeStudyGroupSockets = (io) => {
  io.on("connection", (socket) => {
    const userId = socket.user?.id || socket.user?._id;
    if (!userId) return;

    // Join a specific study group room
    socket.on("join-group", async (groupId) => {
      try {
        const group = await StudyGroup.findById(groupId);
        if (group && group.members.includes(userId)) {
          socket.join(`group_${groupId}`);
          socket.to(`group_${groupId}`).emit("user-joined", { userId });
          console.log(`User ${userId} joined group ${groupId}`);
        }
      } catch (error) {
        console.error("Error joining group socket:", error);
      }
    });

    // Leave a specific study group room
    socket.on("leave-group", (groupId) => {
      socket.leave(`group_${groupId}`);
      socket.to(`group_${groupId}`).emit("user-left", { userId });
      console.log(`User ${userId} left group ${groupId}`);
    });

    // Handle chat messages
    socket.on("send-message", async (data) => {
      try {
        const { groupId, content } = data;
        const message = new ChatMessage({
          groupId,
          senderId: userId,
          content,
        });
        await message.save();
        
        const populatedMessage = await message.populate("senderId", "name email");
        
        io.to(`group_${groupId}`).emit("receive-message", populatedMessage);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    });

    // Handle document sync (Yjs update broadcast)
    socket.on("sync-update", (data) => {
      const { groupId, update } = data;
      // Broadcast the update to everyone else in the room
      socket.to(`group_${groupId}`).emit("sync-update", update);
    });

    // Disconnect handling is generally managed at the root connection
    socket.on("disconnecting", () => {
      for (const room of socket.rooms) {
        if (room.startsWith("group_")) {
          socket.to(room).emit("user-left", { userId });
        }
      }
    });
  });
};
