"use client";
import { useEffect, useState } from "react";
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

interface ChatResponse {
  id: string;
  participants: { id: string; name: string }[];
  lastMessage?: { text: string };
  unread: number;
}
interface SearchResponse {
  userId: string;
  name: string;
}
export default function ChatSidebar({
  onClose,
  onSelectChat,
  activeChat,
}: Props) {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [chats, setChats] = useState<Chat[]>([]);
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const socket = getSocket();
  const token = localStorage.getItem("token");

  if (!socket) return;
  // ✅ fetch chats for logged-in user
  useEffect(() => {
    if (!user) return;

    const fetchChats = async () => {
      try {
        const res = await api.get<ChatResponse[]>("/chat");

        const normalized = res.data.map((c: any) => {
          console.log("chat data", res.data);

          const otherUser = c.participants.find((p: any) => p.id !== user.id);
          return {
            chatId: c.id,
            name: otherUser?.name || "Unknown",
            lastMessage: c.lastMessage?.text || "",
            unread: c.unread,
          };
        });

        setChats(normalized);
      } catch (err) {
        console.error("Failed to fetch chats:", err);
      }
    };

    fetchChats();
  }, [user]);

  // ✅ search users
  useEffect(() => {
    const handler = setTimeout(async () => {
      if (!search) {
        setSearchResults([]);
        return;
      }
      try {
        const res = await api.get<SearchResponse[]>(`chat/search/users`,{params: { q: search },});
        setSearchResults(
          res.data.map((u: any) => ({ userId: u.id, name: u.name }))
        );
      } catch (err) {
        console.error("Failed to search users:", err);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [search]);

  // ✅ mark as read
  const markChatAsRead = async (chatId: string) => {
    try {
      await api.post(`/chat/${chatId}/read`);

      setChats((prev) =>
        prev.map((chat) =>
          chat.chatId === chatId ? { ...chat, unread: 0 } : chat
        )
      );
    } catch (err) {
      console.error("Failed to mark chat as read:", err);
    }
  };

  // ✅ listen to socket updates
  useEffect(() => {
    socket.on("unread_update", ({ chatId, unread }) => {
      setChats((prev) =>
        prev.map((chat) =>
          chat.chatId === chatId ? { ...chat, unread } : chat
        )
      );
    });

    return () => {
      socket.off("unread_update");
    };
  }, [socket]);

  async function createOrGetChat(participantId: string) {
    try {
      const res = await api.post<{ id: string }>("/chat",{ participantId });
      const chatId = res.data.id;
      onSelectChat(chatId);
      markChatAsRead(chatId);
      onClose?.();
    } catch (err) {
      console.error("Failed to create/get chat:", err);
      throw err;
    }
  }

  const list = search.length > 0 ? searchResults : chats;
  console.log("list log ", list);

  return (
    <div className="flex flex-col h-full ">
      <div className="p-3 bg-gray-100">
        <input
          type="text"
          placeholder="🔍 Search friends..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-400 focus:outline-none"
        />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-blue-50">
        {list.map((item) =>
          "userId" in item ? (
            // 👉 New chat (search result)
            <div
              key={item.userId}
              onClick={() => createOrGetChat(item.userId)}
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer bg-white hover:bg-gray-100 transition shadow-sm"
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-gray-700 font-medium">
                  {item.name?.charAt(0).toUpperCase() || "?"}
                </span>
              </div>
              {/* Name */}
              <p className="font-medium text-gray-900">{item.name}</p>
            </div>
          ) : (
            // 👉 Existing chat
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
              {/* Left side: avatar + name + last message */}
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-700 font-medium">
                    {item.name?.charAt(0).toUpperCase() || "?"}
                  </span>
                </div>

                {/* Name + Last Message */}
                <div className="flex flex-col">
                  <p className="font-medium text-gray-900">{item.name}</p>
                  {item.lastMessage && (
                    <p
                      className="text-sm/3 text-gray-500 truncate max-w-[160px]"
                      title={item.lastMessage}
                    >
                      {item.lastMessage}
                    </p>
                  )}
                </div>
              </div>

              {/* Right side: unread badge */}
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
