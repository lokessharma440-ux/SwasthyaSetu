const { z } = require('zod');
const MedicalDocument = require('../models/MedicalDocument');
const Patient = require('../models/Patient');
const { logActivity } = require('../utils/logger');

const uploadDocumentSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'),
  complaintId: z.string().optional(),
  fileName: z.string().min(1, 'File name is required'),
  fileType: z.string().optional().default('application/octet-stream'),
  fileSize: z.number().optional().default(0),
  storagePath: z.string().optional().default(''),
  documentType: z.enum(['prescription', 'lab report', 'medical report', 'other']).optional()
});

const patientParamSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required')
});

// @desc    Upload document metadata
// @route   POST /api/documents
exports.uploadDocument = async (req, res, next) => {
  try {
    const parseResult = uploadDocumentSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid document upload payload',
        errors: parseResult.error.issues
      });
    }

    const { patientId, complaintId, fileName, fileType, fileSize, storagePath, documentType } = parseResult.data;
    
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
    const parseResult = patientParamSchema.safeParse(req.params);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid patient ID parameter',
        errors: parseResult.error.issues
      });
    }

    const documents = await MedicalDocument.find({ patientId: parseResult.data.patientId })
      .sort('-createdAt')
      .lean();
    res.status(200).json({ success: true, data: documents });
  } catch (error) {
    next(error);
  }
};
