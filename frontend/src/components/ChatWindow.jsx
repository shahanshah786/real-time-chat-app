// components/ChatWindow.jsx
// Main chat screen: loads history via REST, listens to Socket.io for
// real-time updates (new messages, typing, online users, status updates),
// and renders everything together.

import { useEffect, useState, useCallback } from "react";
import { fetchMessages, sendMessageRest } from "../api";
import { useSocket } from "../context/SocketContext";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import TypingIndicator from "./TypingIndicator";
import UserList from "./UserList";

export default function ChatWindow({ username, onLogout }) {
  const { socket, connectionError } = useSocket();
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [loadError, setLoadError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load chat history once on mount (REST API) - covers "view previous
  // messages after refreshing the application" requirement.
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchMessages()
      .then((data) => {
        if (isMounted) setMessages(data);
      })
      .catch((err) => {
        if (isMounted) setLoadError(err.message);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Subscribe to real-time socket events
  useEffect(() => {
    if (!socket) return undefined;

    function handleNewMessage(message) {
      setMessages((prev) => {
        // avoid duplicating a message we already added optimistically
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
    }

    function handleOnlineUsers(users) {
      setOnlineUsers(users);
    }

    function handleUserTyping({ username: typer }) {
      setTypingUsers((prev) => (prev.includes(typer) ? prev : [...prev, typer]));
    }

    function handleUserStoppedTyping({ username: typer }) {
      setTypingUsers((prev) => prev.filter((u) => u !== typer));
    }

    function handleStatusUpdate({ id, status }) {
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
    }

    socket.on("newMessage", handleNewMessage);
    socket.on("onlineUsers", handleOnlineUsers);
    socket.on("userTyping", handleUserTyping);
    socket.on("userStoppedTyping", handleUserStoppedTyping);
    socket.on("messageStatusUpdate", handleStatusUpdate);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("onlineUsers", handleOnlineUsers);
      socket.off("userTyping", handleUserTyping);
      socket.off("userStoppedTyping", handleUserStoppedTyping);
      socket.off("messageStatusUpdate", handleStatusUpdate);
    };
  }, [socket]);

  const handleSend = useCallback(
    async (text) => {
      // Prefer sending via socket for instant delivery; fall back to REST
      // if the socket isn't connected (graceful degradation).
      if (socket && socket.connected) {
        socket.emit("sendMessage", { text }, (ack) => {
          if (!ack?.success) {
            console.error("Message failed to send via socket:", ack?.message);
          }
        });
      } else {
        try {
          const saved = await sendMessageRest(username, text);
          setMessages((prev) => [...prev, saved]);
        } catch (err) {
          alert(err.message);
        }
      }
    },
    [socket, username]
  );

  return (
    <div className="chat-window">
      <header className="chat-header">
        <h2>💬 Real-Time Chat</h2>
        <div className="header-right">
          <span>Hi, {username}</span>
          <button onClick={onLogout}>Logout</button>
        </div>
      </header>

      {connectionError && <div className="banner error">{connectionError}</div>}
      {loadError && <div className="banner error">{loadError}</div>}

      <div className="chat-body">
        <UserList onlineUsers={onlineUsers} currentUser={username} />
        <div className="chat-main">
          {loading ? (
            <div className="empty-state">Loading messages...</div>
          ) : (
            <MessageList messages={messages} currentUser={username} />
          )}
          <TypingIndicator typingUsers={typingUsers.filter((u) => u !== username)} />
          <MessageInput onSend={handleSend} socket={socket} />
        </div>
      </div>
    </div>
  );
}
