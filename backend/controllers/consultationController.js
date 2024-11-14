const Consultation = require('../models/Consultation');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const DoctorAvailability = require('../models/DoctorAvailability');

// available doctors
exports.getDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.findAll({
            include: [{
                model: User,
                attributes: ['username'],
            }],
            attributes: ['id', 'specialization', 'contactDetails'], 
        });

        const formattedDoctors = doctors.map(doctor => ({
            id: doctor.id,
            name: doctor.User.username,
            specialization: doctor.specialization,
        }));

        res.json(formattedDoctors);
    } catch (error) {
        res.status(500).json({ error: 'Failed to find doctors' });
    }
};
// Request a consultation
exports.requestConsultation = async (req, res) => {
    try {
        // Destructure the required fields from req.body
        const { patientId, doctorId, doctorAvailabilityId, reason, description, startTime, endTime } = req.body;

        // Debugging logs to check if the request body and file are received
        console.log("Request Body:", req.body);
        console.log("Uploaded File:", req.file);

        // Validate if image is provided
        if (!req.file) {
            console.log("Image is missing");
            return res.status(400).json({ error: 'Image is required' });
        }

        // Validate if reason and description are provided
        if (!reason || !description) {
            console.log("Reason or description is missing");
            return res.status(400).json({ error: 'Reason and description are required' });
        }

        // Validate if startTime and endTime are provided
        if (!startTime || !endTime) {
            console.log("Start time or end time is missing");
            return res.status(400).json({ error: 'Start time and end time are required' });
        }

        // Check if the doctor availability exists for the selected time slot
        const availability = await DoctorAvailability.findByPk(doctorAvailabilityId, {
            where: { doctorId },
        });

        console.log("Doctor Availability:", availability);

        // If availability doesn't exist, return error
        if (!availability) {
            console.log("Selected time slot not available");
            return res.status(400).json({ error: 'Selected time slot is not available.' });
        }

        // Check if the selected time slot is within the doctor's availability
        const availabilityStart = availability.startTime;
        const availabilityEnd = availability.endTime;

        // Ensure the selected startTime and endTime are within the available time range
        if (startTime < availabilityStart || endTime > availabilityEnd) {
            console.log("Selected time slot is outside of available hours");
            return res.status(400).json({ error: 'Selected time slot is outside of available hours' });
        }

        // Assuming the file upload is working fine, get the file path for saving
        const imageUrl = req.file.path;
        console.log("Image URL:", imageUrl);

        // Create a new consultation in the database
        const consultation = await Consultation.create({
            patientId,
            doctorId,
            doctorAvailabilityId,
            reason,
            description,
            imageUrl,
            startTime,  // Store the selected start time
            endTime,    // Store the selected end time
        });

        console.log("Consultation Created:", consultation);

        // Return success response with consultation data
        return res.status(201).json({ message: 'Consultation requested', consultation });

    } catch (error) {
        console.error("Error requesting consultation:", error);
        res.status(500).json({ error: 'Failed to request consultation' });
    }
};


exports.getConsultationStatus = async (req, res) => {
    const { patientId } = req.params;

    try {
        const doctors = await Doctor.findAll();
        
        // No doctors available case
        if (!doctors.length) {
            return res.status(200).json({ message: 'No doctors available' });
        }

        // Fetch consultations for the given patient
        const consultations = await Consultation.findAll({
            where: { patientId },
            attributes: ['id', 'doctorId', 'status', 'doctorAvailabilityId', 'startTime', 'endTime'],
            include: [
                {
                    model: Doctor,
                    attributes: ['specialization'],
                    include: [
                        {
                            model: User,
                            attributes: ['username'],
                        },
                    ],
                },
                {
                    model: DoctorAvailability,
                    attributes: ['date', 'startTime', 'endTime'],
                },
            ],
        });

        // If consultations exist, return them
        if (consultations.length > 0) {
            const formattedConsultations = consultations.map(consultation => ({
                id: consultation.id,
                doctorId: consultation.doctorId,
                status: consultation.status,
                doctorName: consultation.Doctor.User.username,
                specialty: consultation.Doctor.specialization,
                doctorAvailability: {
                    date: consultation.DoctorAvailability.date,
                    startTime: consultation.DoctorAvailability.startTime,
                    endTime: consultation.DoctorAvailability.endTime,
                },
                selectedTimeSlot: {
                    startTime: consultation.startTime,
                    endTime: consultation.endTime,
                },
            }));
            return res.json(formattedConsultations); // Return consultations if available
        }

        // Return empty array if no consultations exist for the patient
        return res.status(200).json([]); // No consultations, return empty array

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch consultation status' });
    }
};





