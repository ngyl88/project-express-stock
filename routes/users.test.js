const express = require("express");
const supertest = require("supertest");

/* Mongo Memory Server Test Setup */
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongod = new MongoMemoryServer();

const User = require("../models/user");

const app = require("../app");
const request = supertest(app);

let superJWTtoken = "";
let userJWTtoken = "";

async function signup(username, password) {
  const response = await request.post("/signup").send({ username, password });

  expect(response.status).toBe(200);
  expect(response.body.message).toEqual(
    `Account created for username ${username}`
  );
}

async function login(username, password) {
  const response = await request.post("/signin").send({ username, password });
  expect(response.statusCode).toBe(200);
  expect(response.body.token).toBeDefined();
  return response.body.token;
}

/* Mongo Memory Server Test Setup */
beforeAll(async () => {
  jest.setTimeout(12000);

  const uri = await mongod.getConnectionString();
  await mongoose.connect(uri);

  await signup("super", "super");
  superJWTtoken = await login("super", "super");
  await signup("user", "user");
  userJWTtoken = await login("user", "user");
});

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

test("GET /users without auth token return 401", async () => {
  const response = await request.get("/users");
  expect(response.status).toBe(401);
  expect(response.body.message).toEqual("Unauthorized");
});

test("GET /users with invalid auth token return 403", async () => {
  const response = await request.get("/users").set("Authorization", "Bearer " + userJWTtoken);
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
