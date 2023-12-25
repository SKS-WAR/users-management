// server.ts

import express from 'express';
import bodyParser from 'body-parser';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middleware
app.use(bodyParser.json());

// In-memory database
const users: any[] = [];

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
    id: uuidv4(),
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
app.use((err:any, req:any, res:any, next:any) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3000;

// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

function isValidUuid(uuid: string) {
  // Validate UUID format
  const uuidRegex =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  return uuidRegex.test(uuid);
}


export default app;
