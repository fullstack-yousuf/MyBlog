"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import ChatHeader from "./ChatHeader";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import { getSocket } from "../../lib/socket";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";

type Message = {
  id: string;
  text: string;
  sender: { id: string };
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
  if (!socket) return;
  // console.log("user login window", user);

  useEffect(() => {
    if (!chatId || !user) return;

    const fetchData = async () => {
      try {
        const res = await api.get(`/chat/${chatId}/messages`);
        // console.log("the window  res", res);

        setMessages((res.data as any).messages ?? res.data);

        const chatRes = await api.get<Chat>(`/chat/${chatId}`);
        // console.log("the window  chatres", chatRes);
        // console.log("the window  user", user);
        // console.log("the window  chat id", chatId);

        const otherUser = chatRes.data.participants.find(
          (p: any) => p.id !== user.id
        );
        // console.log("the window  otherid", otherUser);

        setChatName(otherUser?.name || "Unknown");
        setOtherUserId(otherUser?.id || null);
      } catch (err) {
        console.error("Failed to load chat:", err);
      }
    };

    fetchData();
  }, [chatId, user]);
  // console.log("set message",messages);
  console.log("other user",otherUserId);

  // const handleNewMessage = useCallback(
  //   ({ chatId: incomingChatId, message }: any) => {
  //     if (incomingChatId === chatId) {
  //       setMessages((prev) => [...prev, message]);
  //     }
  //   },
  //   [chatId]
  // );

  // useEffect(() => {
  //   if (!chatId) return;

  //   socket.emit("join_chat", chatId);
  //   socket.on("new_message", handleNewMessage);

  //   return () => {
  //     socket.emit("leave_chat", chatId);
  //     socket.off("new_message", handleNewMessage);
  //   };
  // }, [chatId, socket, handleNewMessage]);

  useEffect(() => {
    if (!chatId || !socket) return;

    socket.emit("join_chat", chatId);

    // 🔥 Listen for new incoming messages
    socket.on("new_message", ({ chatId: incomingChatId, message }) => {
      if (incomingChatId === chatId) {
        setMessages((prev) => [...prev, message]);
      }
    });

    // Optional: typing indicators
    socket.on("user_typing", (userId) => {
      console.log(`✍️ User ${userId} is typing...`);
    });

    socket.on("user_stop_typing", (userId) => {
      console.log(`🛑 User ${userId} stopped typing`);
    });

    return () => {
      socket.emit("leave_chat", chatId);
      socket.off("new_message");
      socket.off("user_typing");
      socket.off("user_stop_typing");
    };
  }, [chatId, socket]);
  // useEffect(() => {
  //   if (!socket || !otherUserId) return;
  //   console.log("the other id", otherUserId);

  //   const handleUserOnline = (id: number | string) => {
  //     console.log("the coming id", id);

  //     if (id === otherUserId) {
  //       console.log("🟢 User came online:", id);
  //       setIsOnline(true);
  //     }
  //   };

  //   const handleUserOffline = (id: number | string) => {
  //     if (id === otherUserId) {
  //       console.log("🔴 User went offline:", id);
  //       setIsOnline(false);
  //     }
  //   };

  //   const handleOnlineUsersList = (onlineUsers: (string | number)[]) => {
  //     console.log("✅ Current online users:", onlineUsers);
  //     setIsOnline(onlineUsers.includes(otherUserId));
  //   };

  //   // 🔌 Listen to all 3 real-time events
  //   socket.on("user_online", handleUserOnline);
  //   socket.on("user_offline", handleUserOffline);
  //   socket.on("online_users_list", handleOnlineUsersList);

  //   // 🔄 Request current list from server
  //   socket.emit("get_online_users");

  //   return () => {
  //     socket.off("user_online", handleUserOnline);
  //     socket.off("user_offline", handleUserOffline);
  //     socket.off("online_users_list", handleOnlineUsersList);
  //   };
  // }, [socket, otherUserId]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  // console.log("loging the message", messages);

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
        otherUser={otherUserId||""}
      />

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            text={msg.text}
            sender={msg.sender?.id === user?.id ? "me" : "other"}
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
