const { test, describe } = require('node:test');
const assert = require('node:assert/strict');

const complaintController = require('../controllers/complaintController');
const doctorController = require('../controllers/doctorController');
const facilityController = require('../controllers/facilityController');
const medicalDocumentController = require('../controllers/medicalDocumentController');
const patientController = require('../controllers/patientController');

function createMockRes() {
  const res = {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    }
  };
  return res;
}

describe('Controllers Schema Validation (Zod) Tests', () => {
  test('doctorController.createResponse rejects missing or empty guidance', async () => {
    const req = {
      body: {
        guidance: '',
        precautions: 'Some note'
      },
      params: { id: '507f1f77bcf86cd799439011' }
    };
    const res = createMockRes();

    await doctorController.createResponse(req, res, () => {});

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.success, false);
    assert.ok(res.body.errors || res.body.message);
  });

  test('patientController.createPatient rejects missing required name or location', async () => {
    const req = {
      body: {
        name: '',
        location: ''
      }
    };
    const res = createMockRes();

    await patientController.createPatient(req, res, () => {});

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.success, false);
    assert.equal(res.body.message, 'Invalid patient data');
  });

  test('medicalDocumentController.uploadDocument rejects missing required fields', async () => {
    const req = {
      body: {
        // missing patientId and fileName
        fileType: 'pdf'
      }
    };
    const res = createMockRes();

    await medicalDocumentController.uploadDocument(req, res, () => {});

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.success, false);
    assert.equal(res.body.message, 'Invalid document upload payload');
  });

  test('facilityController.getFacility rejects empty facility id', async () => {
    const req = {
      params: {
        id: ''
      }
    };
    const res = createMockRes();

    await facilityController.getFacility(req, res, () => {});

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.success, false);
    assert.equal(res.body.message, 'Invalid facility ID parameter');
  });

  test('doctorController.previewTranslation handles empty input gracefully', async () => {
    const req = {
      body: {
        text: '   ',
        targetLang: 'hi-IN'
      }
    };
    const res = createMockRes();

    await doctorController.previewTranslation(req, res, () => {});

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.translatedText, '');
  });
});

