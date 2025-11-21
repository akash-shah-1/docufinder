const User = require('../models/User');
const Folder = require('../models/Folder');
const Document = require('../models/Document');
const imagekit = require('../utils/imageKit');

// @desc    Login or Register with Google (Simulated)
// @route   POST /api/auth/login
exports.loginUser = async (req, res) => {
  const { email, name, avatar, googleId } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        avatar: avatar || `https://ui-avatars.com/api/?name=${name}&background=random`,
        googleId
      });
    }

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      },
      token: user._id // In production, sign a JWT here
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update User Profile
// @route   PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.avatar = req.body.avatar || user.avatar;

      const updatedUser = await user.save();

      res.json({
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete User Account & All Data
// @route   DELETE /api/auth/profile
exports.deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      // 1. Delete all documents (and optionally images from ImageKit)
      const docs = await Document.find({ userId: user._id });
      
      // Best effort to clean up ImageKit
      for (const doc of docs) {
          if (doc.fileId) {
              try {
                 await imagekit.deleteFile(doc.fileId);
              } catch (e) {
                  console.error(`Failed to delete image ${doc.fileId}`, e);
              }
          }
      }

      await Document.deleteMany({ userId: user._id });

      // 2. Delete all folders
      await Folder.deleteMany({ userId: user._id });

      // 3. Delete user
      await user.deleteOne();

      res.json({ message: 'User and all data removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};