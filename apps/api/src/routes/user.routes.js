const router = require('express').Router();
const { getUsers, exportUsers, getUser, createUser, updateUser, deleteUser } = require('../controllers/user.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.use(protect);
router.get('/export', authorize('SUPER_ADMIN', 'BRANCH_MANAGER'), exportUsers);
router.route('/')
  .get(authorize('SUPER_ADMIN', 'BRANCH_MANAGER'), getUsers)
  .post(authorize('SUPER_ADMIN', 'BRANCH_MANAGER'), createUser);
router.route('/:id')
  .get(authorize('SUPER_ADMIN', 'BRANCH_MANAGER'), getUser)
  .put(authorize('SUPER_ADMIN', 'BRANCH_MANAGER'), updateUser)
  .delete(authorize('SUPER_ADMIN'), deleteUser);

module.exports = router;
