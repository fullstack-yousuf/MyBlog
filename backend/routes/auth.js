// backend/routes/auth.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { db } = require("../database");
const { SECRET } = require("../middleware/auth");

const router = express.Router();

// Register
router.post("/register", (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: "All fields required" });

  db.get(`SELECT * FROM users WHERE email=?`, [email], async (err, row) => {
    if (row) return res.status(400).json({ error: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);

    db.run(
      `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`,
      [name, email, hashed],
      function (err2) {
        if (err2) return res.status(500).json({ error: err2.message });

        const user = { id: this.lastID, name, email };
        const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: "1d" });
        res.json({ token, user });
      }
    );
  });
});

// Login
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "All fields required" });

  db.get(`SELECT * FROM users WHERE email=?`, [email], async (err, user) => {
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: "1d" });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  });
});

// Current user
router.get("/me", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, SECRET);
    db.get(`SELECT id, name, email FROM users WHERE id=?`, [decoded.id], (err, user) => {
      if (err || !user) return res.status(401).json({ error: "User not found" });
      res.json(user);
    });
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
});

module.exports = router;


