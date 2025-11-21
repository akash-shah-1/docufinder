const User = require('../models/User');

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