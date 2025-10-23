"use client";
import React, { useState, useEffect, FormEvent } from "react";
import { getSocket } from "@/lib/socket";
import { queryClient } from "@/hooks/queryClient";
import { enqueueMessage, flushQueuedMessages } from "@/lib/messageQueue";

interface MessageInputProps {
  chatId: string;
  userId: string;
}

const MessageInput: React.FC<MessageInputProps> = ({ chatId, userId }) => {
  const [text, setText] = useState("");
  const socket = getSocket();

  // 🟢 Handle typing indicator
  useEffect(() => {
    if (!socket) return;
    let typingTimeout: NodeJS.Timeout;

    if (text) {
      socket.emit("typing", { chatId, userId });
      typingTimeout = setTimeout(() => {
        socket.emit("stop_typing", { chatId, userId });
      }, 2000);
    }

    return () => clearTimeout(typingTimeout);
  }, [text, chatId, userId, socket]);

  // 🟢 Auto-flush queued messages when online again
  useEffect(() => {
    const handleReconnect = async () => {
      console.log("🔄 Connection restored, flushing queued messages...");
      await flushQueuedMessages(socket);
    };

    window.addEventListener("online", handleReconnect);
    if (socket) socket.on("connect", handleReconnect);

    return () => {
      window.removeEventListener("online", handleReconnect);
      if (socket) socket.off("connect", handleReconnect);
    };
  }, [socket]);

  // 🟢 Send Message
  const sendChatMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const newMessage = {
      // id: `temp-${Date.now()}`,
      chatId,
      text,
      senderId: userId,
      // createdAt: new Date().toISOString(),
    };

    // Optimistic UI update
    queryClient.setQueryData(["chat", chatId], (old: any) => {
      if (!old) return { messages: [newMessage] };
      return {
        ...old,
        messages: [...(old.messages ?? []), newMessage],
      };
    });

    // Try sending via socket
    if (navigator.onLine && socket?.connected) {
          socket.emit("send_message", { chatId, text, senderId: userId });

      // socket.emit("chat:message", { chatId, text });
    } else {
      console.warn("📡 Offline - queued message for later send");
      console.log("the enqueue message in the input ", await enqueueMessage(newMessage));
      // await enqueueMessage(newMessage);
    }

    setText("");
    socket?.emit("stop_typing", { chatId, userId });
  };

  return (
    <form onSubmit={sendChatMessage} className="flex items-center gap-2 p-1">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a message..."
        className="flex-1 px-4 py-2 rounded-lg bg-white border border-gray-400 focus:outline-none"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
      >
        Send ➤
      </button>
    </form>
  );
};

export default MessageInput;
// "use client";
// import React, { useState, useEffect } from "react";
// import { getSocket } from "../../lib/socket"; // 👈 your socket instance
// import { queryClient } from "@/hooks/queryClient";
// import { enqueueMessage } from "@/lib/messageQueue";

// interface MessageInputProps {
//   chatId: string;
//   userId: string;
// }

// const MessageInput: React.FC<MessageInputProps> = ({ chatId, userId }) => {
//   const [text, setText] = useState("");
//   const socket = getSocket();
//   if (!socket) return;

//   useEffect(() => {
//     let typingTimeout: NodeJS.Timeout;

//     if (text) {
//       socket.emit("typing", { chatId, userId });
//       typingTimeout = setTimeout(() => {
//         socket.emit("stop_typing", { chatId, userId });
//       }, 2000); // stops after 2s of no typing
//     }

//     return () => clearTimeout(typingTimeout);
//   }, [text, chatId, userId]);

//   // const handleSubmit = (e: React.FormEvent) => {
//   //   e.preventDefault();
//   //   if (!text.trim()) return;

//   //   socket.emit("send_message", { chatId, text, senderId: userId });
//   //   setText("");
//   //   socket.emit("stop_typing", { chatId, userId });
//   // };

//  const sendChatMessage = async (e: React.FormEvent) => {
//   const socket = getSocket();
//   const temp = { id: `temp-${Date.now()}`, text,  senderId: userId, createdAt: new Date().toISOString() };

//   // optimistic update of chat messages UI
//   queryClient.setQueryData(["chat", chatId], (old: any) => {
//     if (!old) return old;
//     return { ...old, messages: [...(old.messages ?? []), temp] };
//   });

//   if (navigator.onLine && socket?.connected) {
//     socket.emit("chat:message", { chatId, text });
//   } else {
//     // enqueue for later
//     await enqueueMessage({ chatId, text, senderId: userId });
//   }
// };

//   return (
//     // <form onSubmit={handleSubmit} className="flex items-center  gap-2 p-1 ">
//     <form onSubmit={sendChatMessage} className="flex items-center  gap-2 p-1 ">
//       <input
//         type="text"
//         value={text}
//         onChange={(e) => setText(e.target.value)}
//         placeholder="Type a message..."
//         className="flex-1 px-4 py-2 rounded-lg bg-white border-gray-400 border focus:outline-none"
//       />
//       <button
//         type="submit"
//         className="px-4 py-2 bg-blue-500 text-white rounded-lg"
//       >
//         Send ➤
//       </button>
//     </form>
//   );
// };

// export default MessageInput;