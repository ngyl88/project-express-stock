const supertest = require("supertest");
const express = require("express");

/* Mongo Memory Server Test Setup */
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongod = new MongoMemoryServer();

const indexRouter = require("./index");
const app = express();
indexRouter(app);
const request = supertest(app);

/* Mongo Memory Server Test Setup */
beforeAll(async () => {
  jest.setTimeout(120000);

  const uri = await mongod.getConnectionString();
  await mongoose.connect(
    uri,
    { useNewUrlParser: true }
  );
});

describe('GET routes', () => {
  test("GET / should return Hello message", async () => {
    const response = await request.get("/");
    expect(response.status).toBe(200);
    expect(response.body.message).toEqual("Hello from Stock API!");
  });
});

describe('POST /signup routes', () => {
  test('POST /signup should return success message', () => {
    
  });
  test('POST /signup should return error messages', () => {
    
  });
});

describe('POST /signin routes', () => {
  test('POST /signin should return success message', () => {
    
  });
  test('POST /signin should return error messages', () => {
    
  });
});

/* Mongo Memory Server Test Setup */
afterAll(() => {
  mongoose.disconnect();
  mongod.stop();
});
