const express = require('express');
const { getOverview, getPatients, getFollowups } = require('../controllers/healthWorkerController');

const router = express.Router();

router.get('/overview', getOverview);
router.get('/patients', getPatients);
router.get('/followups', getFollowups);

module.exports = router;
