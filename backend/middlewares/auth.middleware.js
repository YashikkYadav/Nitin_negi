const User = require('../models/user');
const Doctor = require('../models/doctor');
const { verifyAccessToken } = require('../utils/helpers');

module.exports = async function (req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = await verifyAccessToken(token);
    const { id, doctorId, email, role } = decoded.data || {};

    if (!id || !email || !role) {
      return res.status(401).json({ message: 'Invalid token payload' });
    }

    let user;
    if (role === 'superAdmin') {
      user = await Doctor.findById(id).select('-password');
      if (!user) return res.status(401).json({ message: 'Doctor (superAdmin) not found' });
      req.user = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: 'superAdmin',
        doctorId: user._id, // For superAdmin, doctorId is their own id
      };
    } else {
      user = await User.findById(id).select('-password');
      if (!user) return res.status(401).json({ message: 'User not found' });
      req.user = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
        doctorId: user.doctorId,
      };
    }

    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

