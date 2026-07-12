// components/MessageInput.jsx
// Text input for composing messages. Emits "typing" / "stopTyping" socket
// events (debounced) so other users see the typing indicator.

import { useRef, useState } from "react";

export default function MessageInput({ onSend, socket }) {
  const [text, setText] = useState("");
  const typingTimeoutRef = useRef(null);

  function handleChange(e) {
    setText(e.target.value);

    if (!socket) return;

    socket.emit("typing");

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping");
    }, 1200);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    onSend(trimmed);
    setText("");

    if (socket) socket.emit("stopTyping");
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  }

  return (
    <form className="message-input" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Type a message..."
        value={text}
        onChange={handleChange}
      />
      <button type="submit" disabled={!text.trim()}>
        Send
      </button>
    </form>
  );
}
