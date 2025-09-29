const mongoose = require("mongoose");
const app = require("./app");
const { Server } = require("socket.io");
const http = require("http");

const PORT = process.env.PORT || 5000;
const MONGO_URI = "mongodb+srv://temirovdaniar104_db_user:10AJpdozcmSwtqtO@cluster0.m8oz2ur.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"; // твоя Mongo строка

// Создаём HTTP сервер на основе Express
const server = http.createServer(app);

// Подключаем Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*", // можно указать домен фронта
    methods: ["GET", "POST"]
  }
});

// Обработка подключений через Socket.IO
io.on("connection", (socket) => {
  console.log("✅ Пользователь подключился:", socket.id);

  // Пример события: получение сообщения
  socket.on("send_message", (data) => {
    console.log("Сообщение получено:", data);

    // Отправка сообщения всем подключённым клиентам
    io.emit("receive_message", data);
  });

  // Когда пользователь отключается
  socket.on("disconnect", () => {
    console.log("❌ Пользователь отключился:", socket.id);
  });
});

// Подключаемся к MongoDB и запускаем сервер
mongoose.connect(MONGO_URI)
  .then(() => {
    server.listen(PORT, () => console.log(`🚀 Сервер запущен на http://localhost:${PORT}`));
  })
  .catch(err => console.error("❌ Ошибка подключения:", err));
