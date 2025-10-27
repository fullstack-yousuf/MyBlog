"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import ChatHeader from "./ChatHeader";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import { getSocket } from "@/lib/socket";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

type Message = {
  id: string;
  text: string;
  sender: { id: string };
  createdAt: string;
};

interface Chat {
  id: string;
  participants: { id: string; name: string }[];
}

interface ChatWindowProps {
  chatId: string | null;
}

export default function ChatWindow({ chatId }: ChatWindowProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatName, setChatName] = useState<string>("");
  const [otherUserId, setOtherUserId] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const socket = getSocket();

  // ✅ Handle online/offline detection
  useEffect(() => {
    const updateStatus = () => setIsOnline(navigator.onLine);

    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);

    updateStatus(); // initial state

    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, []);

  // ✅ Fetch chat data
  const fetchChatData = useCallback(async () => {
    if (!chatId || !user) return;
    try {
      const [msgRes, chatRes] = await Promise.all([
        api.get(`/chat/${chatId}/messages`),
        api.get<Chat>(`/chat/${chatId}`),
      ]);

      setMessages((msgRes.data as any).messages ?? msgRes.data);

      const otherUser = chatRes.data.participants.find(
        (p: any) => p.id !== user.id
      );

      setChatName(otherUser?.name || "Unknown");
      setOtherUserId(otherUser?.id || null);
    } catch (err) {
      console.error("Failed to load chat:", err);
    }
  }, [chatId, user]);

  // ✅ Initial fetch
  useEffect(() => {
    fetchChatData();
  }, [fetchChatData]);

  // ✅ Re-fetch when user comes back online
useEffect(() => {
  if (!isOnline) return;

  const timeout = setTimeout(() => {
    console.log("🟢 Connection restored — refetching chat messages...");
    fetchChatData();
  }, 1000); // wait 1s after reconnect

  return () => clearTimeout(timeout);
}, [isOnline, fetchChatData]);

  // ✅ Real-time messages
  useEffect(() => {
    if (!socket || !chatId || !user || !isOnline) return;

    socket.emit("join_chat", chatId);

    const handleNewMessage = ({ chatId: incomingId, message }: any) => {
      if (incomingId === chatId) {
        setMessages((prev) => [...prev, message]);
      }
    };

    socket.on("new_message", handleNewMessage);

    return () => {
      socket.emit("leave_chat", chatId);
      socket.off("new_message", handleNewMessage);
    };
  }, [chatId, user, socket, isOnline]);

  // ✅ Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 🛑 If offline → block chat access with modal
  if (!isOnline) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex flex-col items-center justify-center">
        <div className="bg-white shadow-lg rounded-xl px-6 py-10 text-center max-w-sm w-full">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            You are offline
          </h2>
          <p className="text-gray-600">
            Trying to reconnect... Please check your internet connection.
          </p>
          <div className="mt-6 flex justify-center">
            <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!chatId) {
    return (
      <div className="flex flex-1 items-center justify-center text-gray-400">
        Select a chat to start messaging
      </div>  
    );
  }

  return (
  
    // <div className="flex flex-col h-full">
<div className="flex flex-col h-full pt-14    md:pt-0">
       <ChatHeader
        chatId={chatId}
        currentUserId={user?.id || ""}
        name={chatName}
        otherUser={otherUserId || ""}
      />

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4    space-y-3 bg-gray-50">
        {messages.length ? (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              text={msg.text}
              sender={msg.sender?.id === user?.id ? "me" : "other"}
            />
          ))
        ) : (
          <p className="text-gray-400   text-center">No messages yet.</p>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="border-t border-gray-300 bg-gray-100 p-3 sticky bottom-0">
        <MessageInput chatId={chatId} userId={user?.id || ""} />
      </div>
    </div>
  );
}
