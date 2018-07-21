const { mongoose, mongod, signup, createWatchListFor } = require("./test/helper");

const supertest = require("supertest");

const app = require("./app");
const request = supertest(app);

/* Mongo Memory Server Test Setup */
beforeAll(async () => {
  jest.setTimeout(10000);

  const uri = await mongod.getConnectionString();
  await mongoose.connect(uri);
});

beforeEach(async () => {
  mongoose.connection.db.dropDatabase();
  await signup("user", "user");
});

/* Tests */
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

  test("PUT /watchlist without auth token return 401", async () => {
    const { watchlistId, ...rest } = await createWatchListFor("FB", "user");

    const response = await request.put(`/watchlist/${watchlistId}/AAPL`);
    expect(response.status).toBe(401);
  });

  test("DELETE /watchlist without auth token return 401", async () => {
    const { watchlistId, ...rest } = await createWatchListFor("FB", "user");

    const response = await request.delete(`/watchlist/${watchlistId}`);
    expect(response.status).toBe(401);
  });
});

/* Mongo Memory Server Test Setup */
afterAll(() => {
  mongoose.disconnect();
  mongod.stop();
});