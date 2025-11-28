const User = require('../models/user');
const { getHashedPassword } = require('../utils/helpers');
const { Types } = require('mongoose');

exports.getUsersByDoctor = async (doctorId) => {
  return await User.find({ doctorId });
};

exports.createUser = async ({ name, email, password, role, permissions, avatar, doctorId }) => {
  // Optionally: check for duplicate email for the same doctor
  const existing = await User.findOne({ email, doctorId });
  if (existing) {
    return { error: 'User with this email already exists', status: 409 };
  }
  // Hash the password before saving
  const hashedPassword = await getHashedPassword(password || 'changeme123');
  const user = new User({
    name,
    email,
    password: hashedPassword,
    role,
    permissions,
    avatar,
    doctorId
  });
  await user.save();
  return user;
};

exports.updateUser = async (userId, { name, email, password, role, permissions, avatar }) => {
  // Prepare update object
  const updateObj = { name, email, role, permissions, avatar };
  if (password) {
    updateObj.password = await getHashedPassword(password);
  }
  return await User.findByIdAndUpdate(
    userId,
    updateObj,
    { new: true }
  );
};

exports.deleteUser = async (userId) => {
  return await User.findByIdAndDelete(userId);
};

exports.findUserByEmailAndDoctor = async (email, doctorId) => {
  return await User.findOne({ email, doctorId });
};

exports.findUserByEmail = async (email) => {
  return await User.findOne({ email });
};

exports.getUserById = async (userId) => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new Error('Invalid userId');
  }
  return await User.findById(userId);
};