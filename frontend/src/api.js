// api.js
// Thin wrapper around the REST endpoints so components don't deal with
// axios/fetch details directly.

import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const client = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 8000,
});

export async function fetchMessages() {
  try {
    const res = await client.get("/messages");
    return res.data.data;
  } catch (err) {
    console.error("Failed to fetch messages:", err);
    throw new Error("Could not load chat history. Please check the backend server.");
  }
}

export async function sendMessageRest(username, text) {
  try {
    const res = await client.post("/messages", { username, text });
    return res.data.data;
  } catch (err) {
    console.error("Failed to send message:", err);
    throw new Error("Could not send message. Please try again.");
  }
}

export { API_URL };
