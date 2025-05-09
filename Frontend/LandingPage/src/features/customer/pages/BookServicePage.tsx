import React from 'react';
import { useLocation } from 'react-router-dom';

interface Service {
  id: string;
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Booking Details:', { ...formData, service });
    alert('Booking submitted! Go to Orders to pay and confirm your booking.');

  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow rounded-xl mt-6">
      <h2 className="text-2xl font-semibold mb-4">Book: {service.name}</h2>
      <p className="mb-2"><strong>Price:</strong> ₹{service.price}</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="customerName"
          placeholder="Customer Name"
          value={formData.customerName}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="text"
          name="phoneNumber"
          placeholder="Phone Number"
          value={formData.phoneNumber}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="text"
          name="address"
          placeholder="Address"
          value={formData.address}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="text"
          name="nearestPoint"
          placeholder="Nearest Point"
          value={formData.nearestPoint}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
       <input
          type="date"
          name="date"
          placeholder="Preferred Date"
          value={formData.date}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        <input
          type="time"
          name="time"
          placeholder="Preferred Time"
          value={formData.time}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />


        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
        >
          Confirm Booking
        </button>
      </form>
    </div>
  );
};

export default BookServicePage;
