import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Added useNavigate
import axios from 'axios'; // Added axios
import { useUser } from '@/context/UserContext.tsx'; // Added useUser
import { toast } from 'sonner'; // For success/error messages

interface Service {
  id: string; // Assuming service ID from backend is string, adjust if number
  name: string;
  price: number;
}

interface FormData {
  customerName: string;
  phoneNumber: string;
  address: string;
  nearestPoint: string;
  date: string;
  time: string;
}

const BookServicePage: React.FC = () => {
  const location = useLocation();
  const { service } = location.state || {}; // Retrieve the service object from state

  if (!service) return <div>404 - Service Not Found</div>;

  const [formData, setFormData] = React.useState<FormData>({
    customerName: '',
    phoneNumber: '',
    address: '',
    nearestPoint: '',
    date: '',
    time: '',
  });
  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const { user } = useUser(); // Get current user for customerId
  const navigate = useNavigate(); // For redirection

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !service) {
      toast.error("User or service details are missing. Cannot proceed.");
      return;
    }

    // Ensure the user object includes an accessToken
    if (!user.accessToken) {
      toast.error("Authentication token is missing. Please log in again.");
      // Optionally, you could navigate to login or trigger a logout here
      // import { useNavigate } from 'react-router-dom'; // at the top
      // const navigate = useNavigate(); // in the component
      // navigate('/'); // or navigate('/login');
      // import { useUser } from '@/context/UserContext.tsx'; // ensure logout is available if used
      // const { logout } = useUser();
      // logout();
      return;
    }

    // Using user.name as customerId as per user request
    // Ensure user.name is populated and is the intended identifier
    if (!user.name) {
      toast.error("Username is missing. Cannot proceed with booking.");
      return;
    }

    // Combine date and time into a single ISO string for the backend
    const time_slot = `${formData.date}T${formData.time}:00`; // Assuming time is in HH:MM format

    const bookingPayload = {
      customerId: user.name,  // Using user.name as customerId
      service_id: service.id, // Changed from serviceId to service_id
      serviceName: service.name,
      servicePrice: service.price,
      customerName: formData.customerName, // This might be redundant if user.name is preferred
      customerPhoneNumber: formData.phoneNumber,
      customerAddress: formData.address,
      nearestPoint: formData.nearestPoint,
      time_slot: time_slot, // Combined date and time
      status: 'Booked', // Initial status
    };

    console.log('Submitting Booking Details:', bookingPayload);

    try {
      // Corrected API endpoint based on backend route definitions
      const response = await axios.post('http://localhost:8000/api/customer/services/request', bookingPayload, {
        headers: {
          // Assuming you need to send an auth token if your API is protected
          Authorization: `Bearer ${user.accessToken}`, 
        },
      });
      
      console.log('Booking successful:', response.data);
      toast.success('Booking successful! Your service is now "Already Booked".');
      // Navigate to orders page, potentially passing some identifier of the new booking
      navigate('/customer/orders', { state: { newBookingId: response.data?.serviceRequest?._id || null } }); 
    } catch (error) {
      console.error('Booking failed:', error);
      let errorMessage = 'Booking failed. Please try again.';
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-sky-100 py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-2xl w-full mx-auto p-8 bg-white shadow-2xl rounded-xl space-y-8">
        {/* Header Section */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-emerald-600">
            Book Your Service
          </h1>
          <p className="mt-2 text-lg text-gray-600">Confirm details for: <span className="font-semibold text-emerald-700">{service.name}</span></p>
        </div>

        {/* Service Details Summary */}
        <div className="p-6 bg-emerald-50 rounded-lg border border-emerald-200">
          <h2 className="text-2xl font-semibold text-emerald-800 mb-3">Service Summary</h2>
          <div className="flex justify-between items-center">
            <p className="text-lg text-gray-700">Service:</p>
            <p className="text-lg font-medium text-emerald-700">{service.name}</p>
          </div>
          <div className="flex justify-between items-center mt-1">
            <p className="text-lg text-gray-700">Price:</p>
            <p className="text-lg font-medium text-emerald-700">₹{service.price.toFixed(2)}</p>
          </div>
        </div>

        {/* Booking Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              id="customerName"
              type="text"
              name="customerName"
              placeholder="Enter your full name"
              value={formData.customerName}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-150"
              required
            />
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              id="phoneNumber"
              type="tel"
              name="phoneNumber"
              placeholder="Enter your phone number"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-150"
              required
            />
          </div>
          
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Full Address</label>
            <input
              id="address"
              type="text"
              name="address"
              placeholder="Enter your full address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-150"
              required
            />
          </div>

          <div>
            <label htmlFor="nearestPoint" className="block text-sm font-medium text-gray-700 mb-1">Nearest Landmark (Optional)</label>
            <input
              id="nearestPoint"
              type="text"
              name="nearestPoint"
              placeholder="e.g., Near City Mall"
              value={formData.nearestPoint}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-150"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Preferred Date</label>
              <input
                id="date"
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-150"
                required
              />
            </div>
            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">Preferred Time</label>
              <input
                id="time"
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-150"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-sky-600 to-emerald-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:from-sky-700 hover:to-emerald-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition duration-150 ease-in-out transform hover:scale-105"
          >
            Confirm & Book Service
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookServicePage;
