const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const checkRole = require('../middleware/checkRole'); 

const { 
    createDoctorAvailability, 
    getDoctorAvailability, 
    updateDoctorAvailability, 
    deleteDoctorAvailability 
} = require('../controllers/doctorAvailability');

// Route to create availability for a doctor
router.post('/doctor/availability', authMiddleware, checkRole(['doctor']), createDoctorAvailability);

// Route to get all availability for a specific doctor
router.get('/doctors/:doctorId/availability', getDoctorAvailability);

// Route to delete a specific availability slot for a doctor
router.delete('/doctor/availability/:availabilityId', authMiddleware, checkRole(['doctor']), deleteDoctorAvailability);

module.exports = router;
