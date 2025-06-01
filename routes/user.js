const router = require('express').Router();
const bcrypt = require('bcrypt');
const { isAuthenticated, isAdmin } = require('../middleware/auth.js');
const dotenv = require('dotenv');
const passport = require('../config/passport.js');
const {connectDB} = require('../config/db.js');
const db = connectDB();
const saltRounds = process.env.salt_rounds

dotenv.config();

//Register new user
router.post('/register', async (req, res) => {
    const newUser = {
        username: req.body.username,
        password: req.body.password
    }
    try {
        const checkUser = await db.query('SELECT * FROM users WHERE username = $1', [newUser.username]);
        if (checkUser.rows.length > 0) {
            return res.status(400).json({ message: 'Username already exists' });
        }
        const hashedPassword = await bcrypt.hash(newUser.password, saltRounds)

        newUser.password = hashedPassword;
        const result = await db.query('INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *', [newUser.username, newUser.password]);
        if (result.rows.length > 0) {
            res.status(201).json({ message: 'User registered successfully', user: result.rows[0] });
        } else {
            res.status(500).json({ message: 'Error registering user' });
        }
    } catch (error) {
        console.log(error)
    }
})

//Login
router.post('/login', passport.authenticate('local', {
  successRedirect: '/user/profile',
  failureRedirect: '/user/failure',
}), (req, res) => {
  res.status(200).json({ message: 'Logged in successfully', user: req.user });
})

//View all users
router.get('/view', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM users');
    if (result.rows.length > 0) {
      res.status(200).json(result.rows);
    } else {
      res.status(404).json({ message: 'No users found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
})

//Delete user
router.delete('/delete/:id', isAuthenticated, isAdmin, async (req, res) => {
  const userId = req.params.id;
  try {
    const result = await db.query('DELETE FROM users WHERE id = $1 RETURNING *', [userId]);
    if (result.rows.length > 0) {
      res.status(200).json({ message: 'User deleted successfully', user: result.rows[0] });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
})

//Failure route for login
router.get('/failure', (req, res) => {
  res.status(401).json({ message: 'Login failed'});
})

//Success route for login
router.get('/profile', isAuthenticated, (req, res) => {
  try {
    res.status(200).json({ message: 'Welcome to your profile', user: req.user });

  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
})

module.exports = {
  router,
}
