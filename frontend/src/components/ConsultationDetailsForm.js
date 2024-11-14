import React, { useState } from 'react';
import axios from 'axios';

const ConsultationDetails = ({ patientId, doctorId, selectedSlot, onClose }) => {
    const [image, setImage] = useState(null); // Stores the selected image file
    const [reason, setReason] = useState(''); // Stores the reason for consultation
    const [description, setDescription] = useState(''); // Stores the description for consultation
    const [isSubmitting, setIsSubmitting] = useState(false); // Flag for form submission

    // Function to handle form submission
    const parseTimeString = (timeString) => {
        const [time, modifier] = timeString.split(' '); // Split time and AM/PM
        let [hours, minutes] = time.split(':').map(Number); // Extract hours and minutes
    
        // Adjust hours for AM/PM
        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;
    
        // Return time in HH:mm:ss format
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
    
        // Inline validation check for reason and description
        if (!reason.trim() || !description.trim()) {
            alert('Please provide both reason and description.');
            return;
        }
    
        // Check for image upload
        if (!image) {
            alert('Please upload an image.');
            return;
        }
    
        // Log the selected slot start and end times to debug
        console.log("Selected Slot Start:", selectedSlot.start);
        console.log("Selected Slot End:", selectedSlot.end);
    
        // Convert the times to HH:mm:ss format before sending
        const startTime = parseTimeString(selectedSlot.start);
        const endTime = parseTimeString(selectedSlot.end);
    
        // Log the parsed times to ensure they are in the correct format
        console.log("Converted Start Time:", startTime);
        console.log("Converted End Time:", endTime);
    
        // Prepare the form data to send in the request
        const formData = new FormData();
        formData.append('patientId', patientId);
        formData.append('doctorId', doctorId);
        formData.append('doctorAvailabilityId', selectedSlot.id.split('-')[0]); // Availability ID
        formData.append('reason', reason);
        formData.append('description', description);
        formData.append('image', image);
        formData.append('startTime', startTime); // Send start time in HH:mm:ss format
        formData.append('endTime', endTime); // Send end time in HH:mm:ss format
    
        try {
            setIsSubmitting(true);
            const response = await axios.post('http://localhost:5000/api/consultations/request', formData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
    
            console.log('Consultation Request Response:', response);
            alert('Consultation requested successfully!');
            onClose(); // Close the form after successful submission
        } catch (error) {
            console.error('Error requesting consultation:', error);
            alert('Failed to request consultation. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    

    // Function to handle image upload
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImage(file);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">Consultation Details</h2>
            
            {/* Reason and Description */}
            <div className="mb-4">
                <label className="block text-sm font-medium mb-1" htmlFor="reason">Reason for Consultation:</label>
                <input
                    id="reason"
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                    className="p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 w-full"
                />
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium mb-1" htmlFor="description">Description:</label>
                <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    className="p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 w-full"
                    rows="4"
                />
            </div>

            {/* Image Upload */}
            <div className="mb-4">
                <label className="block text-sm font-medium mb-1" htmlFor="image">Upload Image:</label>
                <input
                    id="image"
                    type="file"
                    onChange={handleImageChange}
                    required
                    className="w-full text-gray-500"
                />
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                onClick={handleSubmit}
                className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200"
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Submitting...' : 'Request Consultation'}
            </button>

            {/* Cancel Button */}
            <button
                type="button"
                onClick={onClose}
                className="mt-4 w-full p-2 bg-red-500 text-white rounded hover:bg-red-600 transition duration-200"
            >
                Cancel
            </button>
        </div>
    );
};

export default ConsultationDetails;
