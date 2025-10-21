"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { getSocket } from "../lib/socket";

type UnreadContextType = {
  hasUnread: boolean;
  setHasUnread: (val: boolean) => void;
};

const UnreadContext = createContext<UnreadContextType>({
  hasUnread: false,
  setHasUnread: () => {},
});

export const UnreadProvider = ({ children }: { children: React.ReactNode }) => {
  const [hasUnread, setHasUnread] = useState(false);
  const socket = getSocket();
  const { user } = useAuth();

  useEffect(() => {
    if (!socket || !user) return;

    /** ✅ Listen for backend updates when any chat's unread count changes */
    const handleUnread = (payload: { hasUnread: boolean }) => {
      setHasUnread(payload.hasUnread);
    };

    /** ✅ If user sends a message, mark global unread as false (they’re the sender) */
    const handleMessageSent = (payload: { senderId: string }) => {
      if (payload.senderId === user.id) {
        setHasUnread(false);
      }
    };

    /** ✅ Listen for events */
    socket.on("new_unread_global", handleUnread);
    socket.on("message:sent", handleMessageSent);

    /** ✅ Ask for initial unread status from backend */
    socket.emit("get_global_unread", user.id, (hasUnread: boolean) => {
      setHasUnread(hasUnread);
    });

    /** Cleanup on unmount */
    return () => {
      socket.off("new_unread_global", handleUnread);
      socket.off("message:sent", handleMessageSent);
    };
  }, [socket, user]);

  return (
    <UnreadContext.Provider value={{ hasUnread, setHasUnread }}>
      {children}
    </UnreadContext.Provider>
  );
};

export const useUnread = () => useContext(UnreadContext);

