
import React from 'react';
import { User, Calendar, Clock, MapPin, MessageSquare, Check, X } from 'lucide-react';

const RequestCard = ({ request, onAccept, onReject }) => {
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-medium text-gray-900">{request.serviceType}</h3>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          New Request
        </span>
      </div>
      
      <div className="mt-4 space-y-3">
        <div className="flex items-start">
          <User className="h-5 w-5 text-gray-400 mr-2" />
          <span className="text-gray-600">{request.customerName}</span>
        </div>
        
        <div className="flex items-start">
          <Calendar className="h-5 w-5 text-gray-400 mr-2" />
          <span className="text-gray-600">{formatDate(request.requestedDate)}</span>
          
          {request.requestedTime && (
            <>
              <Clock className="h-5 w-5 text-gray-400 ml-4 mr-2" />
              <span className="text-gray-600">{request.requestedTime}</span>
            </>
          )}
        </div>
        
        {request.location && (
          <div className="flex items-start">
            <MapPin className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-gray-600 text-sm">{request.location}</span>
          </div>
        )}
      </div>
      
      {request.message && (
        <div className="mt-4 bg-gray-50 p-4 rounded-md">
          <div className="flex">
            <MessageSquare className="h-5 w-5 text-gray-400 mr-2" />
            <div>
              <p className="text-sm font-medium text-gray-900">Message from customer</p>
              <p className="text-sm text-gray-500 mt-1">{request.message}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => onReject(request.id)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
          >
            <X className="h-4 w-4 mr-1.5 text-gray-500" />
            Reject
          </button>
          <button
            onClick={() => onAccept(request.id)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none"
          >
            <Check className="h-4 w-4 mr-1.5" />
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequestCard;
