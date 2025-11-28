module.exports = function (module, requiredLevel) {
  return (req, res, next) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // SuperAdmin bypasses all permission checks using role
    if (user.role === 'superAdmin') {
      return next();
    }

    // If no permissions object, deny
    if (!user.permissions || !user.permissions[module]) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    const userLevel = user.permissions[module];

    // Permission hierarchy
    const levels = ['none', 'view', 'edit', 'full'];
    const userIdx = levels.indexOf(userLevel);
    const requiredIdx = levels.indexOf(requiredLevel);

    if (userIdx === -1 || requiredIdx === -1 || userIdx < requiredIdx) {
      return res.status(403).json({ message: 'Permission denied' });
    }

 next();
  };
};