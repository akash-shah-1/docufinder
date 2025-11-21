const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      // For demo, we are using the User ID as the token. 
      // In production, verify JWT: const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(token);
      if (!user) throw new Error('Not authorized');
      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };