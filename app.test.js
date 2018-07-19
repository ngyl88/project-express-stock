const supertest = require("supertest");

const { createWatchListFor } = require('./integration_test/watchlists.test.js');

/* Mongo Memory Server Test Setup */
// const mongoose = require("mongoose");
// const { MongoMemoryServer } = require("mongodb-memory-server");
// const mongod = new MongoMemoryServer();

// const User = require("../models/user");

const app = require("./app");
const request = supertest(app);

/* Mongo Memory Server Test Setup */
// beforeAll(async () => {
//     jest.setTimeout(12000);

//     const uri = await mongod.getConnectionString();
//     await mongoose.connect(uri);

//     await signup("super", "super");
//     superJWTtoken = await login("super", "super");
//     await signup("user", "user");
//     userJWTtoken = await login("user", "user");
// });

describe("/users protected route", () => {
  test("GET /users without auth token return 401", async () => {
    const response = await request.get("/users");
    expect(response.status).toBe(401);
    expect(response.body.message).toEqual("Unauthorized");
  });
});

describe("/watchlist protected route", () => {
  test("GET /watchlist without auth token return 401", async () => {
    const response = await request.get("/watchlist");
    expect(response.status).toBe(401);
    expect(response.body.message).toEqual("Unauthorized");
  });

  test("GET /watchlist?price without auth token return 401", async () => {
    const response = await request.get("/watchlist?price");
    expect(response.status).toBe(401);
  });

  test("POST /watchlist without auth token return 401", async () => {
    const response = await request
      .post("/watchlist")
      .send({ watchlist: ["AAPL", "FB", "MSFT"] });

    expect(response.status).toBe(401);
  });

  test("DELETE /watchlist without auth token return 401", async () => {
    // arrange
    const ticker = "FB";
    const username = "user";
    const { userId, watchlistId } = await createWatchListFor(ticker, username);

    // act
    const response = await request.delete(`/watchlist/${watchlistId}`);

    // assert response
    expect(response.status).toBe(401);
  });
});

/* Mongo Memory Server Test Setup */
// afterAll(() => {
//     mongoose.disconnect();
//     mongod.stop();
// });
