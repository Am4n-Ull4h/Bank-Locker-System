const router = require('express').Router();
const { login, getMe, updateMe, getSettings, updateSettings, changePassword, logout } = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');

router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.get('/settings', protect, getSettings);
router.put('/settings', protect, updateSettings);
router.put('/change-password', protect, changePassword);

module.exports = router;
