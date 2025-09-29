const jwt = require("jsonwebtoken");
const SECRET = "supersecret"; // process.env.SECRET

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

module.exports = auth;
