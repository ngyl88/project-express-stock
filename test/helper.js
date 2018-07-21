const supertest = require("supertest");
const app = require("../app");

const requestIndex = supertest(app);

const User = require("../models/user");
const WatchList = require("../models/watchlist");

/* Mongo Memory Server Test Setup */

const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongod = new MongoMemoryServer();

/* Functions */

const signup = async (username, password) => {
  const response = await requestIndex
    .post("/signup")
    .send({ username, password });

  expect(response.status).toBe(200);
  expect(response.body.message).toEqual(
    `Account created for username ${username}`
  );
};

const signin = async (username, password) => {
  const response = await requestIndex
    .post("/signin")
    .send({ username, password });
  expect(response.statusCode).toBe(200);
  expect(response.body.token).toBeDefined();
  return response.body.token;
};

const createWatchListFor = async (ticker, username) => {
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
};

module.exports = {
  mongoose,
  mongod,
  signup,
  signin,
  createWatchListFor
};
