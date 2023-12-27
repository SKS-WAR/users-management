// api.test.ts

import { expect } from 'chai';
import supertest from 'supertest';
import app from '../src/server'; // Adjust based on your project structure

const request = supertest(app);

describe('API Tests', () => {
  let createdUserId: string;

  // it('GET /api/users should return an empty array initially', async () => {
  //   const response = await request.get('/api/users');
  //   expect(response.status).to.equal(200);
  //   expect(response.body).to.be.an('array').that.is.empty;
  // });

  it('POST /api/users should create a new user', async () => {
    const newUser = {
      username: 'TestUser',
      age: 25,
      hobbies: ['Reading', 'Coding'],
    };

    const response = await request.post('/api/users').send(newUser);
    expect(response.status).to.equal(201);
    expect(response.body).to.have.property('id');
    createdUserId = response.body.id;
  });

  it('GET /api/users/{userId} should return the created user', async () => {
    const response = await request.get(`/api/users/${createdUserId}`);
    expect(response.status).to.equal(200);
    expect(response.body.id).to.equal(createdUserId);
  });

  it('PUT /api/users/{userId} should update the created user', async () => {
    const updatedUserData = {
      username: 'UpdatedUser',
      age: 26,
      hobbies: ['Traveling', 'Photography'],
    };

    const response = await request.put(`/api/users/${createdUserId}`).send(updatedUserData);
    expect(response.status).to.equal(200);
    expect(response.body.id).to.equal(createdUserId);
    expect(response.body.username).to.equal(updatedUserData.username);
    expect(response.body.age).to.equal(updatedUserData.age);
    expect(response.body.hobbies).to.deep.equal(updatedUserData.hobbies);
  });

  it('DELETE /api/users/{userId} should delete the created user', async () => {
    const response = await request.delete(`/api/users/${createdUserId}`);
    expect(response.status).to.equal(204);
  });

  it('GET /api/users/{userId} should return 404 for the deleted user', async () => {
    const response = await request.get(`/api/users/${createdUserId}`);
    expect(response.status).to.equal(404);
  });
});
