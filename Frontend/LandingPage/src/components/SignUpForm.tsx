// src/components/SignUpForm.tsx
import React, { useState } from 'react';
import { User, Phone, Mail, Lock, CheckCircle } from 'lucide-react'; // Importing icons
import axios from 'axios'; // Import axios
// import { useNavigate } from 'react-router-dom'; // useNavigate will not be used here for redirection
import { useUser } from '../context/UserContext'; // Import user context

interface FormData {
  name: string;
  phone_number: string;
  email: string;
  password: string;
  service?: string; // Only for service provider
  experience?: string; // Only for service provider
  tradeLicense?: string; // Only for service provider
  location_latitude: string;
  location_longitude: string;
  address: string;
}

interface SignUpFormProps {
  role: 'serviceProvider' | 'customer';
  onBack: () => void;
  onClose: () => void;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ role, onBack, onClose }) => {
  // const navigate = useNavigate(); // Not used for primary redirection after signup
  const { setUser } = useUser(); // Get setUser function from context
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone_number: '',
    email: '',
    password: '',
    service: '',
    experience: '',
    tradeLicense: '',
    location_latitude: '0',
    location_longitude: '0',
    address: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    console.log('handleSubmit called');
      console.log(formData);

      try {
        const response = await axios.post('http://localhost:8000/api/auth/register', {
          name: formData.name,
          phone_number: formData.phone_number,
          email: formData.email,
          password: formData.password,
          role: role === 'serviceProvider' ? 'provider' : role, // Send the role to the backend, mapping 'serviceProvider' to 'provider'
          address: formData.address,
          // Include service provider specific fields if applicable
          ...(role === 'serviceProvider' && {
            service: formData.service,
            experience: formData.experience,
            tradeLicense: formData.tradeLicense,
          }),
        });

        console.log('Registration successful:', response.data);

      // Assuming the backend returns user data on successful signup
      const userData = {
        ...response.data.user, // Use user data from the backend response
        type: (role === 'serviceProvider' ? 'serviceprovider' : 'customer') as 'customer' | 'serviceprovider' // Ensure type is correct for context
      };

      // Set user in context (which also saves to localStorage)
      setUser(userData);

      // Redirection is now handled by App.tsx based on user context change
      // No need for window.location.href here

      onClose(); // Close the modal on successful signup
    } catch (error) {
      console.error('Registration error:', error);
      // Handle registration error (show message to user)
      if (axios.isAxiosError(error) && error.response) {
        console.error('Error details:', error.response.data);
        // You might want to display error.response.data.message to the user
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-8 space-y-6 transform transition-all">
        <h2 className="text-2xl font-semibold text-center mb-4 text-emerald-600">
          {role === 'serviceProvider' ? 'Service Provider Sign Up' : 'Customer Sign Up'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="flex items-center border border-gray-300 rounded-lg px-4 py-3 focus-within:ring-2 focus-within:ring-emerald-600 transition-all">
            <User className="w-6 h-6 text-gray-600" />
            <input
              type="text"
              name="name"
              placeholder={role === 'serviceProvider' ? 'Service Provider Name' : 'Full Name'}
              value={formData.name}
              onChange={handleChange}
              className="w-full pl-3 text-gray-700 focus:outline-none"
            />
          </div>

          {/* Phone Number */}
          <div className="flex items-center border border-gray-300 rounded-lg px-4 py-3 focus-within:ring-2 focus-within:ring-emerald-600 transition-all">
            <Phone className="w-6 h-6 text-gray-600" />
            <input
              type="text"
              name="phone_number"
              placeholder="Phone Number"
              value={formData.phone_number}
              onChange={handleChange}
              className="w-full pl-3 text-gray-700 focus:outline-none"
            />
          </div>

          {/* Email */}
          <div className="flex items-center border border-gray-300 rounded-lg px-4 py-3 focus-within:ring-2 focus-within:ring-emerald-600 transition-all">
            <Mail className="w-6 h-6 text-gray-600" />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full pl-3 text-gray-700 focus:outline-none"
            />
          </div>

          {/* Password */}
          <div className="flex items-center border border-gray-300 rounded-lg px-4 py-3 focus-within:ring-2 focus-within:ring-emerald-600 transition-all">
            <Lock className="w-6 h-6 text-gray-600" />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full pl-3 text-gray-700 focus:outline-none"
            />
          </div>

          {/* Conditional Fields for Service Provider */}
          {role === 'serviceProvider' && (
            <>
              <div className="flex items-center border border-gray-300 rounded-lg px-4 py-3 focus-within:ring-2 focus-within:ring-emerald-600 transition-all">
                <CheckCircle className="w-6 h-6 text-gray-600" />
                <select
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  className="w-full pl-3 text-gray-700 focus:outline-none"
                >
                  <option value="">Choose Service</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Carpentry">Carpentry</option>
                </select>
              </div>

              <div className="flex items-center border border-gray-300 rounded-lg px-4 py-3 focus-within:ring-2 focus-within:ring-emerald-600 transition-all">
                <CheckCircle className="w-6 h-6 text-gray-600" />
                <input
                  type="text"
                  name="experience"
                  placeholder="Experience (Years)"
                  value={formData.experience}
                  onChange={handleChange}
                  className="w-full pl-3 text-gray-700 focus:outline-none"
                />
              </div>

              <div className="flex items-center border border-gray-300 rounded-lg px-4 py-3 focus-within:ring-2 focus-within:ring-emerald-600 transition-all">
                <CheckCircle className="w-6 h-6 text-gray-600" />
                <input
                  type="text"
                  name="tradeLicense"
                  placeholder="Trade License"
                  value={formData.tradeLicense}
                  onChange={handleChange}
                  className="w-full pl-3 text-gray-700 focus:outline-none"
                />
              </div>
            </>
          )}

          {/* Buttons */}
          <div className="flex justify-between items-center space-x-4">
            <button
              type="button"
              onClick={onBack}
              className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Submit
            </button>
          </div>
        </form>

        <button
          onClick={onClose}
          className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors mt-4"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default SignUpForm;
