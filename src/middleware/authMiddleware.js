const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization header missing or invalid' });
    }

    const token = authHeader.split(' ')[1];
    console.log('Extracted Token:', token);

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.error('JWT Verification Error:', err.message);
        return res.status(401).json({ error: 'Invalid token', details: err.message });
      }

      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error('Auth Middleware Error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = authMiddleware;
