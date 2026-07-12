// components/Login.jsx
// Dummy authentication: user just picks a username, no password/backend
// auth involved (as allowed by the assignment's bonus requirement).

import { useState } from "react";

export default function Login({ onLogin }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Please enter a username");
      return;
    }
    if (trimmed.length > 20) {
      setError("Username must be under 20 characters");
      return;
    }
    onLogin(trimmed);
  }

  return (
    <div className="login-screen">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>💬 Chat App</h1>
        <p className="subtitle">Enter a username to join the chat</p>
        <input
          type="text"
          placeholder="e.g. shahnshah"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError("");
          }}
          autoFocus
        />
        {error && <p className="error-text">{error}</p>}
        <button type="submit">Join Chat</button>
      </form>
    </div>
  );
}
