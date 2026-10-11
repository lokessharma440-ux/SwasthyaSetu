const express = require('express');
const { uploadDocument, getPatientDocuments } = require('../controllers/medicalDocumentController');

const router = express.Router();

router.post('/', uploadDocument);
router.get('/patient/:patientId', getPatientDocuments);

module.exports = router;
