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
  expect(user.length).toEqual(1);
  const userId = user[0]._id;
  const watchlist = new WatchList({
    ticker,
    user: userId
  });
  await watchlist.save();

  const createdWatchlist = await WatchList.find({
    ticker: ticker,
    user: userId
  });
  expect(createdWatchlist.length).toEqual(1);
  const watchlistId = createdWatchlist[0]._id;

  return { userId, watchlistId };
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
    expect(user.length).toEqual(1);
    const watchlist = await WatchList.find({ user: user[0]._id });
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
    expect(user.length).toEqual(1);
    const watchlist = await WatchList.find({ user: user[0]._id });
    expect(response.body.watchlist.length).toEqual(watchlist.length);
  });

  test("GET /watchlist without auth token return 500", async () => {
    const response = await request.get("/watchlist");
    expect(response.status).toBe(500);
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

describe("POST /watchlist", () => {
  test("POST /watchlist for a ticker will return success message", async () => {
    const response = await request
      .post("/watchlist")
      .send({ watchlist: "FB" })
      .set("Authorization", "Bearer " + userJWTtoken);
    expect(response.status).toBe(200);
    expect(response.body.message).toEqual(
      `Watchlist created for username ${"user"}`
    );

    const user = await User.find({ username: "user" });
    expect(user.length).toEqual(1);
    const watchlist = await WatchList.find({ ticker: "FB", user: user[0]._id });
    expect(watchlist.length).toEqual(1);
  });

  test("POST /watchlist for an array of tickers will return success message", async () => {
    const response = await request
      .post("/watchlist")
      .send({ watchlist: ["APPL", "FB", "MSFT"] })
      .set("Authorization", "Bearer " + userJWTtoken);
    expect(response.status).toBe(200);
    expect(response.body.message).toEqual(
      `Watchlist created for username ${"user"}`
    );

    const user = await User.find({ username: "user" });
    expect(user.length).toEqual(1);
    const watchlist = await WatchList.find({ user: user[0]._id });
    expect(watchlist.length).toEqual(3);
  });

  test("POST /watchlist for duplicate ticker will return 400", async () => {
    // arrange
    const ticker = "FB";
    const username = "user";
    await createWatchListFor(ticker, username);

    // act
    const response = await request
      .post("/watchlist")
      .send({ watchlist: ticker })
      .set("Authorization", "Bearer " + userJWTtoken);

    // assert response
    expect(response.status).toBe(400);
    expect(response.body.message).toEqual(
      `Tickers { ${ticker} } already exist for ${username}`
    );
  });

  test("POST /watchlist without auth token return 500", async () => {
    const response = await request
      .post("/watchlist")
      .send({ watchlist: ["APPL", "FB", "MSFT"] });

    expect(response.status).toBe(500);
  });
});

describe("DELETE /watchlist/:id", () => {
  test("DELETE /watchlist/:id will return success message", async () => {
    // arrange
    const ticker = "FB";
    const username = "user";
    const { userId, watchlistId } = await createWatchListFor(ticker, username);

    // act
    const response = await request
      .delete(`/watchlist/${watchlistId}`)
      .set("Authorization", "Bearer " + userJWTtoken);

    // assert response
    expect(response.status).toBe(200);
    expect(response.body.message).toEqual(
      `Ticker ${ticker} successfully deleted from ${username}'s watchlist`
    );

    // assert db
    const watchlist = await WatchList.find({ ticker: ticker, user: userId });
    expect(watchlist.length).toEqual(0);
  });

  test("DELETE /watchlist/:id using mismatched token will return 401", async () => {
    // arrange
    const ticker = "FB";
    const username = "user";
    const { userId, watchlistId } = await createWatchListFor(ticker, username);

    // act
    const response = await request
      .delete(`/watchlist/${watchlistId}`)
      .set("Authorization", "Bearer " + superJWTtoken);

    // assert response
    expect(response.status).toBe(401);

    // assert db
    const watchlist = await WatchList.find({ ticker: ticker, user: userId });
    expect(watchlist.length).toEqual(1);
  });

  test("DELETE /watchlist without auth token return 500", async () => {
    // arrange
    const ticker = "FB";
    const username = "user";
    const { userId, watchlistId } = await createWatchListFor(ticker, username);

    // act
    const response = await request.delete(`/watchlist/${watchlistId}`);

    // assert response
    expect(response.status).toBe(500);
  });
});

/* Mongo Memory Server Test Setup */
afterAll(() => {
  mongoose.disconnect();
  mongod.stop();
});
