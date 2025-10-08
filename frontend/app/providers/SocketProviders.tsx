"use client";
import { ReactNode, useEffect } from "react";
import { getSocket } from "@/app/lib/socket";

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  useEffect(() => {
    const socket = getSocket();
    if(!socket)return;
console.log("socket trigert",socket);

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
    });

    // cleanup → just remove event listeners, don’t disconnect globally
    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);

  return <>{children}</>;
};
