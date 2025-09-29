const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../../app"); // экспортируй app из server.js
const User = require("../../models/User");

let mongoServer;
let token;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // Регистрируем пользователя
  await request(app).post("/api/auth/register").send({
    username: "user1",
    password: "123456"
  });

  // Логинимся и получаем токен
  const res = await request(app).post("/api/auth/login").send({
    username: "user1",
    password: "123456"
  });

  token = res.body.token;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("User API", () => {
  test("Получение профиля текущего пользователя", async () => {
    const res = await request(app)
      .get("/api/users/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("username", "user1");
    expect(res.body).not.toHaveProperty("password"); // пароль не должен возвращаться
  });

  test("Получение списка пользователей", async () => {
    const res = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty("username");
  });
});
