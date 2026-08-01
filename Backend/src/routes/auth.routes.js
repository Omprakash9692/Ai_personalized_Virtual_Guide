const express = require('express');
const { register, login, googleLogin } = require('../controllers/auth.controller');

const router = express.Router();

/**
 * @route POST /api/auth/register
 */
router.post('/register', register);

/**
 * @route POST /api/auth/login
 */
router.post('/login', login);

/**
 * @route POST /api/auth/google
 */
router.post('/google', googleLogin);

module.exports = router;
