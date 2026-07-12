// context/SocketContext.jsx
// Creates and provides a single Socket.io connection to the whole app once
// the user has "logged in" with a username. Keeping this in a context means
// only one socket connection exists, and every component can subscribe to
// events without prop-drilling.

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { API_URL } from "../api";

const SocketContext = createContext(null);

export function SocketProvider({ username, children }) {
  const [socket, setSocket] = useState(null);
  const [connectionError, setConnectionError] = useState(null);

  useEffect(() => {
    if (!username) return undefined;

    const newSocket = io(API_URL, {
      query: { username },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
      setConnectionError("Unable to connect to chat server. Retrying...");
    });

    newSocket.on("connect", () => {
      setConnectionError(null);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [username]);

  const value = useMemo(() => ({ socket, connectionError }), [socket, connectionError]);

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (ctx === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return ctx;
}
