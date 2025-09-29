const express = require("express");
const cors = require("cors");

const authRoutes = require("./models/routes/auth");
const userRoutes = require("./models/routes/users");
const chatRoutes = require("./models/routes/chats");
const messageRoutes = require("./models/routes/messages");

const app = express();

app.use(cors());
app.use(express.json());

// роуты
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);

module.exports = app; // экспортируем только app
