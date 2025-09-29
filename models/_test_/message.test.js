const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../../app");
const User = require("../../models/User");
const Chat = require("../../models/Chat");

let mongoServer;
let token;
let chatId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // Регистрируем юзера
  await request(app).post("/api/auth/register").send({
    username: "msguser",
    password: "123456"
  });

  const res = await request(app).post("/api/auth/login").send({
    username: "msguser",
    password: "123456"
  });

  token = res.body.token;

  // Создаём чат
  const chatRes = await request(app)
    .post("/api/chats")
    .set("Authorization", `Bearer ${token}`)
    .send({ name: "Message Chat", participants: [] });

  chatId = chatRes.body._id;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Message API", () => {
  test("Отправка сообщения", async () => {
    const res = await request(app)
      .post(`/api/messages/${chatId}/messages`)
      .set("Authorization", `Bearer ${token}`)
      .send({ text: "Hello world" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("text", "Hello world");
  });

  test("Получение сообщений чата", async () => {
    const res = await request(app)
      .get(`/api/messages/${chatId}/messages`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
});
