const router = require('express').Router();
const { getDashboardStats, getRevenueReport, getBranchReport, getExpiringLockers } = require('../controllers/report.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.use(protect);
router.get('/dashboard', getDashboardStats);
router.get('/revenue', authorize('SUPER_ADMIN', 'BRANCH_MANAGER'), getRevenueReport);
router.get('/branches', authorize('SUPER_ADMIN'), getBranchReport);
router.get('/expiring-lockers', getExpiringLockers);

module.exports = router;
