const ServiceRequest = require('../models/ServiceRequest');
const User = require('../models/User'); // To validate provider
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.createServiceRequest = catchAsync(async (req, res, next) => {
  const {
    providerId,
    service_id, // This is the ID of the generic service type
    serviceName,
    servicePrice,
    // customerName, // Name can be fetched from req.user if needed, or taken if different from user's name
    // customerPhoneNumber, // Phone can be fetched from req.user
    customerAddress, // Address provided by customer for this specific request
    nearestPoint,
    time_slot, // Expected in ISO format or a format that can be parsed to Date
  } = req.body;

  const customerId = req.user.id; // Authenticated user's ID

  // Basic validation
  if (!providerId || !service_id || !serviceName || !servicePrice || !customerAddress || !time_slot) {
    return next(new AppError('Please provide all required booking details.', 400));
  }

  // Validate providerId (check if it's a valid provider)
  const provider = await User.findOne({ _id: providerId, role: 'provider' });
  if (!provider) {
    return next(new AppError('Invalid service provider selected.', 404));
  }
  
  // TODO: Potentially validate service_id against a list of actual services if you have a separate Service collection
  // For now, we assume service_id, serviceName, servicePrice are passed correctly from client based on prior selection.

  // Parse time_slot to ensure it's a valid date
  const requestedDateTime = new Date(time_slot);
  if (isNaN(requestedDateTime.getTime())) {
      return next(new AppError('Invalid date or time format for the time slot.', 400));
  }
  // Optional: Check if requestedDateTime is in the past
  if (requestedDateTime < new Date()) {
      return next(new AppError('The requested time slot cannot be in the past.', 400));
  }

  const newServiceRequest = await ServiceRequest.create({
    customer: customerId,
    provider: providerId,
    service: service_id, // Storing the generic service ID
    serviceNameSnapshot: serviceName, // Snapshot of service name at time of booking
    servicePriceSnapshot: servicePrice, // Snapshot of price at time of booking
    customerAddress,
    customerPhoneNumberSnapshot: req.user.phone_number, // Taking from authenticated user profile
    customerNameSnapshot: req.user.name, // Taking from authenticated user profile
    nearestPoint,
    time_slot: requestedDateTime,
    status: 'Pending', // Initial status
    // Add any other fields from your ServiceRequest model schema
  });

  res.status(201).json({
    status: 'success',
    message: 'Service request created successfully. Waiting for provider confirmation.',
    data: {
      serviceRequest: newServiceRequest,
    },
  });
});

// TODO: Implement other controller functions as outlined in serviceRequestRoutes.js
// exports.getCustomerServiceRequests = catchAsync(async (req, res, next) => { ... });
// exports.getProviderServiceRequests = catchAsync(async (req, res, next) => { ... });
// exports.updateServiceRequestStatus = catchAsync(async (req, res, next) => { ... });
