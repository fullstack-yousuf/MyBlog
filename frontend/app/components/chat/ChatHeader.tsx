"use client";
import React, { useEffect, useState, useRef } from "react";
import { getSocket } from "../../lib/socket";

interface ChatHeaderProps {
  name: string;
  isOnline: boolean;
  chatId: string;
  currentUserId: string;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  name,
  isOnline,
  chatId,
  currentUserId,
}) => {
  const [isTyping, setIsTyping] = useState(false);
  const socket = getSocket();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!socket || !chatId) return;

    const handleTyping = ({ chatId: incomingChatId, userId }: any) => {
      if (incomingChatId === chatId && userId !== currentUserId) {
        setIsTyping(true);

        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
      }
    };

    const handleStopTyping = ({ chatId: incomingChatId, userId }: any) => {
      if (incomingChatId === chatId && userId !== currentUserId) {
        setIsTyping(false);
      }
    };

    socket.on("typing", handleTyping);
    socket.on("stop_typing", handleStopTyping);

    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      socket.off("typing", handleTyping);
      socket.off("stop_typing", handleStopTyping);
    };
  }, [socket, chatId, currentUserId]);
  console.log(isOnline);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-blue-50">
      <div className="flex items-center space-x-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center font-semibold text-blue-800">
          {name?.charAt(0).toUpperCase() || "?"}
        </div>

        {/* Name + Status */}
        <div>
          <p className="font-semibold text-gray-900">{name || "Unknown"}</p>
          {isTyping ? (
            <p className="text-xs text-blue-600 animate-pulse">Typing...</p>
          ) : (
            <p className="text-xs text-gray-500 flex items-center">
              <span
                className={`w-2 h-2 rounded-full mr-1 transition-colors ${
                  isOnline ? "bg-green-500" : "bg-gray-400"
                }`}
              />
              {isOnline ? "Online" : "Offline"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
