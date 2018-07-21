const { mongoose, mongod, signup, signin } = require("../test/helper");

const express = require("express");
const supertest = require("supertest");

const User = require("../models/user");
const userRouter = require("../routes/users");

const app = express();
userRouter(app);
const request = supertest(app);

let superJWTtoken = "";
let userJWTtoken = "";

/* Mongo Memory Server Test Setup */
beforeAll(async () => {
  jest.setTimeout(10000);

  const uri = await mongod.getConnectionString();
  await mongoose.connect(uri, { useNewUrlParser: true });
});

beforeEach(async () => {
  mongoose.connection.db.dropDatabase();
  
  await signup("super", "super");
  superJWTtoken = await signin("super", "super");
  await signup("user", "user");
  userJWTtoken = await signin("user", "user");
});

/* Tests */
test("GET /users will return the list of users successfully", async () => {
  const response = await request
    .get("/users")
    .set("Authorization", "Bearer " + superJWTtoken);
  expect(response.status).toBe(200);
  expect(response.body.message).toEqual("List of users retrieved successfully");
  expect(response.body.users).toBeInstanceOf(Array);

  const users = await User.find();
  expect(response.body.users.length).toEqual(users.length);
});

test("GET /users without auth token return 500 to app", async () => {
  const response = await request.get("/users");
  expect(response.status).toBe(500);
});

test("GET /users with invalid auth token return 403", async () => {
  const response = await request
    .get("/users")
    .set("Authorization", "Bearer " + userJWTtoken);
  expect(response.status).toBe(403);
  expect(response.body.message).toEqual(
    "Not authorized to view the list of users"
  );
});

/* Mongo Memory Server Test Setup */
afterAll(() => {
  mongoose.disconnect();
  mongod.stop();
});
