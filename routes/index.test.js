const supertest = require('supertest');

const app = require('../app');
const request = supertest(app);

test('GET / should return Hello message', async () => {
    const response = await request.get('/');
    expect(response.status).toBe(200);
    expect(response.body.message).toEqual('Hello from Stock API!');
});