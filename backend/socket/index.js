// socket/index.js
// All Socket.io real-time logic lives here, separate from REST routes,
// so responsibilities stay clean (routes = persistence, sockets = real-time).

const messageModel = require("../models/messageModel");

// In-memory map of currently connected users: socket.id -> username
// (Kept in memory since online status is transient, not historical data)
const onlineUsers = new Map();

function getOnlineUsernames() {
  return Array.from(new Set(onlineUsers.values()));
}

function registerSocketHandlers(io) {
  io.on("connection", (socket) => {
    const { username } = socket.handshake.query;

    if (!username) {
      // Reject connections without a username (dummy auth requirement)
      console.log("Connection rejected: no username provided");
      socket.disconnect(true);
      return;
    }

    onlineUsers.set(socket.id, username);
    console.log(`User connected: ${username} (${socket.id})`);

    // Let everyone know the updated online user list
    io.emit("onlineUsers", getOnlineUsernames());
    // Notify others a specific user came online
    socket.broadcast.emit("userOnline", { username });

    // ---- Sending a message over the socket (in addition to the REST API) ----
    socket.on("sendMessage", (payload, callback) => {
      try {
        const { text } = payload || {};
        if (!text || !text.trim()) {
          if (callback) callback({ success: false, message: "Empty message" });
          return;
        }

        const message = messageModel.createMessage({ username, text });

        // Broadcast the new message to everyone, including the sender
        // (sender uses this to confirm delivery/render the message with its real id)
        io.emit("newMessage", message);

        // Acknowledge back to the sender that the message was delivered to the server
        if (callback) callback({ success: true, data: message });

        // Simulate "delivered" status shortly after broadcast (bonus feature)
        setTimeout(() => {
          messageModel.updateMessageStatus(message.id, "delivered");
          io.emit("messageStatusUpdate", { id: message.id, status: "delivered" });
        }, 500);
      } catch (err) {
        console.error("Error handling sendMessage:", err);
        if (callback) callback({ success: false, message: "Server error" });
      }
    });

    // ---- Typing indicator (bonus feature) ----
    socket.on("typing", () => {
      socket.broadcast.emit("userTyping", { username });
    });

    socket.on("stopTyping", () => {
      socket.broadcast.emit("userStoppedTyping", { username });
    });

    // ---- Read receipts (bonus feature) ----
    socket.on("messageRead", ({ id }) => {
      try {
        messageModel.updateMessageStatus(id, "read");
        io.emit("messageStatusUpdate", { id, status: "read" });
      } catch (err) {
        console.error("Error updating read status:", err);
      }
    });

    // ---- Graceful disconnect handling ----
    socket.on("disconnect", () => {
      onlineUsers.delete(socket.id);
      console.log(`User disconnected: ${username} (${socket.id})`);
      io.emit("onlineUsers", getOnlineUsernames());
      socket.broadcast.emit("userOffline", { username });
    });

    // ---- Graceful error handling ----
    socket.on("error", (err) => {
      console.error(`Socket error for ${username}:`, err);
    });
  });
}

module.exports = registerSocketHandlers;
