const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../../app"); // твой express app

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

describe("Auth API", () => {
  test("Регистрация нового пользователя", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ username: "testuser", password: "123456" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
  });

  test("Ошибка при повторной регистрации того же пользователя", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({ username: "testuser", password: "123456" });

    const res = await request(app)
      .post("/api/auth/register")
      .send({ username: "testuser", password: "123456" });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  test("Логин зарегистрированного пользователя", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({ username: "testuser", password: "123456" });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ username: "testuser", password: "123456" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
  });

  test("Ошибка при логине с неверным паролем", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({ username: "testuser", password: "123456" });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ username: "testuser", password: "wrongpass" });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  test("Ошибка при логине несуществующего пользователя", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ username: "nouser", password: "123456" });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
  });
});
