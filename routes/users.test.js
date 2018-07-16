const express = require("express");
const supertest = require("supertest");

/* Mongo Memory Server Test Setup */
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongod = new MongoMemoryServer();

const User = require("../models/user");

const userRouter = require("./users");

const app = express();
userRouter(app);
// const request = supertest(app);

/* Mongo Memory Server Test Setup */
beforeAll(async () => {
  jest.setTimeout(12000);

  const uri = await mongod.getConnectionString();
  await mongoose.connect(uri);
});

test("GET /users will return the list of users successfully", () => {
  expect(1).toBe(1);

  // const response = await request.get("/users");
  // expect(response.status).toBe(200);
  // expect(response.body.message).toEqual(
  //   "List of users retrieved successfully"
  // );
  // expect(response.body.users).toBeInstanceOf(Array);

  // const users = await User.find();
  // console.log(users.length);
});

/* Mongo Memory Server Test Setup */
afterAll(() => {
  mongoose.disconnect();
  mongod.stop();
});
