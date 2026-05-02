const router = require('express').Router();
const { getAllocations, getAllocation, createAllocation, updateAllocation, terminateAllocation, getMyAllocations } = require('../controllers/allocation.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.use(protect);
router.get('/me', authorize('CUSTOMER'), getMyAllocations);
router.route('/')
  .get(getAllocations)
  .post(authorize('SUPER_ADMIN', 'BRANCH_MANAGER', 'LOCKER_OFFICER'), createAllocation);
router.route('/:id')
  .get(getAllocation)
  .put(authorize('SUPER_ADMIN', 'BRANCH_MANAGER'), updateAllocation);
router.put('/:id/terminate', authorize('SUPER_ADMIN', 'BRANCH_MANAGER'), terminateAllocation);

module.exports = router;
