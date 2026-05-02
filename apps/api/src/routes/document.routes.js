const router = require('express').Router();
const { getDocuments, uploadDocument, deleteDocument, verifyDocument } = require('../controllers/document.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const { upload } = require('../middlewares/upload.middleware');

router.use(protect);
router.route('/')
  .get(getDocuments)
  .post(upload.single('file'), uploadDocument);
router.route('/:id')
  .delete(authorize('SUPER_ADMIN', 'BRANCH_MANAGER'), deleteDocument);
router.put('/:id/verify', authorize('SUPER_ADMIN', 'BRANCH_MANAGER'), verifyDocument);

module.exports = router;
