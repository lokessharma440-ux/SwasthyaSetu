const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const doctorAuthController = require('../controllers/doctorAuthController');
const Doctor = require('../models/Doctor');

// Mock Express response helper
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

describe('Doctor Authentication Controller Unit Tests', () => {
  test('Negative test: rejects missing doctorId and password', async () => {
    const req = { body: {} };
    const res = createMockRes();
    let nextCalled = false;

    await doctorAuthController.loginDoctor(req, res, () => { nextCalled = true; });

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.success, false);
    assert.ok(res.body.message.includes('required'));
    assert.equal(nextCalled, false);
  });

  test('Negative test: rejects short password (< 8 characters)', async () => {
    const testCases = ['123', 'short', 'abc1234', '1234567'];

    for (const pwd of testCases) {
      const req = {
        body: {
          doctorId: 'DOC-DEMO-001',
          password: pwd
        }
      };
      const res = createMockRes();

      await doctorAuthController.loginDoctor(req, res, () => {});

      assert.equal(res.statusCode, 400, `Expected 400 for password "${pwd}"`);
      assert.equal(res.body.success, false);
      assert.equal(res.body.message, 'Password must be at least 8 characters long');
    }
  });

  test('Boundary / Demo bypass test: demo123 is accepted past length validation', async () => {
    const originalFindOne = Doctor.findOne;
    Doctor.findOne = () => ({
      lean: async () => ({
        doctorId: 'DOC-DEMO-001',
        passwordHash: 'demo123',
        name: 'Dr. Demo Sharma'
      })
    });

    try {
      const req = {
        body: {
          doctorId: 'DOC-DEMO-001',
          password: 'demo123'
        }
      };
      const res = createMockRes();

      await doctorAuthController.loginDoctor(req, res, () => {});

      assert.equal(res.statusCode, 200, 'Expected 200 for valid demo credentials');
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.name, 'Dr. Demo Sharma');
    } finally {
      Doctor.findOne = originalFindOne;
    }
  });

  test('Positive test: valid doctor password (>= 8 characters) logs in successfully', async () => {
    const originalFindOne = Doctor.findOne;
    Doctor.findOne = () => ({
      lean: async () => ({
        doctorId: 'DOC-PRO-999',
        passwordHash: 'validPassword123',
        name: 'Dr. Specialist'
      })
    });

    try {
      const req = {
        body: {
          doctorId: 'DOC-PRO-999',
          password: 'validPassword123'
        }
      };
      const res = createMockRes();

      await doctorAuthController.loginDoctor(req, res, () => {});

      assert.equal(res.statusCode, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.name, 'Dr. Specialist');
    } finally {
      Doctor.findOne = originalFindOne;
    }
  });

  test('Negative test: getMe rejects request without x-doctor-id header', async () => {
    const req = { headers: {} };
    const res = createMockRes();

    await doctorAuthController.getMe(req, res, () => {});

    assert.equal(res.statusCode, 401);
    assert.equal(res.body.success, false);
    assert.equal(res.body.message, 'Not authorized');
  });
});
