const express = require("express");
const supertest = require("supertest");

/* Mongo Memory Server Test Setup */
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongod = new MongoMemoryServer();

const User = require("../models/user");
const WatchList = require("../models/watchlist");

const requestIndex = supertest(require("../app"));

const watchlistRouter = require("./watchlists");
const app = express();
watchlistRouter(app);
const request = supertest(app);

let superJWTtoken = "";
let userJWTtoken = "";

async function signup(username, password) {
  const response = await requestIndex
    .post("/signup")
    .send({ username, password });

  expect(response.status).toBe(200);
  expect(response.body.message).toEqual(
    `Account created for username ${username}`
  );
}

async function login(username, password) {
  const response = await requestIndex
    .post("/signin")
    .send({ username, password });
  expect(response.statusCode).toBe(200);
  expect(response.body.token).toBeDefined();
  return response.body.token;
}

async function createWatchListFor(ticker, username) {
  const user = await User.find({ username: username });
  const watchlist = new WatchList({
    ticker,
    user: user[0]._id
  });
  await watchlist.save();
}

/* Mongo Memory Server Test Setup */
beforeAll(async () => {
  jest.setTimeout(12000);

  const uri = await mongod.getConnectionString();
  await mongoose.connect(uri);
});

beforeEach(async () => {
  mongoose.connection.db.dropDatabase();
  
  await signup("super", "super");
  superJWTtoken = await login("super", "super");
  await signup("user", "user");
  userJWTtoken = await login("user", "user");
});

describe("GET /watchlist", () => {
  test("GET /watchlist for super will return watchlist for super", async () => {
    const response = await request
      .get("/watchlist")
      .set("Authorization", "Bearer " + superJWTtoken);
    expect(response.status).toBe(200);
    expect(response.body.message).toEqual(
      `Watchlist retrieved successfully for ${"super"}`
    );
    expect(response.body.watchlist).toBeInstanceOf(Array);

    const user = await User.find({ username: "super" });
    const watchlist = await WatchList.find({ user: user._id });
    expect(response.body.watchlist.length).toEqual(watchlist.length);
  });

  test("GET /watchlist for user will return watchlist for user", async () => {
    const response = await request
      .get("/watchlist")
      .set("Authorization", "Bearer " + userJWTtoken);
    expect(response.status).toBe(200);
    expect(response.body.message).toEqual(
      `Watchlist retrieved successfully for ${"user"}`
    );
    expect(response.body.watchlist).toBeInstanceOf(Array);

    const user = await User.find({ username: "user" });
    const watchlist = await WatchList.find({ user: user._id });
    expect(response.body.watchlist.length).toEqual(watchlist.length);
  });

  test("GET /watchlist without auth token return 401", async () => {
    const response = await requestIndex.get("/watchlist");
    expect(response.status).toBe(401);
    expect(response.body.message).toEqual("Unauthorized");
  });
});

describe("GET /watchlist with admin option", () => {
  test("GET /watchlist with admin for super will return all watchlist", async () => {
    await createWatchListFor("APPL", "user");

    const response = await request
      .get("/watchlist?admin=true")
      .set("Authorization", "Bearer " + superJWTtoken);

    expect(response.status).toBe(200);
    expect(response.body.message).toEqual(
      "All watchlists are retrieved successfully"
    );
    expect(response.body.watchlist).toBeInstanceOf(Array);

    const watchlist = await WatchList.find();
    expect(response.body.watchlist.length).toEqual(watchlist.length);
    expect(response.body.watchlist.length).toBeGreaterThan(0);
  });

  test("GET /watchlist with admin (invalid auth token) return 403", async () => {
    const response = await request
      .get("/watchlist?admin=true")
      .set("Authorization", "Bearer " + userJWTtoken);
    expect(response.status).toBe(403);
    expect(response.body.message).toEqual(
      "Not authorized to view the list of watchlist"
    );
  });
});

/* Mongo Memory Server Test Setup */
afterAll(() => {
  mongoose.disconnect();
  mongod.stop();
});
