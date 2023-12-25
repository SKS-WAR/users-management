"use strict";
// api.test.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const supertest_1 = __importDefault(require("supertest"));
const server_1 = __importDefault(require("src/server")); // Adjust based on your project structure
const request = (0, supertest_1.default)(server_1.default);
describe('API Tests', () => {
    let createdUserId;
    it('GET /api/users should return an empty array initially', async () => {
        const response = await request.get('/api/users');
        (0, chai_1.expect)(response.status).to.equal(200);
        (0, chai_1.expect)(response.body).to.be.an('array').that.is.empty;
    });
    it('POST /api/users should create a new user', async () => {
        const newUser = {
            username: 'TestUser',
            age: 25,
            hobbies: ['Reading', 'Coding'],
        };
        const response = await request.post('/api/users').send(newUser);
        (0, chai_1.expect)(response.status).to.equal(201);
        (0, chai_1.expect)(response.body).to.have.property('id');
        createdUserId = response.body.id;
    });
    it('GET /api/users/{userId} should return the created user', async () => {
        const response = await request.get(`/api/users/${createdUserId}`);
        (0, chai_1.expect)(response.status).to.equal(200);
        (0, chai_1.expect)(response.body.id).to.equal(createdUserId);
    });
    it('PUT /api/users/{userId} should update the created user', async () => {
        const updatedUserData = {
            username: 'UpdatedUser',
            age: 26,
            hobbies: ['Traveling', 'Photography'],
        };
        const response = await request.put(`/api/users/${createdUserId}`).send(updatedUserData);
        (0, chai_1.expect)(response.status).to.equal(200);
        (0, chai_1.expect)(response.body.id).to.equal(createdUserId);
        (0, chai_1.expect)(response.body.username).to.equal(updatedUserData.username);
        (0, chai_1.expect)(response.body.age).to.equal(updatedUserData.age);
        (0, chai_1.expect)(response.body.hobbies).to.deep.equal(updatedUserData.hobbies);
    });
    it('DELETE /api/users/{userId} should delete the created user', async () => {
        const response = await request.delete(`/api/users/${createdUserId}`);
        (0, chai_1.expect)(response.status).to.equal(204);
    });
    it('GET /api/users/{userId} should return 404 for the deleted user', async () => {
        const response = await request.get(`/api/users/${createdUserId}`);
        (0, chai_1.expect)(response.status).to.equal(404);
    });
});
