"use strict";
// server.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const uuid_1 = require("uuid");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware
app.use(body_parser_1.default.json());
// In-memory database
const users = [];
// Routes
app.get('/api/users', (req, res) => {
    res.status(200).json(users);
});
app.get('/api/users/:userId', (req, res) => {
    const userId = req.params.userId;
    if (!isValidUuid(userId)) {
        return res.status(400).json({ message: 'Invalid userId' });
    }
    const user = users.find((user) => user.id === userId);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
});
app.post('/api/users', (req, res) => {
    const { username, age, hobbies } = req.body;
    if (!username || !age) {
        return res.status(400).json({ message: 'Username and age are required fields' });
    }
    const newUser = {
        id: (0, uuid_1.v4)(),
        username,
        age,
        hobbies: hobbies || [],
    };
    users.push(newUser);
    res.status(201).json(newUser);
});
app.put('/api/users/:userId', (req, res) => {
    const userId = req.params.userId;
    if (!isValidUuid(userId)) {
        return res.status(400).json({ message: 'Invalid userId' });
    }
    const userIndex = users.findIndex((user) => user.id === userId);
    if (userIndex === -1) {
        return res.status(404).json({ message: 'User not found' });
    }
    const { username, age, hobbies } = req.body;
    if (!username || !age) {
        return res.status(400).json({ message: 'Username and age are required fields' });
    }
    users[userIndex] = {
        id: userId,
        username,
        age,
        hobbies: hobbies || [],
    };
    res.status(200).json(users[userIndex]);
});
app.delete('/api/users/:userId', (req, res) => {
    const userId = req.params.userId;
    if (!isValidUuid(userId)) {
        return res.status(400).json({ message: 'Invalid userId' });
    }
    const userIndex = users.findIndex((user) => user.id === userId);
    if (userIndex === -1) {
        return res.status(404).json({ message: 'User not found' });
    }
    users.splice(userIndex, 1);
    res.status(204).send();
});
// Handle non-existing endpoints
app.use((req, res) => {
    res.status(404).json({ message: 'Endpoint not found' });
});
// Handle errors
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
});
const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });
function isValidUuid(uuid) {
    // Validate UUID format
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    return uuidRegex.test(uuid);
}
exports.default = app;
