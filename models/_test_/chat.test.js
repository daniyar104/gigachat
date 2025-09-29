const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../../app"); // или server.js, если ты его экспортируешь
const User = require("../../models/User");
const Chat = require("../../models/Chat");

let mongoServer;
let token;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // Создаём пользователя и получаем токен
  await request(app).post("/api/auth/register").send({
    username: "chatuser",
    password: "123456"
  });

  const res = await request(app).post("/api/auth/login").send({
    username: "chatuser",
    password: "123456"
  });

  token = res.body.token;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Chat API", () => {
  test("Создание нового чата", async () => {
    const res = await request(app)
      .post("/api/chats")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Test Chat", participants: [] });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("name", "Test Chat");
  });

  test("Получение списка чатов", async () => {
    const res = await request(app)
      .get("/api/chats")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
});
