

// app/lib/socket.ts
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = () => {
  if (typeof window === "undefined") {
    // ⛔ prevent socket creation during SSR
    return null;
  }

  if (!socket) {
    const token = localStorage.getItem("token"); // works in browser
    socket = io("http://localhost:5000", {
      transports: ["websocket"],
      auth: {
        token: token ? `Bearer ${token}` : undefined,
      },
    });

    socket.on("connect", () => {
      console.log("✅ Connected to socket with id:", socket!.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
    });

    // socket.on("connect_error", (err) => {
    //   console.error("⚠️ Socket connection error:", err.message);
    // });
  }

  return socket;
};
