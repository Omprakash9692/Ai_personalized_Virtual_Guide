const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

// Secret for JWT - in production this should be in .env
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_for_dev';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '964695678508-hs6p98llsa4lg58qa3cqse1d7d4t81gn.apps.googleusercontent.com';

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

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
      authProvider: 'local',
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

    // If user signed up with Google, they can't login with password
    if (user.authProvider === 'google') {
      return res.status(400).json({
        success: false,
        error: 'This account uses Google Sign-In. Please sign in with Google.',
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

/**
 * Handle Google OAuth login/register
 * Verifies the Google ID token, finds or creates the user, and returns a JWT.
 * 
 * @route POST /api/auth/google
 */
async function googleLogin(req, res) {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        error: 'Google credential token is required.',
      });
    }

    // Verify the Google ID token
    let ticket;
    try {
      ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: GOOGLE_CLIENT_ID,
      });
    } catch (verifyError) {
      console.error('[Auth Controller - Google] Token verification failed:', verifyError.message);
      return res.status(401).json({
        success: false,
        error: 'Invalid Google token.',
      });
    }

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Google account does not have an email address.',
      });
    }

    // Find or create the user
    let user = await User.findOne({ email });

    if (user) {
      // User exists — update Google info if not already set
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = 'google';
      }
      if (picture && !user.avatar) {
        user.avatar = picture;
      }
      await user.save();
    } else {
      // Create a new user
      const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      user = await User.create({
        userId,
        name: name || email.split('@')[0],
        email,
        googleId,
        authProvider: 'google',
        avatar: picture || '',
      });
    }

    // Generate JWT
    const token = jwt.sign({ userId: user.userId, email: user.email }, JWT_SECRET, {
      expiresIn: '7d',
    });

    return res.status(200).json({
      success: true,
      message: 'Google login successful',
      token,
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        preferredLanguage: user.preferredLanguage,
      },
    });
  } catch (error) {
    console.error('[Auth Controller Error - Google Login]:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error during Google login.',
    });
  }
}

module.exports = {
  register,
  login,
  googleLogin,
};
