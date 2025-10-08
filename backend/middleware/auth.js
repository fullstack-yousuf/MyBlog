// backend/middleware/auth.js
const jwt = require("jsonwebtoken");
const { db } = require("../database");

const SECRET = process.env.JWT_SECRET; // move to .env in production

function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Invalid token" });

  try {
    const decoded = jwt.verify(token, SECRET);
    // fetch user from db
    db.get(`SELECT id, name, email FROM users WHERE id=?`, [decoded.id], (err, user) => {
      if (err) return res.status(500).json({ error: dbErr.message });
      if (!user) return res.status(404).json({ error: "User not found" });
      req.user = user;
      next();
    });
  } catch (err) {
    return res.status(401).json({ error: "Token expired/invalid" });
  }
}

module.exports = auth;
module.exports.SECRET = SECRET;

