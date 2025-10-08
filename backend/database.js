// backend/database.js
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");

const db = new sqlite3.Database("app.db"); // persistent file

function initDB() {
  db.serialize(() => {
    // --- Create tables ---
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE,
      password TEXT,
      online INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP

    )`);

    db.run(`CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      content TEXT,
      author_id INTEGER,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      post_id INTEGER,
      UNIQUE(user_id, post_id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (post_id) REFERENCES posts(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      post_id INTEGER,
      text TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (post_id) REFERENCES posts(id)
    )`);
     // Chats
    db.run(`CREATE TABLE IF NOT EXISTS chats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT CHECK(type IN ('private','group')) DEFAULT 'private',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS chat_participants (
      chat_id INTEGER,
      user_id INTEGER,
      unread_count INTEGER DEFAULT 0,
      PRIMARY KEY (chat_id,user_id),
      FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chat_id INTEGER,
      sender_id INTEGER,
      text TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
      FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    // Table to track read receipts
    db.run(`CREATE TABLE IF NOT EXISTS message_reads (
      message_id INTEGER,
      user_id INTEGER,
      PRIMARY KEY (message_id,user_id),
      FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);


db.get(`SELECT COUNT(*) as count FROM users`, async (err, row) => {
  if (err) {
    console.error("Error checking users", err);
    return;
  }

  if (row.count === 0) {
    console.log("🌱 Seeding initial data...");

    try {
      // --- Create users ---
      const pass1 = await bcrypt.hash("password123", 10);
      const pass2 = await bcrypt.hash("secret456", 10);
      const pass3 = await bcrypt.hash("charlie789", 10);

      db.run(
        `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`,
        ["Alice", "alice@example.com", pass1],
        function (err1) {
          if (err1) return console.error(err1);
          const aliceId = this.lastID;

          db.run(
            `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`,
            ["Bob", "bob@example.com", pass2],
            function (err2) {
              if (err2) return console.error(err2);
              const bobId = this.lastID;

              db.run(
                `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`,
                ["Charlie", "charlie@example.com", pass3],
                function (err3) {
                  if (err3) return console.error(err3);
                  const charlieId = this.lastID;

                  // --- POSTS ---
                  const posts = [
                    {
                      title: "Hello World",
                      content: "This is Alice's first post about web development.",
                      author_id: aliceId,
                      createdAt: "2024-01-10T08:30:00Z",
                    },
                    {
                      title: "Exploring Node.js",
                      content: "Bob shares his insights on building scalable APIs.",
                      author_id: bobId,
                      createdAt: "2024-03-05T12:00:00Z",
                    },
                    {
                      title: "Design Patterns in React",
                      content: "Charlie explains reusable component patterns.",
                      author_id: charlieId,
                      createdAt: "2024-06-22T15:15:00Z",
                    },
                    {
                      title: "AI Trends 2025",
                      content: "Alice discusses the role of AI in the future of work.",
                      author_id: aliceId,
                      createdAt: "2024-09-14T09:00:00Z",
                    },
                    {
                      title: "Building Scalable APIs",
                      content: "Bob talks about optimizing backend performance.",
                      author_id: bobId,
                      createdAt: "2024-12-01T19:30:00Z",
                    },
                  ];

                  posts.forEach((post, i) => {
                    db.run(
                      `INSERT INTO posts (title, content, author_id, createdAt) VALUES (?, ?, ?, ?)`,
                      [post.title, post.content, post.author_id, post.createdAt],
                      function (errPost) {
                        if (errPost) return console.error(errPost);
                        const postId = this.lastID;

                        // Add likes + comments for each
                        switch (i) {
                          case 0: // Hello World
                            db.run(`INSERT INTO likes (user_id, post_id) VALUES (?, ?)`, [bobId, postId]);
                            db.run(`INSERT INTO comments (user_id, post_id, text) VALUES (?, ?, ?)`, [
                              bobId,
                              postId,
                              "Great start Alice!",
                            ]);
                            break;

                          case 1: // Node.js
                            db.run(`INSERT INTO likes (user_id, post_id) VALUES (?, ?)`, [aliceId, postId]);
                            db.run(`INSERT INTO likes (user_id, post_id) VALUES (?, ?)`, [charlieId, postId]);
                            db.run(`INSERT INTO comments (user_id, post_id, text) VALUES (?, ?, ?)`, [
                              aliceId,
                              postId,
                              "Very useful tips Bob!",
                            ]);
                            break;

                          case 2: // React
                            db.run(`INSERT INTO likes (user_id, post_id) VALUES (?, ?)`, [aliceId, postId]);
                            db.run(`INSERT INTO likes (user_id, post_id) VALUES (?, ?)`, [bobId, postId]);
                            db.run(`INSERT INTO comments (user_id, post_id, text) VALUES (?, ?, ?)`, [
                              bobId,
                              postId,
                              "I learned a lot from this!",
                            ]);
                            break;

                          case 3: // AI Trends
                            db.run(`INSERT INTO likes (user_id, post_id) VALUES (?, ?)`, [charlieId, postId]);
                            db.run(`INSERT INTO likes (user_id, post_id) VALUES (?, ?)`, [bobId, postId]);
                            db.run(`INSERT INTO comments (user_id, post_id, text) VALUES (?, ?, ?)`, [
                              charlieId,
                              postId,
                              "Amazing insights Alice!",
                            ]);
                            break;

                          case 4: // APIs
                            db.run(`INSERT INTO likes (user_id, post_id) VALUES (?, ?)`, [aliceId, postId]);
                            db.run(`INSERT INTO likes (user_id, post_id) VALUES (?, ?)`, [charlieId, postId]);
                            db.run(`INSERT INTO likes (user_id, post_id) VALUES (?, ?)`, [bobId, postId]);
                            db.run(`INSERT INTO comments (user_id, post_id, text) VALUES (?, ?, ?)`, [
                              aliceId,
                              postId,
                              "Love this explanation!",
                            ]);
                            db.run(`INSERT INTO comments (user_id, post_id, text) VALUES (?, ?, ?)`, [
                              charlieId,
                              postId,
                              "Super helpful for backend devs.",
                            ]);
                            break;
                        }
                      }
                    );
                  });

                  console.log("✅ 3 users and 5 posts (with likes & comments) seeded successfully!");
                }
              );
            }
          );
        }
      );
    } catch (error) {
      console.error("Error during seeding:", error);
    }
  } else {
    console.log("✅ Users already exist, skipping seed.");
  }
});
  });
}

module.exports = { db, initDB };
