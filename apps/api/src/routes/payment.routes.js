const router = require('express').Router();
const { getPayments, exportPayments, getPayment, createPayment, processPayment, getPaymentSummary, getMyPayments } = require('../controllers/payment.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.use(protect);
router.get('/summary', getPaymentSummary);
router.get('/me', authorize('CUSTOMER'), getMyPayments);
router.get('/export', authorize('SUPER_ADMIN', 'BRANCH_MANAGER', 'LOCKER_OFFICER'), exportPayments);
router.route('/')
  .get(getPayments)
  .post(authorize('SUPER_ADMIN', 'BRANCH_MANAGER', 'LOCKER_OFFICER'), createPayment);
router.route('/:id')
  .get(getPayment);
router.put('/:id/process', authorize('SUPER_ADMIN', 'BRANCH_MANAGER', 'LOCKER_OFFICER'), processPayment);

module.exports = router;
