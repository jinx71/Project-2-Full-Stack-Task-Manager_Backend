const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const { validateRegister, validateLogin } = require('../utils/validate');

const signToken = (userId) =>
  jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const publicUser = ({ id, name, email, createdAt }) => ({ id, name, email, createdAt });

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const errors = validateRegister(req.body || {});
    if (errors.length) {
      return res.status(400).json({ success: false, data: null, message: errors.join('. ') });
    }

    const { name, email, password } = req.body;
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return res.status(409).json({ success: false, data: null, message: 'An account with this email already exists' });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name: name.trim(), email: email.toLowerCase(), password: hashed },
    });

    res.status(201).json({
      success: true,
      data: { user: publicUser(user), token: signToken(user.id) },
      message: 'Account created',
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const errors = validateLogin(req.body || {});
    if (errors.length) {
      return res.status(400).json({ success: false, data: null, message: errors.join('. ') });
    }

    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    // Same message for unknown email and wrong password — avoids leaking which emails exist
    const invalid = () =>
      res.status(401).json({ success: false, data: null, message: 'Invalid email or password' });

    if (!user) return invalid();
    const match = await bcrypt.compare(password, user.password);
    if (!match) return invalid();

    res.json({
      success: true,
      data: { user: publicUser(user), token: signToken(user.id) },
      message: 'Logged in',
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me — used by the frontend to restore a session on refresh
const me = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) {
      return res.status(404).json({ success: false, data: null, message: 'User not found' });
    }
    res.json({ success: true, data: { user: publicUser(user) }, message: 'OK' });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, me };

// this is auth controller
