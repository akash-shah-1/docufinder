const express = require('express');
const router = express.Router();
const { loginUser, updateProfile, deleteAccount } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/login', loginUser);
router.put('/profile', protect, updateProfile);
router.delete('/profile', protect, deleteAccount);

module.exports = router;