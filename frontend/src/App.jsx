// App.jsx
// Root component: handles the dummy login flow and mounts the socket
// provider + chat window once a username is chosen.

import { useState } from "react";
import Login from "./components/Login";
import ChatWindow from "./components/ChatWindow";
import { SocketProvider } from "./context/SocketContext";

const STORAGE_KEY = "chat_username";

export default function App() {
  const [username, setUsername] = useState(() => sessionStorage.getItem(STORAGE_KEY));

  function handleLogin(name) {
    sessionStorage.setItem(STORAGE_KEY, name);
    setUsername(name);
  }

  function handleLogout() {
    sessionStorage.removeItem(STORAGE_KEY);
    setUsername(null);
  }

  if (!username) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <SocketProvider username={username}>
      <ChatWindow username={username} onLogout={handleLogout} />
    </SocketProvider>
  );
}
