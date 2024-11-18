import React, { useEffect, useState } from 'react';
import axios from 'axios';

const DoctorAvailability = () => {
    const [availability, setAvailability] = useState([]);
    const [newDate, setNewDate] = useState('');
    const [newStartTime, setNewStartTime] = useState('');
    const [newEndTime, setNewEndTime] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const doctorId = localStorage.getItem('doctorId'); // Assuming the doctorId is stored in localStorage

    useEffect(() => {
        const fetchAvailability = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(
                    `http://localhost:5000/api/doctors/${doctorId}/availability`, 
                    { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
                );
                setAvailability(response.data);
            } catch (error) {
                console.error('Error fetching doctor availability:', error);
                alert('Failed to load availability. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };
    
        if (doctorId) {
            fetchAvailability();
        }
    }, [doctorId]);
    

    // Format time to 12-hour format with AM/PM
    const formatTime = (timeString) => {
        const [hour, minute] = timeString.split(':');
        const date = new Date();
        date.setHours(hour, minute);
        return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(date);
    };

    // Create new availability slot
    const handleCreateAvailability = async () => {
        if (new Date(`${newDate}T${newStartTime}`) >= new Date(`${newDate}T${newEndTime}`)) {
            alert('Start time must be before end time.');
            return;
        }

        try {
            const response = await axios.post(
                'http://localhost:5000/api/doctor/availability',
                { doctorId, date: newDate, startTime: newStartTime, endTime: newEndTime },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            setAvailability([...availability, response.data.availability]);
            alert('Availability created successfully!');
            setNewDate('');
            setNewStartTime('');
            setNewEndTime('');
        } catch (error) {
            console.error('Error creating availability:', error);
            alert('Failed to create availability. Please try again later.');
        }
    };

    // Delete availability slot
    const handleDeleteAvailability = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/doctor/availability/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            setAvailability(availability.filter((slot) => slot.id !== id));
            alert('Availability deleted successfully!');
        } catch (error) {
            console.error('Error deleting availability:', error);
            alert('Failed to delete availability. Please try again later.');
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-6">Manage Your Availability</h2>

            {isLoading ? (
                <p>Loading availability...</p>
            ) : (
                <>
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-2">Create New Availability</h3>
                        <div className="flex gap-4">
                            <input
                                type="date"
                                value={newDate}
                                onChange={(e) => setNewDate(e.target.value)}
                                className="p-2 border border-gray-300 rounded"
                            />
                            <input
                                type="time"
                                value={newStartTime}
                                onChange={(e) => setNewStartTime(e.target.value)}
                                className="p-2 border border-gray-300 rounded"
                            />
                            <input
                                type="time"
                                value={newEndTime}
                                onChange={(e) => setNewEndTime(e.target.value)}
                                className="p-2 border border-gray-300 rounded"
                            />
                            <button
                                onClick={handleCreateAvailability}
                                className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                Create
                            </button>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-2">Current Availability</h3>
                        {availability.length === 0 ? (
                            <p>No availability slots set yet.</p>
                        ) : (
                            <ul className="space-y-4">
                                {availability.map((slot) => (
                                    <li key={slot.id} className="flex justify-between items-center p-4 border border-gray-300 rounded-lg">
                                        <div>
                                            <p><strong>Date:</strong> {new Date(slot.date).toLocaleDateString()}</p>
                                            <p><strong>Time:</strong> {formatTime(slot.startTime)} - {formatTime(slot.endTime)}</p>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteAvailability(slot.id)}
                                            className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
                                        >
                                            Delete
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default DoctorAvailability;
