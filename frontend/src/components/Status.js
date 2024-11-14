import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Status = ({ patientId, userRole }) => {
    const [consultations, setConsultations] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');

    const formatTime = (time) => {
        if (!time) return '';
        const [hours, minutes] = time.split(':');
        const date = new Date();
        date.setHours(hours, minutes);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    useEffect(() => {
        const fetchConsultations = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/consultations/status/${patientId}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });

                if (response.data.message) {
                    // Case when "No doctors available" or another message is returned
                    setConsultations([]);  // Clear consultations state
                    setErrorMessage(response.data.message); // Display the message
                } else if (Array.isArray(response.data)) {
                    // If response data is an array (consultations)
                    if (response.data.length === 0) {
                        setConsultations([]);  // No consultations found
                        setErrorMessage('No consultations found.');
                    } else {
                        setConsultations(response.data); // Set the consultations
                        setErrorMessage('');  // Clear any error message
                    }
                } else {
                    // Unexpected response structure
                    setConsultations([]);
                    setErrorMessage('Unexpected response from the server.');
                }
            } catch (error) {
                // Handle any network or server errors
                setConsultations([]);
                setErrorMessage('Failed to load consultation status. Please try again later.');
            }
        };

        if (userRole === 'patient') {
            fetchConsultations();
        }
    }, [patientId, userRole]);

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Consultation Status</h2>
            
            {errorMessage ? (
                <p className="text-red-500">{errorMessage}</p>  // Show error message in red
            ) : (
                consultations.length === 0 ? (
                    <p>No consultations found.</p>  // Show message when no consultations
                ) : (
                    <ul className="space-y-4">
                        {consultations.map(consultation => (
                            <li key={consultation.id} className="p-4 border border-gray-300 rounded-lg shadow-sm">
                                <h3 className="text-lg font-semibold">
                                    {new Date(consultation.doctorAvailability.date).toLocaleDateString()}
                                </h3>
                                <p>Status: {consultation.status}</p>
                                <p>Doctor: {consultation.doctorName}</p>
                                <p>Specialty: {consultation.specialty}</p>

                                {consultation.selectedTimeSlot && consultation.selectedTimeSlot.startTime && consultation.selectedTimeSlot.endTime ? (
                                    <p>Booked Slot: {formatTime(consultation.selectedTimeSlot.startTime)} - {formatTime(consultation.selectedTimeSlot.endTime)}</p>
                                ) : (
                                    <p>No selected slot available</p>
                                )}
                            </li>
                        ))}
                    </ul>
                )
            )}
        </div>
    );
};

export default Status;
