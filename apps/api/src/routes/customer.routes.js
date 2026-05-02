const router = require('express').Router();
const { getCustomers, exportCustomers, getCustomer, createCustomer, updateCustomer, verifyKYC, getMyCustomerProfile } = require('../controllers/customer.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.use(protect);
router.get('/me', authorize('CUSTOMER'), getMyCustomerProfile);
router.get('/export', authorize('SUPER_ADMIN', 'BRANCH_MANAGER', 'LOCKER_OFFICER'), exportCustomers);
router.route('/')
  .get(authorize('SUPER_ADMIN', 'BRANCH_MANAGER', 'LOCKER_OFFICER'), getCustomers)
  .post(authorize('SUPER_ADMIN', 'BRANCH_MANAGER', 'LOCKER_OFFICER'), createCustomer);
router.route('/:id')
  .get(getCustomer)
  .put(authorize('SUPER_ADMIN', 'BRANCH_MANAGER', 'LOCKER_OFFICER'), updateCustomer);
router.put('/:id/verify-kyc', authorize('SUPER_ADMIN', 'BRANCH_MANAGER'), verifyKYC);

module.exports = router;
