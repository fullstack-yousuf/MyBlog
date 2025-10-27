"use client";
import React, { useState, useEffect, FormEvent } from "react";
import { getSocket } from "@/lib/socket";
import { queryClient } from "@/hooks/queryClient";
// import { enqueueMessage, flushQueuedMessages } from "@/lib/messageQueue";

interface MessageInputProps {
  chatId: string;
  userId: string;
}

const MessageInput: React.FC<MessageInputProps> = ({ chatId, userId }) => {
  const [text, setText] = useState("");
  const socket = getSocket();
  if (!socket?.connected) return;

  // Handle typing indicator
  useEffect(() => {
    let typingTimeout: NodeJS.Timeout;

    if (text) {
      socket.emit("typing", { chatId, userId });
      typingTimeout = setTimeout(() => {
        socket.emit("stop_typing", { chatId, userId });
      }, 2000);
    }

    return () => clearTimeout(typingTimeout);
  }, [text, chatId, userId, socket]);

  // Send Message
  const sendChatMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const newMessage = {
      chatId,
      text,
      senderId: userId,
    };

    // Optimistic UI update
    queryClient.setQueryData(["chat", chatId], (old: any) => {
      if (!old) return { messages: [newMessage] };
      return {
        ...old,
        messages: [...(old.messages ?? []), newMessage],
      };
    });

    // // Try sending via socket
    if (navigator.onLine && socket?.connected) {
      socket.emit("send_message", { chatId, text, senderId: userId });
    } else {
      console.warn("Offline - message not send");
    }

    setText("");
    socket?.emit("stop_typing", { chatId, userId });
  };

  return (
    <form onSubmit={sendChatMessage} className="flex items-center gap-2 p-1">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a message..."
        className="flex-1 px-4 py-2 rounded-lg bg-white border border-gray-400 focus:outline-none"
      />
      <button
        type="submit"
        disabled={!navigator.onLine}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
      >
        Send ➤
      </button>
    </form>
  );
};

export default MessageInput;
