const userService = require('../services/user.service');
const { comparePassword, getAccessToken } = require('../utils/helpers');

// POST /users/login
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const user = await userService.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const valid = await comparePassword(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    // Remove password from user object before sending
    const userObj = user.toObject();
    delete userObj.password;
    const accessToken = getAccessToken({ id: user._id, email: user.email, doctorId: user.doctorId, role: user.role });
    res.json({ user: userObj, accessToken });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
};

// GET /users
exports.getUsersByDoctor = async (req, res) => {
  try {
    // Use doctorId from req.user
    const doctorId = req.user.doctorId;
    if (!doctorId) return res.status(400).json({ error: 'doctorId is required' });
    const users = await userService.getUsersByDoctor(doctorId);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// POST /users
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, permissions, avatar } = req.body;
    const doctorId = req.user.doctorId; // Always use doctorId from req.user
    if (!name || !email || !doctorId) {
      return res.status(400).json({ error: 'Name, email, and doctorId are required' });
    }
    const user = await userService.createUser({ name, email, password, role, permissions, avatar, doctorId });
    if (user.error) {
      return res.status(user.status || 400).json({ error: user.error });
    }
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create user' });
  }
};

// PUT /users/:userId
exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, password, role, permissions, avatar } = req.body;
    // Optionally, you can ensure the user being updated belongs to the same doctorId as req.user.doctorId
    const user = await userService.updateUser(userId, { name, email, password, role, permissions, avatar });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user' });
  }
};

// DELETE /users/:userId
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    // Optionally, you can ensure the user being deleted belongs to the same doctorId as req.user.doctorId
    const result = await userService.deleteUser(userId);
    if (!result) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await userService.getUserById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};