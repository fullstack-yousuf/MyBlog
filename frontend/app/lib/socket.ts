// app/lib/socket.ts
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = () => {
  if (typeof window === "undefined") return null; // ⛔ no socket during SSR

  if (!socket) {
    const token = localStorage.getItem("token");

    if (token) {
      console.log("✅ Token exists:", token);
    } else {
      console.log("❌ No token found");
    }

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

    socket.on("connect_error", (err) => {
      console.error("⚠️ Socket connection error:", err.message);
    });
  }

  return socket;
};


// // app/lib/socket.ts
// import { io, Socket } from "socket.io-client";

// let socket: Socket | null = null;

// export const getSocket = () => {
//   if (typeof window === "undefined") {
//     // ⛔ prevent socket creation during SSR
//     return null;
//   }

//   if (!socket) {
//     const token = localStorage.getItem("token");
//    if (token) {
//   console.log("✅ Token exists:", token);
// } else {
//   console.log("❌ No token found");
// }
//     // works in browser
//     socket = io("http://localhost:5000", {
//       transports: ["websocket"],
//       auth: {
//         token: token|| undefined,
//       },
//     });

//     socket.on("connect", () => {
//       console.log("✅ Connected to socket with id:", socket!.id);
//     });

//     socket.on("disconnect", (reason) => {
//       console.log("❌ Socket disconnected:", reason);
//     });

//     // socket.on("connect_error", (err) => {
//     //   console.error("⚠️ Socket connection error:", err.message);
//     // });
//   }

//   return socket;
// };
