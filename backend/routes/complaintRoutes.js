const express = require('express');
const { createComplaint, getPatientComplaints, getComplaint, updateComplaint } = require('../controllers/complaintController');

const router = express.Router();

router.route('/')
  .post(createComplaint);

router.route('/patient/:patientId')
  .get(getPatientComplaints);

router.route('/:id')
  .get(getComplaint)
  .put(updateComplaint);

module.exports = router;
