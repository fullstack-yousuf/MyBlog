// app/lib/socket.ts
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = () => {
  if (typeof window === "undefined") return null; // ⛔ no socket during SSR

  if (!socket) {
    const token = localStorage.getItem("token");

    if (!token) {
      console.log("❌ No token found");
    }
    console.log("B ", socket);

    socket = io("http://localhost:5000", {  
      transports: ["websocket"],
      auth: {
        token, // ✅ send raw token only
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
