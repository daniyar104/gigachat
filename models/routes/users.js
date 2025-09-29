const express = require("express");
const User = require("../User");
const auth = require("../utils/authMiddleware");

const router = express.Router();

// Профиль текущего пользователя
router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
});

// Все пользователи
router.get("/", auth, async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
});

module.exports = router;
