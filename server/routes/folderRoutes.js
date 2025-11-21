const express = require('express');
const router = express.Router();
const { getFolders, createFolder, shareFolder, deleteFolder } = require('../controllers/folderController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getFolders);
router.post('/', protect, createFolder);
router.post('/:id/share', protect, shareFolder);
router.delete('/:id', protect, deleteFolder);

module.exports = router;