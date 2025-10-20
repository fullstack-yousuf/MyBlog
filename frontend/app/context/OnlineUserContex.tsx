"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { getSocket } from "../lib/socket";

type OnlineUsersContextType = {
  onlineUsers: string[];
};

const OnlineUsersContext = createContext<OnlineUsersContextType>({
  onlineUsers: [],
});

export const OnlineUsersProvider = ({ children }: { children: React.ReactNode }) => {
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const socket = getSocket();

  useEffect(() => {
    if (!socket) return;

    const handleUserOnline = (id: string) => {
      setOnlineUsers((prev) =>
        prev.includes(id) ? prev : [...prev, id]
      );
    };

    const handleUserOffline = (id: string) => {
      setOnlineUsers((prev) => prev.filter((userId) => userId !== id));
    };

    const handleOnlineUsersList = (list: string[]) => {
      setOnlineUsers(list);
    };

    socket.on("user_online", handleUserOnline);
    socket.on("user_offline", handleUserOffline);
    socket.on("online_users_list", handleOnlineUsersList);

    socket.emit("get_online_users");

    return () => {
      socket.off("user_online", handleUserOnline);
      socket.off("user_offline", handleUserOffline);
      socket.off("online_users_list", handleOnlineUsersList);
    };
  }, [socket]);

  return (
    <OnlineUsersContext.Provider value={{ onlineUsers }}>
      {children}
    </OnlineUsersContext.Provider>
  );
};

export const useOnlineUsers = () => useContext(OnlineUsersContext);
