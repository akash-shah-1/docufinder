const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const User = require('./models/User');
require('dotenv').config();

// Routes
const authRoutes = require('./routes/authRoutes');
const folderRoutes = require('./routes/folderRoutes');
const documentRoutes = require('./routes/documentRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Middleware
app.use(cors());
// Increase limit for base64 uploads
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Simple Authentication Middleware
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

// Export middleware for routes to use
module.exports.protect = protect;

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api/documents', documentRoutes);

app.get('/', (req, res) => {
  res.send('DocuMind API is running...');
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));