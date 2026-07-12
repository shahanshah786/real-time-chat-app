// models/messageModel.js
// Small data-access layer around the SQLite "messages" table.
// Keeping DB queries here (instead of scattering them in routes/sockets)
// keeps the rest of the code clean and easy to swap for another DB later.

const db = require("../db");

function getAllMessages() {
  const stmt = db.prepare("SELECT * FROM messages ORDER BY id ASC");
  return stmt.all();
}

function createMessage({ username, text }) {
  const timestamp = new Date().toISOString();
  const stmt = db.prepare(
    "INSERT INTO messages (username, text, timestamp, status) VALUES (?, ?, ?, ?)"
  );
  const info = stmt.run(username, text, timestamp, "sent");

  return {
    id: info.lastInsertRowid,
    username,
    text,
    timestamp,
    status: "sent",
  };
}

function updateMessageStatus(id, status) {
  const stmt = db.prepare("UPDATE messages SET status = ? WHERE id = ?");
  stmt.run(status, id);
}

module.exports = {
  getAllMessages,
  createMessage,
  updateMessageStatus,
};
