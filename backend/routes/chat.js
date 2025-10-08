const express = require("express");
const router = express.Router();
const { db } = require("../database");
const auth = require("../middleware/auth");

// -------------------
// Create/get private chat
// -------------------
router.post("/", auth, (req, res) => {
  const a = req.user.id;
  const b = req.body.participantId;
  if (!b) return res.status(400).json({ message: "participantId required" });

  db.get(
    `
    SELECT c.id, c.type FROM chats c
    JOIN chat_participants p1 ON c.id = p1.chat_id
    JOIN chat_participants p2 ON c.id = p2.chat_id
    WHERE c.type='private' AND p1.user_id=? AND p2.user_id=?`,
    [a, b],
    (err, chat) => {
      if (err) return res.status(500).json({ message: err.message });

      if (chat) {
        return res.json(chat);
      }

      // Create new private chat
      db.run(`INSERT INTO chats (type) VALUES ('private')`, function (err2) {
        if (err2) return res.status(500).json({ message: err2.message });
        const chatId = this.lastID;

        // db.run(
        //   `INSERT INTO chat_participants (chat_id,user_id,unread_count) VALUES (?,?,0),(?,?,0)`,
        //   [chatId, a, chatId, b],
        //   (err3) => {
        //     if (err3) return res.status(500).json({ message: err3.message });
        //     res.json({ id: chatId, type: "private" });
        //   }
        // );
        db.run(
          `INSERT INTO chat_participants (chat_id, user_id, unread_count) VALUES (?, ?, 0), (?, ?, 0)`,
          [chatId, a, chatId, b],
          (err3) => {
            if (err3) {
              console.error("Insert participants error:", err3);
              return res.status(500).json({ message: err3.message });
            }
            res.json({ id: chatId, type: "private" });
          }
        );
      });
    }
  );
});

// -------------------
// List chats for current user
// -------------------
router.get("/", auth, (req, res) => {
  const userId = req.user.id;

 db.all(
  `
  SELECT 
    c.id, 
    c.type, 
    c.updatedAt,
    json_group_array(
      json_object('id', u.id, 'name', u.name)
    ) as participants,
    (SELECT unread_count 
     FROM chat_participants 
     WHERE chat_id = c.id AND user_id = ?) as unread
  FROM chats c
  JOIN chat_participants cp ON cp.chat_id = c.id
  JOIN users u ON u.id = cp.user_id
  WHERE c.id IN (SELECT chat_id FROM chat_participants WHERE user_id = ?)
  GROUP BY c.id
  ORDER BY c.updatedAt DESC
  `,
  [userId, userId],
  (err, rows) => {
    if (err) return res.status(500).json({ message: err.message });

    const normalized = rows.map(r => ({
      ...r,
      participants: JSON.parse(r.participants),
    }));

    res.json(normalized);
  }
);

});


// -------------------
// Search users (exclude current)
// -------------------
router.get("/search/users", auth, (req, res) => {
  const q = `%${req.query.q || ""}%`;
  db.all(
    `SELECT id,name,email FROM users WHERE id != ? AND (name LIKE ? OR email LIKE ?)`,
    [req.user.id, q, q],
    (err, rows) => {
      if (err) return res.status(500).json({ message: err.message });
      res.json(rows);
    }
  );
});

// -------------------
// Get chat details
// -------------------
router.get("/:chatId", auth, (req, res) => {
  const { chatId } = req.params;
  const userId = req.user.id;

  db.all(
    `
    SELECT c.id,c.type,u.id as userId,u.name,u.email
    FROM chats c
    JOIN chat_participants cp ON cp.chat_id=c.id
    JOIN users u ON u.id=cp.user_id
    WHERE c.id=?`,
    [chatId],
    (err, rows) => {
      if (err) return res.status(500).json({ message: err.message });
      if (rows.length === 0)
        return res.status(404).json({ message: "Chat not found" });

      const isParticipant = rows.some((r) => r.userId == userId);
      if (!isParticipant) return res.status(403).json({ message: "Forbidden" });

      res.json({
        id: chatId,
        type: rows[0].type,
        participants: rows.map((r) => ({
          id: r.userId,
          name: r.name,
          email: r.email,
        })),
      });
    }
  );
});

// -------------------
// Get messages (with pagination)
// -------------------
router.get("/:chatId/messages", auth, (req, res) => {
  const { chatId } = req.params;
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.skip) || 0;
  const userId = req.user.id;

  // ensure participant
  db.get(
    `SELECT 1 FROM chat_participants WHERE chat_id=? AND user_id=?`,
    [chatId, userId],
    (err, row) => {
      if (err) return res.status(500).json({ message: err.message });
      if (!row) return res.status(403).json({ message: "Forbidden" });

      db.all(
        `
        SELECT m.id,m.text,m.createdAt,u.id as senderId,u.name as senderName
        FROM messages m
        JOIN users u ON m.sender_id=u.id
        WHERE m.chat_id=?
        ORDER BY m.createdAt ASC
        LIMIT ? OFFSET ?`,
        [chatId, limit, offset],
        (err2, rows) => {
          if (err2) return res.status(500).json({ message: err2.message });
          res.json({ messages: rows });
        }
      );
    }
  );
});

// -------------------
// Mark chat as read
// -------------------
router.post("/:chatId/read", auth, (req, res) => {
  const { chatId } = req.params;
  const userId = req.user.id;

  db.get(
    `SELECT 1 FROM chat_participants WHERE chat_id=? AND user_id=?`,
    [chatId, userId],
    (err, row) => {
      if (err) return res.status(500).json({ message: err.message });
      if (!row) return res.status(403).json({ message: "Forbidden" });

      // reset unread_count for this user
      db.run(
        `UPDATE chat_participants SET unread_count=0 WHERE chat_id=? AND user_id=?`,
        [chatId, userId],
        (err2) => {
          if (err2) return res.status(500).json({ message: err2.message });
          res.json({ success: true });
        }
      );
    }
  );
});

module.exports = router;
