const jwt = require('jsonwebtoken');

// Verifies "Authorization: Bearer <token>" and attaches userId to req
const requireAuth = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, data: null, message: 'Authentication required' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.sub;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, data: null, message: 'Invalid or expired token' });
  }
};

module.exports = requireAuth;
