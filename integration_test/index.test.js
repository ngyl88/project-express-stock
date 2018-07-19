const supertest = require("supertest");
const express = require("express");

/* Mongo Memory Server Test Setup */
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongod = new MongoMemoryServer();

const User = require("../models/user");

const indexRouter = require("../routes/index");
const app = express();
indexRouter(app);
const request = supertest(app);

/* Mongo Memory Server Test Setup */
beforeAll(async () => {
  jest.setTimeout(30000);

  const uri = await mongod.getConnectionString();
  await mongoose.connect(
    uri,
    { useNewUrlParser: true }
  );
});

describe("GET routes", () => {
  test("GET / should return Hello message", async () => {
    const response = await request.get("/");
    expect(response.status).toBe(200);
    expect(response.body.message).toEqual("Hello from Stock API!");
  });
});

describe("POST /signup routes", () => {
  test("POST /signup should return success message", async () => {
    const username = "user1";
    const password = "password1";

    const response = await request.post("/signup").send({ username, password });

    expect(response.status).toBe(200);
    expect(response.body.message).toEqual(
      `Account created for username ${username}`
    );

    const users = await User.find({ username });
    expect(users.length).toBe(1);
    expect(users[0].username).toBe(username);
  });

  test("POST /signup with blank username should return status 400", async () => {
    const username = "";
    const password = "";

    const response = await request.post("/signup").send({ username, password });

    expect(response.status).toBe(400);
    expect(response.body).toEqual(
      `User validation failed: username: cannot be blank`
    );
  });

  test("POST /signup with duplicate username should return status 400", async () => {
    const username = "user1";
    const password = "";

    const response = await request.post("/signup").send({ username, password });

    expect(response.status).toBe(400);
    expect(response.body).toEqual(
      expect.stringContaining(
        `User validation failed: username: ${username} already exists`
      )
    );
  });
});

describe("POST /signin routes", () => {
  test("POST /signin should return success message", async () => {
    const username = "user1";
    const password = "password1";

    const response = await request.post("/signin").send({ username, password });

    expect(response.status).toBe(200);
    expect(response.body.message).toEqual("signin ok");
    expect(response.body.token).toBeDefined();
  });

  test("POST /signin with cased username should success", async () => {
    const username = "UsEr1";
    const password = "password1";

    const response = await request.post("/signin").send({ username, password });

    expect(response.status).toBe(200);
    expect(response.body.message).toEqual("signin ok");
    expect(response.body.token).toBeDefined();
  });

  test("POST /signin with unmatched password should return 401", async () => {
    const username = "user1";
    const password = "PASSWORD1";

    const response = await request.post("/signin").send({ username, password });

    expect(response.status).toBe(401);
    expect(response.body.message).toEqual("passwords did not match");
  });

  test("POST /signin with cased username and unmatched password should return 401", async () => {
    const username = "UsEr1";
    const password = "PASSWORD1";

    const response = await request.post("/signin").send({ username, password });

    expect(response.status).toBe(401);
    expect(response.body.message).toEqual("passwords did not match");
  });

  test("POST /signin with invalid username should return 401", async () => {
    const username = "invalid";
    const password = "password0";

    const response = await request.post("/signin").send({ username, password });

    expect(response.status).toBe(401);
    expect(response.body.message).toEqual("no such user found");
  });
});

/* Mongo Memory Server Test Setup */
afterAll(() => {
  mongoose.disconnect();
  mongod.stop();
});
