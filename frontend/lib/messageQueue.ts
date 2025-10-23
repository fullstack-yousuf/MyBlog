// lib/messageQueue.ts
import localforage from "localforage";

const MESSAGE_QUEUE_KEY = "offline_messages";

interface QueuedMessage {
  chatId: string;
  text: string;
  senderId: string;
  createdAt?: string;
}

export const enqueueMessage = async (msg: QueuedMessage) => {
  const queue = (await localforage.getItem<QueuedMessage[]>(MESSAGE_QUEUE_KEY)) || [];
  queue.push({ ...msg, createdAt: msg.createdAt ?? new Date().toISOString() });
  await localforage.setItem(MESSAGE_QUEUE_KEY, queue);
  console.log("💾 Message queued offline:", msg);
};

export const flushQueuedMessages = async (socket: any) => {
  const queue = (await localforage.getItem<QueuedMessage[]>(MESSAGE_QUEUE_KEY)) || [];
  console.log("this is a Q ",queue);
  
  if (!queue.length) {
    console.log("🟢 No queued messages to flush");
    return;
  }

  console.log(`🚀 Flushing ${queue.length} offline messages...`);
  for (const msg of queue) {
    socket?.emit("chat:message", { chatId: msg.chatId, text: msg.text, senderId: msg.senderId });
    console.log("this is the loop message", msg);
  }

  await localforage.removeItem(MESSAGE_QUEUE_KEY);
  console.log("✅ Flushed all offline messages from queue");
};

export const getQueuedMessages = async () => {
  return (await localforage.getItem<QueuedMessage[]>(MESSAGE_QUEUE_KEY)) || [];
};

export const clearQueuedMessages = async () => {
  await localforage.removeItem(MESSAGE_QUEUE_KEY);
};
// // lib/messageQueue.ts
// // const MESSAGE_QUEUE_KEY = "offline_messages";

// // export const enqueueMessage = async (msg: any) => {
// //   const queue = JSON.parse(localStorage.getItem(MESSAGE_QUEUE_KEY) || "[]");
// //   queue.push(msg);
// //   localStorage.setItem(MESSAGE_QUEUE_KEY, JSON.stringify(queue));
// // };
// // console.log("the enqueue message", enqueueMessage);


// // export const flushQueuedMessages = async (socket: any) => {
// //   const queue = JSON.parse(localStorage.getItem(MESSAGE_QUEUE_KEY) || "[]");
// //   if (!queue.length) return;

// //   for (const msg of queue) {
// //     // socket.emit("send_message", { chatId: msg.chatId, text: msg.text, senderId: msg.senderId });

// //     socket?.emit("chat:message", { chatId: msg.chatId, text: msg.text });
// //   }

// //   console.log(`✅ Flushed ${queue.length} offline messages`);
// //   localStorage.removeItem(MESSAGE_QUEUE_KEY);
// // };
// // src/lib/messageQueue.ts
// import localforage from "localforage";

// const QUEUE_KEY = "chat_outbox_v1";

// // push a message to outbox
// export const enqueueMessage = async (payload: any) => {
//   const q = (await localforage.getItem<any[]>(QUEUE_KEY)) ?? [];
//   q.push({ ...payload, __queuedAt: Date.now() });
//   await localforage.setItem(QUEUE_KEY, q);
// };

// // get and clear queue (returns array)
// export const flushQueuedMessages = async (): Promise<any[]> => {
//   const q = (await localforage.getItem<any[]>(QUEUE_KEY)) ?? [];
//   await localforage.removeItem(QUEUE_KEY);
//   return q;
// };

// // peek
// export const peekQueue = async () => (await localforage.getItem<any[]>(QUEUE_KEY)) ?? [];
