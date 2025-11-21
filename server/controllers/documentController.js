const Document = require('../models/Document');
const imagekit = require('../utils/imageKit');

// @desc    Get documents
// @route   GET /api/documents
exports.getDocuments = async (req, res) => {
  try {
    const { folderId } = req.query;
    const query = { userId: req.user._id };
    if (folderId) query.folderId = folderId;

    const docs = await Document.find(query).sort({ createdAt: -1 });
    res.status(200).json(docs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create document (Uploads image to ImageKit)
// @route   POST /api/documents
exports.createDocument = async (req, res) => {
  try {
    const { imageUrl, ...docData } = req.body; // imageUrl here is likely base64 from frontend analysis

    let uploadedImage = { url: imageUrl, fileId: null };

    // If it's a base64 data URI, upload to ImageKit
    if (imageUrl && imageUrl.startsWith('data:')) {
        try {
             // Check if we have valid ImageKit creds, otherwise fallback to storing base64 (not recommended for production)
             if (process.env.IMAGEKIT_PUBLIC_KEY && !process.env.IMAGEKIT_PUBLIC_KEY.includes('placeholder')) {
                const uploadResponse = await imagekit.upload({
                    file: imageUrl, // ImageKit accepts base64
                    fileName: `doc_${Date.now()}_${docData.title.replace(/\s+/g, '_')}`,
                    folder: '/documind'
                });
                uploadedImage = { url: uploadResponse.url, fileId: uploadResponse.fileId };
             }
        } catch (ikError) {
            console.error("ImageKit Upload Failed:", ikError);
            // Proceeding with base64 or original url if upload fails
        }
    }

    const doc = await Document.create({
      ...docData,
      userId: req.user._id,
      imageUrl: uploadedImage.url,
      fileId: uploadedImage.fileId
    });

    res.status(201).json(doc);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update document
// @route   PUT /api/documents/:id
exports.updateDocument = async (req, res) => {
  try {
    const doc = await Document.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    res.status(200).json(doc);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete document
// @route   DELETE /api/documents/:id
exports.deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, userId: req.user._id });
    if (!doc) return res.status(404).json({ message: 'Document not found' });

    // Delete from ImageKit if exists
    if (doc.fileId) {
        imagekit.deleteFile(doc.fileId).catch(err => console.error("ImageKit Delete Error", err));
    }

    await doc.deleteOne();
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Sync Gallery (Batch Import)
// @route   POST /api/documents/sync
exports.syncGallery = async (req, res) => {
  try {
    const { items } = req.body; // Array of docs
    if (!items || !Array.isArray(items)) return res.status(400).json({ message: 'Invalid data' });

    const createdDocs = [];
    
    // Process individually to handle uploads
    // In a real app, use Promise.all with concurrency limit
    for (const item of items) {
        // Mock upload or simple save for batch
        const doc = await Document.create({
            ...item,
            userId: req.user._id,
            folderId: 'root' // Default to root for sync
        });
        createdDocs.push(doc);
    }

    res.status(201).json(createdDocs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};