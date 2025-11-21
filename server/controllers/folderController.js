const Folder = require('../models/Folder');
const Document = require('../models/Document');

// @desc    Get user folders
// @route   GET /api/folders
exports.getFolders = async (req, res) => {
  try {
    const folders = await Folder.find({
      $or: [{ userId: req.user._id }, { sharedWith: req.user.email }]
    });
    res.status(200).json(folders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create folder
// @route   POST /api/folders
exports.createFolder = async (req, res) => {
  try {
    const { name, color } = req.body;
    const folder = await Folder.create({
      name,
      color,
      userId: req.user._id
    });
    res.status(201).json(folder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Share folder
// @route   POST /api/folders/:id/share
exports.shareFolder = async (req, res) => {
  try {
    const { email } = req.body;
    const folder = await Folder.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $addToSet: { sharedWith: email } },
      { new: true }
    );
    if (!folder) return res.status(404).json({ message: 'Folder not found or unauthorized' });
    res.status(200).json(folder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete folder
// @route   DELETE /api/folders/:id
exports.deleteFolder = async (req, res) => {
  try {
    const folder = await Folder.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    
    if (!folder) {
      return res.status(404).json({ message: 'Folder not found or unauthorized' });
    }

    // Move all documents in this folder to 'root' to prevent data loss
    await Document.updateMany(
      { folderId: req.params.id },
      { folderId: 'root' }
    );

    res.status(200).json({ message: 'Folder deleted and documents moved to root', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
