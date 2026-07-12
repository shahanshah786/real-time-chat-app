// db.js
// Sets up a lightweight SQLite database (file-based, zero external setup)
// to persist chat messages so history survives server restarts / refreshes.

const path = require("path");
const Database = require("better-sqlite3");

const dbPath = path.join(__dirname, "chat.db");
const db = new Database(dbPath);

// Create the messages table if it doesn't already exist
db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    text TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    status TEXT DEFAULT 'sent'
  )
`);

module.exports = db;
