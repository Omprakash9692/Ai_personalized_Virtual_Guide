const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Secret for JWT - in production this should be in .env
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_for_dev';

/**
 * Handle user registration
 * 
 * @route POST /api/auth/register
 */
async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and password are required.',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists.',
      });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create unique userId
    const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Create the user
    const newUser = await User.create({
      userId,
      name,
      email,
      password: hashedPassword,
    });

    // Generate JWT
    const token = jwt.sign({ userId: newUser.userId, email: newUser.email }, JWT_SECRET, {
      expiresIn: '7d',
    });

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        userId: newUser.userId,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error('[Auth Controller Error - Register]:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error during registration.',
    });
  }
}

/**
 * Handle user login
 * 
 * @route POST /api/auth/login
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required.',
      });
    }

    // Find the user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.',
      });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.',
      });
    }

    // Generate JWT
    const token = jwt.sign({ userId: user.userId, email: user.email }, JWT_SECRET, {
      expiresIn: '7d',
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        preferredLanguage: user.preferredLanguage,
      },
    });
  } catch (error) {
    console.error('[Auth Controller Error - Login]:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error during login.',
    });
  }
}

module.exports = {
  register,
  login,
};
