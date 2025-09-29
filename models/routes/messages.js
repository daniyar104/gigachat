const express = require("express");
const Message = require("../Message");
const auth = require("../utils/authMiddleware");

const router = express.Router();

// Отправить сообщение
router.post("/:id/messages", auth, async (req, res) => {
  const message = new Message({
    chatId: req.params.id,
    senderId: req.user.id,
    text: req.body.text
  });
  await message.save();
  res.json(message);
});

// Сообщения чата
router.get("/:id/messages", auth, async (req, res) => {
  const messages = await Message.find({ chatId: req.params.id })
    .populate("senderId", "username")
    .sort({ createdAt: 1 });
  res.json(messages);
});

module.exports = router;
