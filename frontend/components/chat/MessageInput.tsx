"use client";
import React, { useState, useEffect } from "react";
import { getSocket } from "../../lib/socket"; // 👈 your socket instance

interface MessageInputProps {
  chatId: string;
  userId: string;
}

const MessageInput: React.FC<MessageInputProps> = ({ chatId, userId }) => {
  const [text, setText] = useState("");
  const socket = getSocket();
  if (!socket) return;

  useEffect(() => {
    let typingTimeout: NodeJS.Timeout;

    if (text) {
      socket.emit("typing", { chatId, userId });
      typingTimeout = setTimeout(() => {
        socket.emit("stop_typing", { chatId, userId });
      }, 2000); // stops after 2s of no typing
    }

    return () => clearTimeout(typingTimeout);
  }, [text, chatId, userId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    socket.emit("send_message", { chatId, text, senderId: userId });
    setText("");
    socket.emit("stop_typing", { chatId, userId });
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center  gap-2 p-1 ">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a message..."
        className="flex-1 px-4 py-2 rounded-lg bg-white border-gray-400 border focus:outline-none"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-blue-500 text-white rounded-lg"
      >
        Send ➤
      </button>
    </form>
  );
};

export default MessageInput;