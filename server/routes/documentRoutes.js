const express = require('express');
const router = express.Router();
const { getDocuments, createDocument, updateDocument, deleteDocument, syncGallery } = require('../controllers/documentController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getDocuments);
router.post('/', protect, createDocument);
router.post('/sync', protect, syncGallery);
router.put('/:id', protect, updateDocument);
router.delete('/:id', protect, deleteDocument);

module.exports = router;