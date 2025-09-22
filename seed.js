const mongoose = require("mongoose");

// подключение к MongoDB
mongoose.connect("mongodb+srv://temirovdaniar104_db_user:10AJpdozcmSwtqtO@cluster0.m8oz2ur.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// --- СХЕМЫ ---
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const chatSchema = new mongoose.Schema({
  name: { type: String, required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now },
});

const messageSchema = new mongoose.Schema({
  chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);
const Chat = mongoose.model("Chat", chatSchema);
const Message = mongoose.model("Message", messageSchema);

// --- ФУНКЦИЯ ЗАПОЛНЕНИЯ ---
async function seed() {
  try {
    // очистим коллекции
    await User.deleteMany({});
    await Chat.deleteMany({});
    await Message.deleteMany({});

    // создаём пользователей
    const daniyar = new User({ username: "daniyar", password: "hashed_password_1" });
    const alex = new User({ username: "alex", password: "hashed_password_2" });
    await daniyar.save();
    await alex.save();

    // создаём чат
    const generalChat = new Chat({
      name: "General",
      participants: [daniyar._id, alex._id],
    });
    await generalChat.save();

    // создаём сообщения
    await Message.insertMany([
      {
        chatId: generalChat._id,
        senderId: daniyar._id,
        text: "Привет, Алекс!",
      },
      {
        chatId: generalChat._id,
        senderId: alex._id,
        text: "Привет, Данияр! Как дела?",
      },
    ]);

    console.log("✅ База успешно заполнена!");
    mongoose.connection.close();
  } catch (err) {
    console.error("❌ Ошибка при заполнении:", err);
    mongoose.connection.close();
  }
}

seed();
