"use client";
import { useEffect,useRef, useState, useCallback } from "react";
import ChatHeader from "./ChatHeader";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import { getSocket } from "../../lib/socket";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";

type Message = {
  id: string;
  text: string;
  senderId: string;
  createdAt: string;
};

interface ChatWindowProps {
  chatId: string | null;
}


interface Chat {
  id: string;
  participants: { id: string; name: string }[];
  lastMessage?: { text: string };
  unread: number;
}

export default function ChatWindow({ chatId }: ChatWindowProps) {
  const { user } = useAuth();
  // console.log("wher data in : ", user);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatName, setChatName] = useState<string>("");
  const [otherUserId, setOtherUserId] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(false);

  const socket = getSocket();
if(!socket)return;
// console.log("user login window", user);

  useEffect(() => {
    if (!chatId || !user) return;

    const fetchData = async () => {
      try {
        const res = await api.get(`/api/chat/${chatId}/messages`);

        setMessages((res.data as any).messages ?? res.data);
        
        const chatRes = await api.get<Chat>(`/api/chat/${chatId}`);
      

        const otherUser = chatRes.data.participants.find(
          (p: any) => p.id !== user.id
        );
        setChatName(otherUser?.name || "Unknown");
        setOtherUserId(otherUser?.id || null);
      } catch (err) {
        console.error("Failed to load chat:", err);
      }
    };

    fetchData();
  }, [chatId, user]);

  const handleNewMessage = useCallback(
    ({ chatId: incomingChatId, message }: any) => {
      if (incomingChatId === chatId) {
        setMessages((prev) => [...prev, message]);
      }
    },
    [chatId]
  );

  useEffect(() => {
    if (!chatId) return;

    socket.emit("join_chat", chatId);
    socket.on("new_message", handleNewMessage);

    return () => {
      socket.emit("leave_chat", chatId);
      socket.off("new_message", handleNewMessage);
    };
  }, [chatId, socket, handleNewMessage]);

  useEffect(() => {
    console.log("socket and other user id : ",socket,"id is",otherUserId);
    
    if (!socket || !otherUserId) return;

    const handleUserOnline = (id: string) => {
      console.log("this is a id online",id);
      
      if (id === otherUserId) setIsOnline(true);
    };
    const handleUserOffline = (id: string) => {
      console.log("this is a id offline",id);
      if (id === otherUserId) setIsOnline(false);
    };

    socket.on("user_online", handleUserOnline);
    socket.on("user_offline", handleUserOffline);

    socket.emit("check_online", otherUserId, (online: boolean) => {
      setIsOnline(online);
    });

    return () => {
      socket.off("user_online", handleUserOnline);
      socket.off("user_offline", handleUserOffline);
    };
  }, [socket, otherUserId]);

   const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!chatId) {
    return (
      <div className="flex flex-1 items-center justify-center text-gray-400">
        Select a chat to start messaging
      </div>
    );
  }
// console.log("message log ",messages);

  return (
    <div className="flex flex-col h-full">
      <ChatHeader
        chatId={chatId}
        currentUserId={user?.id || ""}
        name={chatName}
        isOnline={isOnline}
      />

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            text={msg.text}
            sender={msg.senderId === user?.id ? "me" : "other"}
          />
        ))}
        {/* Auto-scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="border-t border-gray-300 bg-gray-100 p-3 sticky bottom-0">
        <MessageInput chatId={chatId} userId={user?.id || ""} />
      </div>
    </div>
  );
}
