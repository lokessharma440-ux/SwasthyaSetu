const { z } = require('zod');
const HealthcareFacility = require('../models/HealthcareFacility');

const facilityParamSchema = z.object({
  id: z.string().min(1, 'Facility ID is required')
});

// Basic mock data to seed if DB is empty
const mockFacilities = [
  {
    name: 'District Hospital, Kanpur',
    type: 'District Hospital',
    address: 'Civil Lines, Kanpur',
    village: '',
    district: 'Kanpur Nagar',
    state: 'Uttar Pradesh',
    phone: '0512-2334455',
    latitude: 26.4499,
    longitude: 80.3319,
    services: ['Emergency', 'OPD', 'Surgery', 'Maternity'],
    isEmergencyAvailable: true
  },
  {
    name: 'Primary Health Centre (PHC), Bithoor',
    type: 'PHC',
    address: 'Main Road, Bithoor',
    village: 'Bithoor',
    district: 'Kanpur Nagar',
    state: 'Uttar Pradesh',
    phone: '0512-2334466',
    latitude: 26.6116,
    longitude: 80.2741,
    services: ['OPD', 'Vaccination', 'Basic Maternity'],
    isEmergencyAvailable: false
  },
  {
    name: 'Community Health Centre (CHC), Kalyanpur',
    type: 'CHC',
    address: 'Kalyanpur, Kanpur',
    village: 'Kalyanpur',
    district: 'Kanpur Nagar',
    state: 'Uttar Pradesh',
    phone: '0512-2334477',
    latitude: 26.4965,
    longitude: 80.2646,
    services: ['OPD', 'Maternity', 'Inpatient', 'Emergency'],
    isEmergencyAvailable: true
  }
];

// @desc    Get all facilities
// @route   GET /api/facilities
exports.getFacilities = async (req, res, next) => {
  try {
    let facilities = await HealthcareFacility.find({}).lean();
    
    // Seed mock data if empty (prototype behavior)
    if (facilities.length === 0) {
      const inserted = await HealthcareFacility.insertMany(mockFacilities);
      facilities = inserted.map(f => (f.toObject ? f.toObject() : f));
    }
    
    res.status(200).json({ success: true, count: facilities.length, data: facilities });
  } catch (error) {
    next(error);
  }
};

// @desc    Get facility by ID
// @route   GET /api/facilities/:id
exports.getFacility = async (req, res, next) => {
  try {
    const parseResult = facilityParamSchema.safeParse(req.params);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid facility ID parameter',
        errors: parseResult.error.issues
      });
    }

    const facility = await HealthcareFacility.findById(parseResult.data.id).lean();
    if (!facility) {
      return res.status(404).json({ success: false, message: 'Facility not found' });
    }
    res.status(200).json({ success: true, data: facility });
  } catch (error) {
    next(error);
  }
};
