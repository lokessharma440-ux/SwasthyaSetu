const MedicalDocument = require('../models/MedicalDocument');
const Patient = require('../models/Patient');
const { logActivity } = require('../utils/logger');

// @desc    Upload document metadata
// @route   POST /api/documents
exports.uploadDocument = async (req, res, next) => {
  try {
    const { patientId, complaintId, fileName, fileType, fileSize, storagePath, documentType } = req.body;
    
    const doc = await MedicalDocument.create({
      patientId,
      complaintId,
      fileName,
      fileType,
      fileSize,
      storagePath,
      documentType
    });
    
    await logActivity({
      action: 'document_uploaded',
      entityType: 'MedicalDocument',
      entityId: doc._id,
      actorType: 'patient',
      actorId: patientId
    });

    res.status(201).json({ success: true, data: doc });
  } catch (error) {
    next(error);
  }
};

// @desc    Get patient documents
// @route   GET /api/documents/patient/:patientId
exports.getPatientDocuments = async (req, res, next) => {
  try {
    const documents = await MedicalDocument.find({ patientId: req.params.patientId }).sort('-createdAt');
    res.status(200).json({ success: true, data: documents });
  } catch (error) {
    next(error);
  }
};
