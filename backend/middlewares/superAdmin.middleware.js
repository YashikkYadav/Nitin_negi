const {Roles} = require('../constants/permissions.constants');

module.exports = function (req, res, next) {
  if (req.user && req.user.role === Roles.SUPER_ADMIN) {
    return next();
  }
  return res.status(403).json({ message: 'Permission denied: SuperAdmin only' });
};