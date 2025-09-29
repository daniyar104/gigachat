const express = require("express");
const Chat = require("../Chat");
const auth = require("../utils/authMiddleware");

const router = express.Router();

// Создать чат
router.post("/", auth, async (req, res) => {
  const { name, participants } = req.body;
  const chat = new Chat({ name, participants: [req.user.id, ...participants] });
  await chat.save();
  res.json(chat);
});

// Все чаты пользователя
router.get("/", auth, async (req, res) => {
  const chats = await Chat.find({ participants: req.user.id }).populate("participants", "username");
  res.json(chats);
});

// Чат по ID
router.get("/:id", auth, async (req, res) => {
  const chat = await Chat.findById(req.params.id).populate("participants", "username");
  res.json(chat);
});

module.exports = router;
