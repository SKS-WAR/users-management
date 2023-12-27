// server.ts

import express from 'express';
import bodyParser from 'body-parser';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import fs from 'fs/promises';

dotenv.config();

const app = express();

// Middleware
app.use(bodyParser.json());

const USERS_FILE_PATH = 'users.json';

// Load users from the file
async function loadUsers() {
  try {
    const data = await fs.readFile(USERS_FILE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // If the file doesn't exist or there's an error reading it, return an empty array
    return [];
  }
}

// Save users to the file
async function saveUsers(users: any[]) {
  await fs.writeFile(USERS_FILE_PATH, JSON.stringify(users, null, 2), 'utf-8');
}

// Routes

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await loadUsers();
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get user by ID
app.get('/api/users/:userId', async (req, res) => {
  const userId = req.params.userId;

  if (!isValidUuid(userId)) {
    return res.status(400).json({ message: 'Invalid userId' });
  }

  try {
    const users = await loadUsers();
    const user = users.find((user:any) => user.id === userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Create a new user
app.post('/api/users', async (req, res) => {
  const { username, age, hobbies } = req.body;

  if (!username || !age) {
    return res.status(400).json({ message: 'Username and age are required fields' });
  }

  try {
    const users = await loadUsers();
    const newUser = {
      id: uuidv4(),
      username,
      age,
      hobbies: hobbies || [],
    };

    users.push(newUser);
    await saveUsers(users);

    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Update user by ID
app.put('/api/users/:userId', async (req, res) => {
  const userId = req.params.userId;

  if (!isValidUuid(userId)) {
    return res.status(400).json({ message: 'Invalid userId' });
  }

  try {
    const users = await loadUsers();
    const userIndex = users.findIndex((user:any) => user.id === userId);

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

    await saveUsers(users);

    res.status(200).json(users[userIndex]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Delete user by ID
app.delete('/api/users/:userId', async (req, res) => {
  const userId = req.params.userId;

  if (!isValidUuid(userId)) {
    return res.status(400).json({ message: 'Invalid userId' });
  }

  try {
    const users = await loadUsers();
    const userIndex = users.findIndex((user:any) => user.id === userId);

    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }

    users.splice(userIndex, 1);
    await saveUsers(users);

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Handle non-existing endpoints
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

// Handle errors
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

// const PORT = process.env.PORT || 3000;

// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

function isValidUuid(uuid: string) {
  const uuidRegex =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  return uuidRegex.test(uuid);
}

export default app;