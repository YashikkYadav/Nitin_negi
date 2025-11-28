const express = require('express');
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const superAdminMiddleware = require('../middlewares/superAdmin.middleware');
const router = express.Router();

router.post('/access-token', userController.loginUser);
router.get('/', authMiddleware, superAdminMiddleware, userController.getUsersByDoctor);
router.post('/', authMiddleware, superAdminMiddleware, userController.createUser);
router.put('/:userId', authMiddleware, superAdminMiddleware, userController.updateUser);
router.delete('/:userId', authMiddleware, superAdminMiddleware, userController.deleteUser);
router.get('/:userId', authMiddleware, userController.getUserById);

module.exports = router;