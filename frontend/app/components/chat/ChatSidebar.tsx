"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { getSocket } from "../../lib/socket";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";

type Chat = {
  chatId: string;
  name: string;
  lastMessage?: string;
  unread?: number;
};

type SearchUser = {
  userId: string;
  name: string;
};

type Props = {
  onClose?: () => void;
  onSelectChat: (chatId: string) => void;
  activeChat: string | null;
};

export default function ChatSidebar({ onClose, onSelectChat, activeChat }: Props) {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [chats, setChats] = useState<Chat[]>([]);
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const socket = getSocket();

  /** 🔹 1. Fetch user chats once user is loaded */
  useEffect(() => {
    if (!user) return;

    const fetchChats = async () => {
      try {
        const { data } = await api.get<Chat[]>("/chat");
        console.log("the char data",data);
        
        setChats(
          data.map((c) => ({
            chatId: c.chatId,
            name: c.name || "Unknown",
            lastMessage: c.lastMessage || "",
            unread: c.unread ?? 0,
          }))
        );
      } catch (err) {
        console.error("❌ Failed to fetch chats:", err);
      }
    };

    fetchChats();
  }, [user]);

  /** 🔹 2. Debounced user search */
  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (!search.trim()) {
        setSearchResults([]);
        return;
      }

      try {
        const { data } = await api.get<SearchUser[]>(`/chat/search/users`, {
          params: { q: search },
        });
        setSearchResults(data.map((u) => ({ userId: u.userId, name: u.name })));
      } catch (err) {
        console.error("❌ User search failed:", err);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [search]);

  /** 🔹 3. Mark chat as read (local + backend) */
  const markChatAsRead = useCallback(async (chatId: string) => {
    try {
      await api.post(`/chat/${chatId}/read`);
      setChats((prev) =>
        prev.map((chat) =>
          chat.chatId === chatId ? { ...chat, unread: 0 } : chat
        )
      );
    } catch (err) {
      console.error("❌ Failed to mark chat as read:", err);
    }
  }, []);

  /** 🔹 4. Handle WebSocket unread updates */
  useEffect(() => {
    if (!socket) return;

    const handleUnreadUpdate = ({ chatId, unread }: { chatId: string; unread: number }) => {
      setChats((prev) =>
        prev.map((chat) =>
          chat.chatId === chatId ? { ...chat, unread } : chat
        )
      );
    };

    socket.on("unread_update", handleUnreadUpdate);
    return () => {
      socket.off("unread_update", handleUnreadUpdate);
    };
  }, [socket]);

  /** 🔹 5. Create or get chat, then open it */
  const createOrGetChat = useCallback(
    async (participantId: string) => {
      try {
        const { data } = await api.post<{ id: string }>("/chat", { participantId });
        const chatId = data.id;

        // Immediately show or refresh that chat
        onSelectChat(chatId);
        markChatAsRead(chatId);
        onClose?.();
      } catch (err) {
        console.error("❌ Failed to create/get chat:", err);
      }
    },
    [onSelectChat, onClose, markChatAsRead]
  );

  /** 🔹 6. Decide which list to show */
  const list = useMemo(() => (search ? searchResults : chats), [search, chats, searchResults]);

  return (
    <div className="flex flex-col h-full">
      {/* 🔍 Search bar */}
      <div className="p-3 bg-gray-100">
        <input
          type="text"
          placeholder="🔍 Search friends..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-400 focus:outline-none"
        />
      </div>

      {/* 💬 Chat List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-blue-50">
        {list.map((item) =>
          "userId" in item ? (
            // ➕ Search result
            <div
              key={item.userId}
              onClick={() => createOrGetChat(item.userId)}
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer bg-white hover:bg-gray-100 transition shadow-sm"
            >
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-gray-700 font-medium">
                  {item.name?.charAt(0).toUpperCase() || "?"}
                </span>
              </div>
              <p className="font-medium text-gray-900">{item.name}</p>
            </div>
          ) : (
            // 💬 Existing chat
            <div
              key={item.chatId}
              onClick={() => {
                onSelectChat(item.chatId);
                markChatAsRead(item.chatId);
                onClose?.();
              }}
              className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition shadow-sm border ${
                activeChat === item.chatId
                  ? "bg-blue-100 border-blue-400"
                  : "bg-white border-gray-200 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-700 font-medium">
                    {item.name?.charAt(0).toUpperCase() || "?"}
                  </span>
                </div>

                <div className="flex flex-col">
                  <p className="font-medium text-gray-900">{item.name}</p>
                  {item.lastMessage && (
                    <p
                      className="text-sm text-gray-500 truncate max-w-[160px]"
                      title={item.lastMessage}
                    >
                      {item.lastMessage}
                    </p>
                  )}
                </div>
              </div>

              {item.unread && item.unread > 0 && (
                <span className="bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                  {item.unread}
                </span>
              )}
            </div>
          )
        )}

        {list.length === 0 && (
          <p className="text-gray-400 text-sm text-center mt-4">
            {search ? "No users found" : "No chats yet"}
          </p>
        )}
      </div>
    </div>
  );
}
