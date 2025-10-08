
// backend/index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const http = require("http");
const { initSocket } = require("./socket.js");
const { initDB } = require("./database.js");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/chat", require("./routes/chat"));
app.use("/api/posts", require("./routes/post"));

// Init SQLite database (local file)
initDB();
console.log("✅ SQLite local DB initialized");

// Test route
app.get("/", (req, res) => {
  res.send("Hello from backend API (SQLite)");
});

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
initSocket(server);

server.listen(PORT, () =>
  console.log(`🚀 Server running with SQLite on port ${PORT}`)
);
