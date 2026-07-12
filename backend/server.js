// server.js
// Entry point: sets up Express (REST API) + Socket.io (real-time) together
// on a single HTTP server.

require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const messagesRouter = require("./routes/messages");
const registerSocketHandlers = require("./socket/index");

const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

const app = express();
const server = http.createServer(app);

// Socket.io setup with CORS so the frontend (different origin/port) can connect
const io = new Server(server, {
  cors: {
    origin: CLIENT_ORIGIN,
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

// Make io accessible inside REST route handlers (routes/messages.js uses this
// to broadcast a message sent via the REST API to all connected sockets)
app.set("io", io);

// Routes
app.use("/api/messages", messagesRouter);

// Health check
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Chat backend is running" });
});

// Register all Socket.io event handlers
registerSocketHandlers(io);

// Basic global error handler for REST routes
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, message: "Internal server error" });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
