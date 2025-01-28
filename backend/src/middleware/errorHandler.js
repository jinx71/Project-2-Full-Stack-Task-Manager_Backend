// Central error handler — controllers forward unexpected errors here
const errorHandler = (err, req, res, next) => {
  console.error(`[${new Date().toISOString()}]`, err);

  // Prisma unique constraint (e.g. duplicate email) — friendly 409 instead of a 500
  if (err.code === 'P2002') {
    return res.status(409).json({ success: false, data: null, message: 'A record with that value already exists' });
  }

  res.status(err.status || 500).json({
    success: false,
    data: null,
    message: err.status ? err.message : 'Internal server error',
  });
};

const notFound = (req, res) => {
  res.status(404).json({ success: false, data: null, message: `Route not found: ${req.method} ${req.originalUrl}` });
};

module.exports = { errorHandler, notFound };
