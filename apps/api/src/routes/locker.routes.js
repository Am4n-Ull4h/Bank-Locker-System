const router = require('express').Router();
const { getLockers, getLocker, createLocker, updateLocker, deleteLocker, getLockerStats } = require('../controllers/locker.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.use(protect);
router.get('/stats', getLockerStats);
router.route('/')
  .get(getLockers)
  .post(authorize('SUPER_ADMIN', 'BRANCH_MANAGER'), createLocker);
router.route('/:id')
  .get(getLocker)
  .put(authorize('SUPER_ADMIN', 'BRANCH_MANAGER', 'LOCKER_OFFICER'), updateLocker)
  .delete(authorize('SUPER_ADMIN', 'BRANCH_MANAGER'), deleteLocker);

module.exports = router;
