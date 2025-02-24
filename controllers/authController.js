const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');
const Admin = require('../models/Admin');

dotenv.config();

/**
 * Generates an Access Token (valid for 15 minutes)
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
};

/**
 * Generates a Refresh Token (valid for 7 days)
 */
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );
};

/**
 * User/Admin Registration
 */
// const bcrypt = require('bcryptjs');
/**
 * 🔐 User/Admin Registration
 */
exports.register = async (req, res) => {
  const { name, email, password, phoneNumber, role } = req.body;

  try {
    if (!['admin', 'user'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified.' });
    }

    const Model = role === 'admin' ? Admin : User;
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await Model.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    // 🆕 Create and save the user
    const newUser = new Model({ name, email: normalizedEmail, password, phoneNumber, role });
    await newUser.save();

    // 🔑 Generate tokens
    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    // 📝 Save refresh token to user
    newUser.refreshTokens.push({ token: refreshToken, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
    await newUser.save();

    res.status(201).json({
      message: `${role} registered successfully.`,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed.', error: error.message });
  }
};

/**
 * 🔑 User/Admin Login
 */
exports.login = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    const Model = role === 'admin' ? Admin : User;
    const user = await Model.findOne({ email: email.trim().toLowerCase() }).select('+password');

    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // 🔒 Password comparison
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // 🔑 Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // 📝 Update user's refreshTokens array
    user.refreshTokens.push({ token: refreshToken, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
    await user.save();

    res.status(200).json({ accessToken, refreshToken });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed.', error: error.message });
  }
};
/**
 * Refresh Access Token
 */
exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token required.' });
  }

  try {
    // 🔑 Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    const Model = decoded.role === 'admin' ? Admin : User;
    const user = await Model.findById(decoded.id);

    if (!user) {
      return res.status(403).json({ message: 'User not found.' });
    }

    // 🛡️ Check if refresh token exists and hasn't expired
    const tokenEntry = user.refreshTokens.find(
      (t) => t.token === refreshToken && (!t.expiresAt || new Date(t.expiresAt) > new Date())
    );

    if (!tokenEntry) {
      return res.status(403).json({ message: 'Invalid or expired refresh token.' });
    }

    // 🔄 Generate new access token
    const newAccessToken = generateAccessToken(user);

    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    console.error('Token refresh error:', error);
    return res.status(403).json({
      message: error.name === 'TokenExpiredError' ? 'Refresh token expired.' : 'Token verification failed.',
      error: error.message,
    });
  }
};


/**
 * Logout (Invalidate Refresh Token)
 */
exports.logout = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ message: 'Refresh token required.' });

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const Model = decoded.role === 'admin' ? Admin : User;
    const user = await Model.findById(decoded.id);

    user.refreshTokens = user.refreshTokens.filter((t) => t.token !== refreshToken);
    await user.save();

    res.status(200).json({ message: 'Logged out successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Logout failed.', error: error.message });
  }
};
