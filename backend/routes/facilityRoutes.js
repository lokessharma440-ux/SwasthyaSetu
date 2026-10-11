const express = require('express');
const { getFacilities, getFacility } = require('../controllers/facilityController');

const router = express.Router();

router.get('/', getFacilities);
router.get('/:id', getFacility);

module.exports = router;
