import React, { useState } from 'react';
import axios from 'axios';
import ConsultationDetails from './ConsultationDetailsForm'; // Import ConsultationDetails component

const RequestConsultation = ({ patientId, doctorId, onClose }) => {
    const [availableSlots, setAvailableSlots] = useState([]); // Stores available slots based on selected date
    const [selectedSlot, setSelectedSlot] = useState(null); // Stores the selected time slot
    const [selectedDate, setSelectedDate] = useState(''); // Stores the selected date for the consultation
    const [isLoading, setIsLoading] = useState(false); // Loading indicator for fetching slots
    const [isSlotSelected, setIsSlotSelected] = useState(false); // Flag to check if a slot is selected
    const [isConsultationRequested, setIsConsultationRequested] = useState(false); // Flag for consultation submission

    // Function to fetch doctor availability based on selected date
    const fetchDoctorAvailability = async (date) => {
        setIsLoading(true);
        setAvailableSlots([]); // Reset available slots when a new date is selected
        setSelectedSlot(null);  // Clear previously selected slot
        setIsSlotSelected(false); // Reset slot selection flag
        try {
            const response = await axios.get(`http://localhost:5000/api/doctors/${doctorId}/availability?date=${date}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            // Generate time slots from the fetched availability (30-minute intervals)
            const slots = response.data.flatMap((slot) => generateTimeSlots(slot.startTime, slot.endTime, slot.id));
            setAvailableSlots(slots); // Set available slots
        } catch (error) {
            console.error('Error fetching doctor availability:', error);
            alert('Failed to load doctor availability. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Function to generate 30-minute time slots between start and end times
    const generateTimeSlots = (startTime, endTime, availabilityId) => {
        const slots = [];
    
        // Parse start and end times (with seconds) into JavaScript Date objects
        const start = new Date(`1970-01-01T${startTime}Z`); // Use Z to indicate UTC time
        const end = new Date(`1970-01-01T${endTime}Z`);
    
        let currentTime = start;
    
        // Ensure that the time difference is valid
        if (currentTime >= end) {
            console.error('Invalid time range. Start time is greater than or equal to end time.');
            return slots;
        }
    
        // Generate slots in 30-minute intervals, making sure we don't exceed the end time
        while (currentTime < end) {
            const nextSlot = new Date(currentTime);
            nextSlot.setMinutes(currentTime.getMinutes() + 30); // Increment by 30 minutes
    
            // Check if the next slot exceeds the end time
            if (nextSlot > end) {
                break; // Stop generating slots if the next slot goes past the end time
            }
    
            // Push the current slot with formatted start and end times
            slots.push({
                start: formatTime(currentTime),
                end: formatTime(nextSlot),
                id: `${availabilityId}-${currentTime.getTime()}`, // Unique slot ID based on availabilityId and timestamp
            });
    
            currentTime = nextSlot; // Move to the next slot
        }
    
        return slots;
    };    

    // Helper function to format Date object back to a 12-hour time string with AM/PM
    const formatTime = (date) => {
        const hours = date.getUTCHours();
        const minutes = date.getUTCMinutes().toString().padStart(2, '0');
        const period = hours >= 12 ? 'PM' : 'AM';
        const formattedHour = hours % 12 || 12; // Convert 24-hour to 12-hour format
        return `${formattedHour}:${minutes} ${period}`;
    };

    // Function to handle slot selection
    const handleSlotSelection = (e) => {
        const selectedSlot = availableSlots.find(slot => slot.id === e.target.value);
        setSelectedSlot(selectedSlot); // Set selected slot
        setIsSlotSelected(true); // Mark slot as selected
    };

    const handleConsultationRequest = () => {
        setIsConsultationRequested(true); // Mark consultation request as completed
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-700 bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
                {/* If consultation is not requested, show date and slot selection form */}
                {!isConsultationRequested && !isSlotSelected && (
                    <>
                        <h2 className="text-lg font-semibold mb-4">Request a Consultation</h2>
                        
                        {/* Date Selection */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Select Date:</label>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => {
                                    setSelectedDate(e.target.value);
                                    fetchDoctorAvailability(e.target.value); // Fetch availability for the selected date
                                }}
                                required
                                className="p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 w-full"
                            />
                        </div>

                        {/* Time Slot Selection */}
                        {selectedDate && !isSlotSelected && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Select Time Slot:</label>
                                {isLoading ? (
                                    <p>Loading available slots...</p> // Show loading while fetching slots
                                ) : (
                                    <>
                                        {availableSlots.length === 0 ? (
                                            <p className="text-red-500">No slots available for this date</p> // Show message if no slots
                                        ) : (
                                            <select
                                                value={selectedSlot ? selectedSlot.id : ''}
                                                onChange={handleSlotSelection}
                                                required
                                                className="p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 w-full"
                                            >
                                                <option value="">Select a time slot</option>
                                                {availableSlots.map((slot) => (
                                                    <option key={slot.id} value={slot.id}>
                                                        {slot.start} - {slot.end}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    </>
                                )}
                            </div>
                        )}

                        {/* Cancel Button */}
                        <button
                            type="button"
                            onClick={onClose} // Close the whole form when clicked
                            className="mt-4 w-full p-2 bg-red-500 text-white rounded hover:bg-red-600 transition duration-200"
                        >
                            Cancel
                        </button>
                    </>
                )}

                {/* If a slot is selected, show the consultation details form */}
                {isSlotSelected && !isConsultationRequested && (
                    <ConsultationDetails 
                        patientId={patientId} 
                        doctorId={doctorId} 
                        selectedSlot={selectedSlot} 
                        onClose={onClose} // Close the entire request form after submission
                        onConsultationSubmit={handleConsultationRequest} // Handle the consultation request
                    />
                )}
            </div>
        </div>
    );
};

export default RequestConsultation;
