const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../User");

const router = express.Router();
const SECRET = "supersecret"; // лучше process.env.SECRET

// Регистрация
// Регистрация
router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  if (await User.findOne({ username })) {
    return res.status(400).json({ error: "Пользователь уже существует" });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashed });
  await user.save();

  // ✅ сразу выдаём токен
  const token = jwt.sign({ id: user._id, username: user.username }, SECRET, { expiresIn: "1h" });

  res.json({ token });
});


// Логин
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ error: "Неверные данные" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ error: "Неверный пароль" });

  const token = jwt.sign({ id: user._id, username: user.username }, SECRET, { expiresIn: "1h" });
  res.json({ token });
});

module.exports = router;
