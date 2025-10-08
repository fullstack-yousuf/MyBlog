const { Server } = require("socket.io");
const { db } = require("./database");
const jwt = require("jsonwebtoken");

let io;
const onlineUsers = new Map();


function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:3000", // frontend
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("✅ New client connected:", socket.id);

  const userId = socket.handshake.auth?.userId;
    const token = socket.handshake.auth?.token?.split(" ")[1];
  if (!token) return;
 
   try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;  // ✅ get userId from token

    onlineUsers.set(userId, socket.id);
    socket.broadcast.emit("user_online", userId);

   
  } catch (err) {
    console.error("Invalid token:", err.message);
  }

  // ✅ join chat room
  socket.on("join_chat", (chatId) => {
    socket.join(`chat_${chatId}`);
  });

  // ✅ leave chat room
  socket.on("leave_chat", (chatId) => {
    socket.leave(`chat_${chatId}`);
  });

  // ✅ send new message
  socket.on("send_message", ({ chatId, text, senderId }) => {
    const createdAt = new Date().toISOString();

    // save to DB
    db.run(
      `INSERT INTO messages (chat_id, sender_id, text, createdAt) VALUES (?,?,?,?)`,
      [chatId, senderId, text, createdAt],
      function (err) {
        if (err) {
          console.error("DB insert error:", err);
          return;
        }

        const message = {
          id: this.lastID,
          chatId,
          text,
          senderId, 
          createdAt,
        };
         // ✅ Increment unread_count for all other participants
      db.run(
        `UPDATE chat_participants
         SET unread_count = unread_count + 1
         WHERE chat_id=? AND user_id != ?`,
        [chatId, senderId],
        (err2) => {
          if (err2) console.error("Unread update error:", err2);
        }
      );

        // broadcast to chat room
        io.to(`chat_${chatId}`).emit("new_message", { chatId, message });
       // ✅ Notify other participants about new unread counts
      db.all(
        `SELECT user_id, unread_count FROM chat_participants WHERE chat_id=?`,
        [chatId],
        (err3, rows) => {
          if (!err3 && rows) {
            rows.forEach((row) => {
              if (row.user_id !== senderId) {
                const targetSocket = onlineUsers.get(row.user_id);
                if (targetSocket) {
                  io.to(targetSocket).emit("unread_update", {
                    chatId,
                    unread: row.unread_count,
                  });
                }
              }
            });
          }
        }
      );
    }
  );
});

  // ✅ typing indicators
  socket.on("typing", ({ chatId, userId }) => {
    socket.to(`chat_${chatId}`).emit("typing", { userId });
  });
  socket.on("stop_typing", ({ chatId, userId }) => {
    socket.to(`chat_${chatId}`).emit("stop_typing", { userId });
  });

  // ✅ check online
  socket.on("check_online", (otherUserId, callback) => {
const isOnline = onlineUsers.has(otherUserId);
callback(isOnline);
  });

    // cleanup on disconnect
    socket.on("disconnect", () => {
        // if (userId) {
      onlineUsers.delete(userId);
      socket.broadcast.emit("user_offline", userId);
    // }
    console.log("User disconnected:", socket.id);
  });

  });
}

function getIO() {
  if (!io) throw new Error("❌ Socket.io not initialized!");
  return io;
}

module.exports = { initSocket, getIO };
