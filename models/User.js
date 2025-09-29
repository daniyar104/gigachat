const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
});

// Проверяем, зарегистрирована ли уже модель, чтобы не было OverwriteModelError
module.exports = mongoose.models.User || mongoose.model("User", userSchema);
