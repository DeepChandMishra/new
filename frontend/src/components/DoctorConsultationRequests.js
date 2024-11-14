import React, { useEffect, useState } from 'react';
import axios from 'axios';

const DoctorConsultationRequests = () => {
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRequests = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await axios.get('http://localhost:5000/api/doctors/requests', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                if (response.data && response.data.length === 0) {
                    setError('No consultation requests available.');
                }
                setRequests(response.data);
            } catch (error) {
                console.error('Error fetching consultation requests:', error);
                setError('Failed to load consultation requests.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchRequests();
    }, []);

    const updateStatus = async (requestId, newStatus) => {
        console.log('Updating status for ID:', requestId, 'New Status:', newStatus);

        try {
            const data = { status: newStatus };

            await axios.put(`http://localhost:5000/api/doctors/requests/${requestId}/status`, data, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            setRequests((prevRequests) =>
                prevRequests.map((req) =>
                    req.id === requestId ? { ...req, status: newStatus } : req
                )
            );
            alert('Status updated successfully!');
        } catch (error) {
            console.error('Error updating status:', error);
            alert(`Failed to update status: ${error.response ? error.response.data.error : error.message}`);
        }
    };

    const formatTime = (timeString) => {
        const date = new Date(`1970-01-01T${timeString}Z`); // Parse time as a Date object
    
        const hours = date.getUTCHours();
        const minutes = date.getUTCMinutes().toString().padStart(2, '0');
        const period = hours >= 12 ? 'PM' : 'AM';
        const formattedHour = hours % 12 || 12; // Convert 24-hour to 12-hour format
        return `${formattedHour}:${minutes} ${period}`;
    };
    
    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Consultation Requests</h2>

            {isLoading ? (
                <p>Loading consultation requests...</p>
            ) : error ? (
                <p className="text-red-500">{error}</p>
            ) : requests.length === 0 ? (
                <p>No consultation requests available.</p>
            ) : (
                <ul className="space-y-4">
                    {requests.map((request) => (
                        <li key={request.id} className="flex bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden">
                            {request.imageUrl && (
                                <img
                                    src={request.imageUrl}
                                    alt="Consultation"
                                    className="w-1/3 h-auto object-cover"
                                />
                            )}
                            <div className="flex-1 p-4">
                                <h3 className="text-2xl font-semibold">{request.patientUsername}</h3>

                                <p className="text-gray-600">
                                    <strong>SelectedDate:</strong> {new Date(request.doctorAvailability.date).toLocaleDateString()} 
                                </p>

                                {/* Show the date and time selected by the patient */}
                                <p className="text-gray-600">
                                    <strong>Requested Time:</strong> {formatTime(request.selectedTimeSlot.startTime)}-{formatTime(request.selectedTimeSlot.endTime)}
                                </p>

                                {/* Show the doctor's available date and time slot */}
                                

                                <p className="text-gray-600"><strong>Status:</strong> {request.status}</p>

                                <p className="text-gray-600 "><strong>Reason:</strong> {request.reason}</p>
                                <p className="text-gray-600"><strong>Description:</strong> {request.description}</p>

                                <div className="mt-4">
                                    {request.status === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => updateStatus(request.id, 'Accepted')}
                                                className="mr-2 p-2 bg-green-500 text-white rounded hover:bg-green-600"
                                            >
                                                Accept
                                            </button>
                                            <button
                                                onClick={() => updateStatus(request.id, 'Rejected')}
                                                className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
                                            >
                                                Reject
                                            </button>
                                        </>
                                    )}
                                    {request.status === 'Accepted' && (
                                        <button
                                            onClick={() => updateStatus(request.id, 'Completed')}
                                            className="p-2 bg-blue-700 text-white rounded hover:bg-blue-800"
                                        >
                                            Complete
                                        </button>
                                    )}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default DoctorConsultationRequests;
