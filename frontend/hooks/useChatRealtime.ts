// src/hooks/useChatRealtime.ts
import { useEffect } from "react";
import { getSocket } from "@/lib/socket";
import { flushQueuedMessages } from "@/lib/messageQueue";
import queryClient from "./queryClient";

export const useChatRealtime = (chatId?: string) => {
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const onConnect = async () => {
      console.log("🔌 Reconnected, flushing offline messages...");
      await flushQueuedMessages(socket);

      // Optional: refetch latest chat after flush
      if (chatId) {
        queryClient.invalidateQueries({ queryKey: ["chat", chatId] });
      }
    };

    const onMessage = (msg: any) => {
      queryClient.setQueryData(["chat", chatId], (old: any) => {
        if (!old) return { messages: [msg] };
        return { ...old, messages: [...(old.messages ?? []), msg] };
      });
    };

    socket.on("connect", onConnect);
    socket.on("chat:message", onMessage);
    window.addEventListener("online", onConnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("chat:message", onMessage);
      window.removeEventListener("online", onConnect);
    };
  }, [chatId]);
};
// // src/hooks/useChatRealtime.ts
// import { useEffect } from "react";
// import { getSocket } from "@/lib/socket";
// import { flushQueuedMessages } from "@/lib/messageQueue"; // renamed to be consistent
// import { queryClient } from "@/hooks/queryClient";

// export const useChatRealtime = (chatId?: string) => {
//   useEffect(() => {
//     const socket = getSocket();
//     if (!socket) return;

//     // 🔄 When socket reconnects or user comes online
//     const handleReconnect = async () => {
//       console.log("🔁 Socket connected or online again — flushing offline messages");
//       await flushQueuedMessages(socket);
//       if (chatId) {
//         queryClient.invalidateQueries({ queryKey: ["chat", chatId] });
//       }
//     };

//     // 🧠 Handle incoming real-time messages
//     const handleIncomingMessage = (msg: any) => {
//       if (!msg.chatId || msg.chatId !== chatId) return;
//       queryClient.setQueryData(["chat", chatId], (old: any) => {
//         if (!old) return { messages: [msg] };
//         return {
//           ...old,
//           messages: [...(old.messages ?? []), msg],
//         };
//       });
//     };

//     // 🧩 Attach listeners
//     socket.on("connect", handleReconnect);
//     socket.on("chat:message", handleIncomingMessage);
//     window.addEventListener("online", handleReconnect);

//     // 🧹 Cleanup listeners on unmount
//     return () => {
//       socket.off("connect", handleReconnect);
//       socket.off("chat:message", handleIncomingMessage);
//       window.removeEventListener("online", handleReconnect);
//     };
//   }, [chatId]);
// };
// // // src/hooks/useChatRealtime.ts
// // import { useEffect } from "react";
// // import { getSocket } from "@/lib/socket";
// // import { drainQueue } from "@/lib/messageQueue";
// // import queryClient from "./queryClient";

// // export const useChatRealtime = (chatId?: string) => {
// //   useEffect(() => {
// //     const socket = getSocket();
// //     if (!socket) return;

// //     const onConnect = async () => {
// //       // flush queued messages
// //       const queued = await drainQueue();
// //       queued.forEach((msg) => {
// //         socket.emit("chat:message", msg);
// //       });
// //       // optionally refetch chat list
// //       queryClient.invalidateQueries({ queryKey: ["chat", chatId] });
// //     };

// //     const onMessage = (msg: any) => {
// //       // update react query cache for chat messages
// //       queryClient.setQueryData(["chat", chatId], (old: any) => {
// //         if (!old) return old;
// //         return { ...old, messages: [...(old.messages ?? []), msg] };
// //       });
// //     };

// //     socket.on("connect", onConnect);
// //     socket.on("chat:message", onMessage);

// //     window.addEventListener("online", onConnect);

// //     return () => {
// //       socket.off("connect", onConnect);
// //       socket.off("chat:message", onMessage);
// //       window.removeEventListener("online", onConnect);
// //     };
// //   }, [chatId]);
// // };
