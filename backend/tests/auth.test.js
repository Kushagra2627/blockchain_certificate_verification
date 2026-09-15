const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const connectDB = require("../config/db");

jest.setTimeout(30000);

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("Auth API Endpoints", () => {
  it("Should return 400 when registering with missing fields", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "invalid@example.com" });

    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBe(false);
  });

  it("Should return 400 when logging in without password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@test.com" });

    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBe(false);
  });
});
