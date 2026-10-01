const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    // Check if request carries simulated test user/role (supports frontend test mode)
    const simulatedId = req.headers['x-user-id'] || req.body.professor_id || req.body.created_by || req.body.sender_id || req.body.uploaded_by;
    if (simulatedId) {
      if (typeof simulatedId === 'string' && simulatedId.length === 24) {
        req.user = await User.findById(simulatedId);
      }
    }
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, token missing' });
    }
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'campusconnect_super_secret_jwt_key_2026');
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized, invalid token' });
  }
};

const optionalProtect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'campusconnect_super_secret_jwt_key_2026');
      req.user = await User.findById(decoded.id).select('-password');
    } catch (e) {
      // Ignore token failure for optional endpoints
    }
  }
  next();
};

const authorize = (...roles) => {
  return (req, res, next) => {
    // Read role from user or fallback to client test header / body parameter
    const currentRole = req.user?.role || req.headers['x-role'] || (req.body?.professor_id ? 'professor' : (req.body?.created_by ? 'cr' : null));
    if (!currentRole || !roles.includes(currentRole.toLowerCase())) {
      return res.status(403).json({
        message: `Forbidden: role '${currentRole || 'guest'}' does not have permission. Required: ${roles.join(' or ')}`
      });
    }
    next();
  };
};

module.exports = { protect, optionalProtect, authorize };
