const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

// --- App ---
const app = express();
app.use(express.json());
app.use(cors());

const SECRET = "supersecret"; // лучше хранить в process.env.SECRET

// --- Подключение к Atlas ---
mongoose.connect("mongodb+srv://temirovdaniar104_db_user:10AJpdozcmSwtqtO@cluster0.m8oz2ur.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Подключено к MongoDB Atlas"))
.catch(err => console.error("❌ Ошибка подключения:", err));

// --- Схемы ---
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model("User", userSchema);

const chatSchema = new mongoose.Schema({
  name: String,
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now }
});
const Chat = mongoose.model("Chat", chatSchema);

const messageSchema = new mongoose.Schema({
  chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const Message = mongoose.model("Message", messageSchema);

// --- Middleware для проверки JWT ---
function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Нет токена" });

  const token = authHeader.split(" ")[1];
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Неверный токен" });
  }
}

// --- API ---
// Регистрация
app.post("/api/auth/register", async (req, res) => {
  const { username, password } = req.body;
  if (await User.findOne({ username })) {
    return res.status(400).json({ error: "Пользователь уже существует" });
  }
  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashed });
  await user.save();
  res.json({ message: "Регистрация успешна" });
});

// Логин
app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ error: "Неверные данные" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ error: "Неверный пароль" });

  const token = jwt.sign({ id: user._id, username: user.username }, SECRET, { expiresIn: "1h" });
  res.json({ token });
});

// Профиль текущего пользователя
app.get("/api/users/me", auth, async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
});

// Список пользователей
app.get("/api/users", auth, async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
});

// Создать чат
app.post("/api/chats", auth, async (req, res) => {
  const { name, participants } = req.body;
  const chat = new Chat({ name, participants: [req.user.id, ...participants] });
  await chat.save();
  res.json(chat);
});

// Список чатов текущего пользователя
app.get("/api/chats", auth, async (req, res) => {
  const chats = await Chat.find({ participants: req.user.id }).populate("participants", "username");
  res.json(chats);
});

// Получить чат по id
app.get("/api/chats/:id", auth, async (req, res) => {
  const chat = await Chat.findById(req.params.id).populate("participants", "username");
  res.json(chat);
});

// Отправить сообщение
app.post("/api/chats/:id/messages", auth, async (req, res) => {
  const message = new Message({
    chatId: req.params.id,
    senderId: req.user.id,
    text: req.body.text
  });
  await message.save();
  res.json(message);
});

// Получить сообщения чата
app.get("/api/chats/:id/messages", auth, async (req, res) => {
  const messages = await Message.find({ chatId: req.params.id })
    .populate("senderId", "username")
    .sort({ createdAt: 1 });
  res.json(messages);
});

// --- Start ---
app.listen(3000, () => console.log("🚀 Сервер запущен на http://localhost:3000"));
