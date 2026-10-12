const express = require('express');
const { createPatient, getPatient, updatePatient, getTimeline, getAssignedDoctor } = require('../controllers/patientController');

const router = express.Router();

router.route('/')
  .post(createPatient);

router.route('/:id')
  .get(getPatient)
  .put(updatePatient);

router.route('/:patientId/doctor')
  .get(getAssignedDoctor);

router.route('/:patientId/timeline')
  .get(getTimeline);

module.exports = router;
