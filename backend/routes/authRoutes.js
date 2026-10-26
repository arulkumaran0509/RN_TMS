const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.get('/roles', authController.getPublicRoles);
router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/users', protect, authController.getAllUsers);
router.get('/me', protect, authController.getMe);
router.put('/profile', protect, authController.updateProfile);

module.exports = router;
