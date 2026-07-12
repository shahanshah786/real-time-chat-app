// components/MessageList.jsx
// Renders the list of chat messages, distinguishing "my" messages from
// others', showing timestamps and delivered/read status ticks.

import { useEffect, useRef } from "react";

function formatTime(isoString) {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function StatusTicks({ status }) {
  if (status === "read") return <span className="ticks read">✓✓</span>;
  if (status === "delivered") return <span className="ticks">✓✓</span>;
  return <span className="ticks">✓</span>;
}

export default function MessageList({ messages, currentUser }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="empty-state">
        <p>No messages yet. Say hi! 👋</p>
      </div>
    );
  }

  return (
    <div className="message-list">
      {messages.map((msg) => {
        const isMine = msg.username === currentUser;
        return (
          <div key={msg.id} className={`message-row ${isMine ? "mine" : "theirs"}`}>
            <div className="message-bubble">
              {!isMine && <div className="message-sender">{msg.username}</div>}
              <div className="message-text">{msg.text}</div>
              <div className="message-meta">
                <span>{formatTime(msg.timestamp)}</span>
                {isMine && <StatusTicks status={msg.status} />}
              </div>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
