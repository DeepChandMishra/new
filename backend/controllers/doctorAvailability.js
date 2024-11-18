const { Doctor, DoctorAvailability } = require('../models');

// Create a new availability slot
exports.createDoctorAvailability = async (req, res) => {
    const { doctorId, date, startTime, endTime } = req.body;

    try {
        // Ensure that the doctor exists
        const doctor = await Doctor.findByPk(doctorId);
        if (!doctor) {
            return res.status(404).json({ error: 'Doctor not found' });
        }

        // Ensure that startTime is before endTime
        const startDateTime = new Date(`${date}T${startTime}:00`);
        const endDateTime = new Date(`${date}T${endTime}:00`);

        if (startDateTime >= endDateTime) {
            return res.status(400).json({ error: 'Start time must be before end time.' });
        }

        // Create a new availability slot
        const availability = await DoctorAvailability.create({
            doctorId,
            date,
            startTime,
            endTime,
        });

        res.status(201).json({ message: 'Availability created successfully', availability });
    } catch (error) {
        console.error('Error creating doctor availability:', error);
        res.status(500).json({ error: 'Failed to create doctor availability. Please try again later.' });
    }
};

// Get doctor's availability
exports.getDoctorAvailability = async (req, res) => {
    const { doctorId } = req.params; // Doctor ID is passed as URL parameter
    const { date } = req.query;  // Optional date query parameter

    try {
        // Ensure that the doctor exists
        const doctor = await Doctor.findByPk(doctorId);
        if (!doctor) {
            return res.status(404).json({ error: 'Doctor not found' });
        }

        // Fetch all availability slots for the doctor, optionally filtered by date
        const availability = await DoctorAvailability.findAll({
            where: {
                doctorId,
                ...(date && { date }), // Only filter by date if it's provided
            },
            attributes: ['id', 'date', 'startTime', 'endTime'],
            order: [['date', 'ASC'], ['startTime', 'ASC']],  // Sorting by date and time
        });

        // If no availability is found, return an empty array
        res.json(availability); 
    } catch (error) {
        console.error('Error fetching doctor availability:', error);
        res.status(500).json({ error: 'Failed to fetch doctor availability. Please try again later.' });
    }
};


// Delete doctor's availability
exports.deleteDoctorAvailability = async (req, res) => {
    const { availabilityId } = req.params;
    console.log("Received availabilityId:", availabilityId);  // Debug log
    
    try {
        const availability = await DoctorAvailability.findByPk(availabilityId);

        if (!availability) {
            return res.status(404).json({ error: 'Availability not found' });
        }

        // Delete the availability slot
        await availability.destroy();

        res.json({ message: 'Availability deleted successfully' });
    } catch (error) {
        console.error('Error deleting doctor availability:', error);
        res.status(500).json({ error: 'Failed to delete doctor availability. Please try again later.' });
    }
};

