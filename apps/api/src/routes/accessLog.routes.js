const router = require('express').Router();
const { getLogs, createLog, updateLog } = require('../controllers/accessLog.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.use(protect);
router.route('/')
  .get(getLogs)
  .post(authorize('SUPER_ADMIN', 'BRANCH_MANAGER', 'LOCKER_OFFICER'), createLog);
router.route('/:id')
  .put(authorize('SUPER_ADMIN', 'BRANCH_MANAGER', 'LOCKER_OFFICER'), updateLog);

module.exports = router;
