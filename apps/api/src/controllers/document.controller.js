const Document = require('../models/Document.model');
const { uploadToCloudinary, deleteFromCloudinary } = require('../middlewares/upload.middleware');
const { createError, sendResponse, audit } = require('../utils/helpers');

exports.getDocuments = async (req, res, next) => {
  try {
    const { owner, ownerModel, documentType } = req.query;
    const filter = {};
    if (owner) filter.owner = owner;
    if (ownerModel) filter.ownerModel = ownerModel;
    if (documentType) filter.documentType = documentType;
    const docs = await Document.find(filter).populate('uploadedBy', 'name').sort('-createdAt');
    res.json({ success: true, data: docs });
  } catch (err) { next(err); }
};

exports.uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) return next(createError('No file provided', 400));
    const result = await uploadToCloudinary(req.file.buffer, 'documents');
    const doc = await Document.create({
      owner: req.body.owner,
      ownerModel: req.body.ownerModel,
      documentType: req.body.documentType,
      fileName: req.file.originalname,
      fileUrl: result.secure_url,
      publicId: result.public_id,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadedBy: req.user._id,
    });
    await audit(req.user._id, 'UPLOAD_DOCUMENT', 'Document', doc._id, { documentType: doc.documentType }, req);
    sendResponse(res, 201, doc, 'Document uploaded');
  } catch (err) { next(err); }
};

exports.deleteDocument = async (req, res, next) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return next(createError('Document not found', 404));
    if (doc.publicId) await deleteFromCloudinary(doc.publicId);
    await doc.deleteOne();
    await audit(req.user._id, 'DELETE_DOCUMENT', 'Document', doc._id, {}, req);
    sendResponse(res, 200, null, 'Document deleted');
  } catch (err) { next(err); }
};

exports.verifyDocument = async (req, res, next) => {
  try {
    const doc = await Document.findByIdAndUpdate(
      req.params.id,
      { isVerified: true, verifiedBy: req.user._id, verifiedAt: new Date() },
      { new: true }
    );
    if (!doc) return next(createError('Document not found', 404));
    sendResponse(res, 200, doc, 'Document verified');
  } catch (err) { next(err); }
};
