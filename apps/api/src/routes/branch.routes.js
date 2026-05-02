const router = require('express').Router();
const { getBranches, getBranch, createBranch, updateBranch, deleteBranch } = require('../controllers/branch.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.use(protect);
router.route('/')
  .get(getBranches)
  .post(authorize('SUPER_ADMIN'), createBranch);
router.route('/:id')
  .get(getBranch)
  .put(authorize('SUPER_ADMIN'), updateBranch)
  .delete(authorize('SUPER_ADMIN'), deleteBranch);

module.exports = router;
