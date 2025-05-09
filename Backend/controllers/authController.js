const User = require('../models/User');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const Session = require('../models/Session');
const sendEmail = require('../utils/email'); // Import email utility
const crypto = require('crypto'); // Import crypto for token generation

exports.register = catchAsync(async (req, res, next) => {
  const {
    name,
    email,
    password,
    phone_number,
    role,
  } = req.body;

  // Validate required fields
  if (!name || !email || !password || !phone_number || !role) {
    return next(new AppError('Please provide all required fields', 400));
  }

  // Validate role
  if (!['customer', 'provider'].includes(role)) {
    return next(new AppError('Invalid user role', 400));
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('User already exists with this email', 400));
  }

  // Create new user
  const newUser = await User.create({
    name,
    email,
    password,
    phone_number,
    role,
  });

  // Remove password from output
  newUser.password = undefined;

  res.status(201).json({
    status: 'success',
    message: 'User registered successfully',
    user_id: newUser._id
  });
});


exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1. Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // 2. Check if user exists and password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3. Generate JWT token using your config
  const token = jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    jwtConfig.secret,
    {
      expiresIn: jwtConfig.expiresIn,
      issuer: jwtConfig.options.issuer,
      audience: jwtConfig.options.audience,
      algorithm: jwtConfig.options.algorithm
    }
  );

  // 4. Create a new session
  await Session.create({
    user: user._id,
    ip: req.ip, // Get IP address from request
    userAgent: req.get('User-Agent') // Get user agent from request headers
  });

  // 5. Remove password from output
  user.password = undefined;

  // 6. Send response with token
  res.status(200).json({
    status: 'success',
    message: 'Login successful',
    accessToken: token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});


exports.logout = catchAsync(async (req, res, next) => {
  // 1. Find the active session for the user
  const session = await Session.findOneAndUpdate(
    { user: req.user.id, active: true }, // Find active session
    { logoutTime: Date.now(), active: false }, // Update logout time and set inactive
    { new: true } // Return the updated session
  );

  if (!session) {
    return next(new AppError('No active session found', 404));
  }

  // 2. Send response
  res.status(200).json({
    status: 'success',
    message: 'Logout successful'
  });
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email and phone number
  const { email, phone } = req.body;
  if (!email || !phone) {
    return next(new AppError('Please provide email and phone number', 400));
  }

  const user = await User.findOne({ email: email, phone_number: phone });
  if (!user) {
    // Even if user not found, send a generic success message for security
    // This prevents attackers from guessing valid emails/phones
    console.log(`Password reset attempt for non-existent user or mismatched details: ${email}, ${phone}`);
    return res.status(200).json({ 
      status: 'success', 
      message: 'If an account matches the details provided, a password reset link will be sent.' 
    });
  }

  // 2) Generate the random reset token using the method on the user model
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false }); // Save the user with the new token/expiry, disable validation temporarily

  // 3) Send the token back to the user's email
  //    Construct the reset URL to point to the FRONTEND application
  //    IMPORTANT: In production, use HTTPS and your actual frontend domain
  //    Ensure your LandingPage frontend runs on port 5173 or adjust accordingly
  const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:5173'; // Or your specific port if different
  const resetURL = `${frontendBaseUrl}/reset-password/${resetToken}`; 

  const message = `Forgot your password? Click the link to reset your password: ${resetURL}\nIf you didn't forget your password, please ignore this email! This link is valid for 10 minutes.`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message
    });

    res.status(200).json({
      status: 'success',
      message: 'Password reset token sent to email!'
    });
  } catch (err) {
    // If email sending fails, reset the token fields on the user and save
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    console.error("EMAIL SENDING ERROR:", err);
    return next(new AppError('There was an error sending the email. Try again later.', 500));
  }
});


exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() } // Check if token is still valid
  }).select('+password'); // Need password field to potentially compare if needed, and to save

  // 2) If token has not expired, and there is a user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  if (!req.body.password || !req.body.passwordConfirm) {
     return next(new AppError('Please provide password and password confirmation', 400));
  }
  if (req.body.password !== req.body.passwordConfirm) {
     return next(new AppError('Passwords do not match', 400));
  }

  // Update password and clear reset token fields
  // The pre-save middleware in User.js will hash the new password
  user.password = req.body.password; 
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save(); // This triggers the pre-save hook for hashing

  // 3) Log the user in, send JWT
  const token = jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    jwtConfig.secret,
    {
      expiresIn: jwtConfig.expiresIn,
      issuer: jwtConfig.options.issuer,
      audience: jwtConfig.options.audience,
      algorithm: jwtConfig.options.algorithm
    }
  );
  
  // Create a new session upon successful password reset and login
  await Session.create({
    user: user._id,
    ip: req.ip, 
    userAgent: req.get('User-Agent') 
  });

  // Remove password from output before sending user object
  user.password = undefined; 

  res.status(200).json({
    status: 'success',
    message: 'Password reset successful',
    accessToken: token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});
