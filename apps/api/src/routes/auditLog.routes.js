const router = require('express').Router();
const { getAuditLogs } = require('../controllers/auditLog.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.use(protect, authorize('SUPER_ADMIN', 'BRANCH_MANAGER'));
router.get('/', getAuditLogs);

module.exports = router;