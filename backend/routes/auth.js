const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Simple mock auth for development testing if database is not seeded
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // In a real application, you'd compare against database hashes
    // Here we'll do a simple check or try querying the DB if connected
    
    // For demo purposes, we allow hardcoded admin/admin login
    if (username === 'admin' && password === 'admin') {
      return res.status(200).json({ 
        success: true, 
        token: 'mock-jwt-token-for-admin',
        user: { username: 'admin', role: 'admin' }
      });
    }

    try {
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
      
      // We skip bcrypt for this mock demo unless really needed and just check plaintext
      if (user.password !== password) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      return res.status(200).json({ 
        success: true,
        token: 'mock-jwt-token-123',
        user: { username: user.username, role: user.role }
      });
    } catch(err) {
      // DB might not be connected, fallback to error
      return res.status(500).json({ success: false, message: 'Database error or not connected. Use admin/admin to test.' });
    }

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Registration route
router.post('/register', async (req, res) => {
  try {
    const { username, password, fullName, email, phone, address } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    try {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Username already exists' });
      }
      
      const newUser = new User({ username, password, fullName, email, phone, address });
      await newUser.save();
      
      return res.status(201).json({ 
        success: true, 
        message: 'Account created successfully',
        token: 'mock-jwt-token-123',
        user: { username: newUser.username, role: newUser.role }
      });
    } catch(err) {
      return res.status(500).json({ success: false, message: 'Database error. Make sure MongoDB is running for registration.' });
    }

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
