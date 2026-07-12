// routes/messages.js
// REST API endpoints required by the assignment:
//   GET  /api/messages  -> fetch chat history
//   POST /api/messages  -> send a message (persists it; the actual real-time
//                          broadcast to other clients happens over Socket.io,
//                          see socket/index.js)

const express = require("express");
const router = express.Router();
const messageModel = require("../models/messageModel");

// GET /api/messages - fetch full chat history
router.get("/", (req, res) => {
  try {
    const messages = messageModel.getAllMessages();
    res.status(200).json({ success: true, data: messages });
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ success: false, message: "Failed to fetch messages" });
  }
});

// POST /api/messages - send a new message
router.post("/", (req, res) => {
  try {
    const { username, text } = req.body;

    if (!username || !text || !text.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "username and text are required" });
    }

    const message = messageModel.createMessage({ username, text });

    // Broadcast to all connected clients in real time via Socket.io.
    // `req.app.get("io")` is set up in server.js
    const io = req.app.get("io");
    if (io) {
      io.emit("newMessage", message);
    }

    res.status(201).json({ success: true, data: message });
  } catch (err) {
    console.error("Error saving message:", err);
    res.status(500).json({ success: false, message: "Failed to save message" });
  }
});

module.exports = router;
