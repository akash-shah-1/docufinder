const express = require('express');
const router = express.Router();
const { getFolders, createFolder, shareFolder } = require('../controllers/folderController');
const { protect } = require('../index'); // Import middleware from index or separate middleware file

router.get('/', protect, getFolders);
router.post('/', protect, createFolder);
router.post('/:id/share', protect, shareFolder);

module.exports = router;