const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find().sort({ _id: -1 });
    // We shouldn't return passwords to the frontend, even if hashed.
    const sanitizedUsers = users.map(u => {
      const { password, ...userWithoutPassword } = u.toObject();
      return userWithoutPassword;
    });
    res.json(sanitizedUsers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching users' });
  }
});

// POST a new user
router.post('/', async (req, res) => {
  try {
    const { username, fullName, email, password, role } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    const newUser = new User({
      username,
      fullName,
      email,
      password, // In a real app, hash this before saving! (For prototype, we match login logic)
      role
    });

    const savedUser = await newUser.save();
    
    const { password: pwd, ...userWithoutPassword } = savedUser.toObject();
    res.status(201).json(userWithoutPassword);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Error creating user' });
  }
});

// PUT (update) a user
router.put('/:id', async (req, res) => {
  try {
    const { username, fullName, email, password, role } = req.body;
    
    const userToUpdate = await User.findById(req.params.id);
    if (!userToUpdate) return res.status(404).json({ message: 'User not found' });

    userToUpdate.username = username || userToUpdate.username;
    userToUpdate.fullName = fullName || userToUpdate.fullName;
    userToUpdate.email = email || userToUpdate.email;
    userToUpdate.role = role || userToUpdate.role;
    
    if (password && password.trim() !== '') {
      userToUpdate.password = password; // In a real app, hash this!
    }

    const updatedUser = await userToUpdate.save();
    
    const { password: pwd, ...userWithoutPassword } = updatedUser.toObject();
    res.json(userWithoutPassword);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Error updating user' });
  }
});

// DELETE a user
router.delete('/:id', async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting user' });
  }
});

module.exports = router;
