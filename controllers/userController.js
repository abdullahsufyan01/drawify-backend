// controllers/userController.js
exports.getProfile = async (req, res) => {
  console.log('user fetch api hit')
  try {
    const user = req.user; // set by auth middleware

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const safeUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    };

    res.status(200).json({ user: user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
