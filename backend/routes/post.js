const express = require("express");
const router = express.Router();
const { db } = require("../database"); // <-- our sqlite db.js
const authMiddleware = require("../middleware/auth");
const { getIO } = require("../socket");

// Create a new post
router.post("/", authMiddleware, (req, res) => {
  const { title, content } = req.body;
  const userId = req.user.id;

  db.run(
    `INSERT INTO posts (title, content, author_id, createdAt, updatedAt) VALUES (?, ?, ?, datetime('now'), datetime('now'))`,
    [title, content, userId],
    function (err) {
      if (err) return res.status(500).json({ message: err.message });

      const postId = this.lastID;

      getIO().emit("post_created", {
        postId,
        title,
        author: { id: userId, name: req.user.name },
      });

      res.status(201).json({
        id: postId,
        title,
        content,
        author: { id: userId, name: req.user.name },
      });
    }
  );
});

// Get all posts (with pagination + sorting + likes/comments)
router.get("/", authMiddleware, (req, res) => {
  const userId = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 6;
  const sortBy = req.query.sortBy || "createdAt";
  const order = req.query.order === "asc" ? "ASC" : "DESC";
  const offset = (page - 1) * limit;

  try {
    // ✅ Prevent SQL injection
  const validSortColumns = ["createdAt", "likeCount"];
const sortColumn =
  sortBy === "likeCount" ? "likeCount" : "createdAt";

const query = `
SELECT *
FROM (
  SELECT 
    p.id,
    p.title,
    p.content,
    p.createdAt,
    json_object(
      'id', u.id,
      'name', u.name,
      'email', u.email
    ) AS author,

    COALESCE(json_group_array(DISTINCT l.user_id), '[]') AS likes,

    EXISTS (
      SELECT 1 FROM likes 
      WHERE post_id = p.id AND user_id = ?
    ) AS likedByUser,

    COALESCE(
      (
        SELECT json_group_array(
          json_object(
            'id', c2.id,
            'text', c2.text,
            'createdAt', c2.createdAt,
            'user', json_object('id', cu2.id, 'name', cu2.name)
          )
        )
        FROM comments c2
        LEFT JOIN users cu2 ON cu2.id = c2.user_id
        WHERE c2.post_id = p.id
        ORDER BY c2.createdAt ASC
      ), '[]'
    ) AS comments,

    COUNT(DISTINCT l.user_id) AS likeCount
  FROM posts p
  JOIN users u ON p.author_id = u.id
  LEFT JOIN likes l ON l.post_id = p.id
  GROUP BY p.id
)
ORDER BY ${sortColumn} ${order}
LIMIT ? OFFSET ?;
`;


    db.all(query, [userId, limit, offset], (err, posts) => {
      if (err) {
        console.error("❌ SQL error:", err.message);
        return res
          .status(500)
          .json({ message: "Database error: " + err.message });
      }

      const formattedPosts = posts.map((post) => ({
        ...post,
        author: JSON.parse(post.author),
        likes: JSON.parse(post.likes),
        comments: JSON.parse(post.comments),
        likedByUser: !!post.likedByUser, // Convert 0/1 to boolean
      }));

      db.get(`SELECT COUNT(*) as total FROM posts`, (err2, row) => {
        if (err2) {
          console.error("❌ Count error:", err2.message);
          return res
            .status(500)
            .json({ message: "Count error: " + err2.message });
        }

        res.json({
          posts: formattedPosts,
          total: row.total,
          page,
          pages: Math.ceil(row.total / limit),
        });
      });
    });
  } catch (error) {
    console.error("❌ Unexpected server error:", error);
    res.status(500).json({ message: "Unexpected server error" });
  }
});

// Get my posts (with likeCount & commentCount only)
router.get("/my", authMiddleware, (req, res) => {
  const userId = req.user.id;

  const query = `
    SELECT 
      p.*, 
      u.name AS author_name,
      (
        SELECT COUNT(*) FROM likes WHERE post_id = p.id
      ) AS likeCount,
      (
        SELECT COUNT(*) FROM comments WHERE post_id = p.id
      ) AS commentCount
    FROM posts p
    JOIN users u ON p.author_id = u.id
    WHERE p.author_id = ?
    ORDER BY p.createdAt DESC
    
  `;

  db.all(query, [userId], (err, posts) => {
    if (err) return res.status(500).json({ message: err.message });

    const formatted = posts.map((p) => ({
      ...p,
      author: { id: p.author_id, name: p.author_name },
      likeCount: Number(p.likeCount) || 0,
      commentCount: Number(p.commentCount) || 0,
    }));

    res.json(formatted);
  });
});

// Update a post
router.put("/:id", authMiddleware, (req, res) => {
  const { title, content } = req.body;
  const postId = req.params.id;

  db.get(`SELECT * FROM posts WHERE id = ?`, [postId], (err, post) => {
    if (err) return res.status(500).json({ message: err.message });
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.author_id !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    db.run(
      `UPDATE posts SET title = ?, content = ?, updatedAt = datetime('now') WHERE id = ?`,
      [title || post.title, content || post.content, postId],
      (err) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json({ success: true, id: postId, title, content });
      }
    );
  });
});

// Delete a post
router.delete("/:id", authMiddleware, (req, res) => {
  const postId = req.params.id;

  db.get(`SELECT * FROM posts WHERE id = ?`, [postId], (err, post) => {
    if (err) return res.status(500).json({ message: err.message });
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.author_id !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    db.run(`DELETE FROM posts WHERE id = ?`, [postId], (err) => {
      if (err) return res.status(500).json({ message: err.message });
      res.json({ message: "Post deleted successfully" });
    });
  });
});

// Get a single post with comments
// ✅ GET a single post with author, likes, and comments
router.get("/:id",authMiddleware, (req, res) => {
  const postId = req.params.id;

  const currentUserId = req.user.id ; // 👈 fallback if using header for testing

  db.get(
    `SELECT p.id, p.title, p.content, p.createdAt, u.id AS authorId, u.name AS authorName, u.email AS authorEmail
     FROM posts p 
     JOIN users u ON p.author_id = u.id 
     WHERE p.id = ?`,
    [postId],
    (err, post) => {
      if (err) return res.status(500).json({ message: err.message });
      if (!post) return res.status(404).json({ message: "Post not found" });

      // Fetch comments
      db.all(
        `SELECT c.id, c.text, c.createdAt, u.id AS userId, u.name AS userName
         FROM comments c 
         JOIN users u ON c.user_id = u.id 
         WHERE c.post_id = ?
         ORDER BY c.createdAt ASC`,
        [postId],
        (err, comments) => {
          if (err) return res.status(500).json({ message: err.message });

          // Fetch likes
          db.all(
            `SELECT user_id FROM likes WHERE post_id = ?`,
            [postId],
            (err, likes) => {
              if (err) return res.status(500).json({ message: err.message });

              const likeCount = likes?.length ?? 0;
              const likedByUser = likes?.some((l) => l.user_id === currentUserId) ?? false;

              res.json({
                ...post,
                likeCount,
                likes,
                likedByUser,
                comments: comments.map((c) => ({
                  id: c.id,
                  text: c.text,
                  createdAt: c.createdAt,
                  user: {
                    id: c.userId,
                    name: c.userName,
                  },
                })),
              });
            }
          );
        }
      );
    }
  );
});


// Like/unlike a post
router.post("/:id/like", authMiddleware, (req, res) => {
  const postId = req.params.id;
  const userId = req.user.id;

  // Check if already liked
  db.get(
    `SELECT * FROM likes WHERE post_id = ? AND user_id = ?`,
    [postId, userId],
    (err, row) => {
      if (err) return res.status(500).json({ message: err.message });

      if (row) {
        // Unlike
        db.run(
          `DELETE FROM likes WHERE post_id = ? AND user_id = ?`,
          [postId, userId],
          (err) => {
            if (err) return res.status(500).json({ message: err.message });

            // getIO().emit("post_liked", {
            //   postId,
            //   user: { id: userId, name: req.user.name },
            // });

            res.json({ liked: false });
          }
        );
      } else {
        // Like
        db.run(
          `INSERT INTO likes (post_id, user_id) VALUES (?, ?)`,
          [postId, userId],
          (err) => {
            if (err) return res.status(500).json({ message: err.message });

            getIO().emit("post_liked", {
              postId,
              user: { id: userId, name: req.user.name },
            });

            res.json({ liked: true });
          }
        );
      }
    }
  );
});

// Add a comment
router.post("/:id/comment", authMiddleware, (req, res) => {
  const postId = req.params.id;
  const userId = req.user.id;
  const text = req.body.text;

  db.run(
    `INSERT INTO comments (post_id, user_id, text, createdAt) VALUES (?, ?, ?, datetime('now'))`,
    [postId, userId, text],
    function (err) {
      if (err) return res.status(500).json({ message: err.message });

      getIO().emit("post_commented", {
        postId,
        user: { id: userId, name: req.user.name },
        comment: text,
      });

      res.json({ id: this.lastID, postId, userId, text });
    }
  );
});

module.exports = router;
