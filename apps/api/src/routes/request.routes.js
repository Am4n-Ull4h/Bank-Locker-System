const router = require('express').Router();
const { getRequests, exportRequests, getRequest, createRequest, updateRequest, resolveRequest, addComment, getMyRequests, createMyRequest } = require('../controllers/request.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.use(protect);
router.get('/export', authorize('SUPER_ADMIN', 'BRANCH_MANAGER', 'LOCKER_OFFICER'), exportRequests);
router.route('/me')
  .get(authorize('CUSTOMER'), getMyRequests)
  .post(authorize('CUSTOMER'), createMyRequest);
router.route('/')
  .get(getRequests)
  .post(createRequest);
router.route('/:id')
  .get(getRequest)
  .put(authorize('SUPER_ADMIN', 'BRANCH_MANAGER', 'LOCKER_OFFICER'), updateRequest);
router.put('/:id/resolve', authorize('SUPER_ADMIN', 'BRANCH_MANAGER', 'LOCKER_OFFICER'), resolveRequest);
router.post('/:id/comments', addComment);

module.exports = router;
