
import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import RequestCard from '../components/requests/RequestCard';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Mock request data
const initialRequests = [
  {
    id: 1,
    customerName: 'Amanda Thompson',
    requestedDate: '2025-04-20',
    requestedTime: '3:00 PM',
    serviceType: 'Haircut & Styling',
    message: 'I would like to book a haircut and blowout. I have medium length hair.',
    location: '123 Oak Street, Apt 5C, New York, NY 10001'
  },
  {
    id: 2,
    customerName: 'Robert Garcia',
    requestedDate: '2025-04-22',
    requestedTime: '10:30 AM',
    serviceType: 'Car Rental',
    message: 'Looking for an economy car for weekend trip. Need it from Friday morning to Sunday evening.',
    location: '456 Pine Avenue, Chicago, IL 60611'
  },
  {
    id: 3,
    customerName: 'Lisa Kim',
    requestedDate: '2025-04-21',
    requestedTime: '4:45 PM',
    serviceType: 'Home Cleaning',
    message: 'Need a deep cleaning for my 2-bedroom apartment. Please focus on kitchen and bathrooms.',
    location: '789 Maple Road, San Francisco, CA 94102'
  }
];

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load requests (simulate API call)
  useEffect(() => {
    const loadRequests = () => {
      setTimeout(() => {
        setRequests(initialRequests);
        setLoading(false);
      }, 600); // Simulate loading delay
    };

    loadRequests();
  }, []);

  const handleAccept = (requestId) => {
    // In a real app, you would make an API call to accept the request
    setRequests(requests.filter(request => request.id !== requestId));
    toast.success('Request accepted and converted to an order');
  };

  const handleReject = (requestId) => {
    if (window.confirm('Are you sure you want to reject this request?')) {
      // In a real app, you would make an API call to reject the request
      setRequests(requests.filter(request => request.id !== requestId));
      toast.success('Request rejected');
    }
  };

  return (
    <Layout>
      <div className="page-container">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Service Requests</h1>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            {requests.length} new request{requests.length !== 1 ? 's' : ''}
          </span>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="flex items-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
              <span className="text-lg text-gray-600">Loading requests...</span>
            </div>
          </div>
        ) : (
          <>
            {requests.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-xl text-gray-500 mb-4">No pending service requests</p>
                <p className="text-gray-400">
                  When customers send you service requests, they will appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {requests.map(request => (
                  <RequestCard
                    key={request.id}
                    request={request}
                    onAccept={handleAccept}
                    onReject={handleReject}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Requests;
