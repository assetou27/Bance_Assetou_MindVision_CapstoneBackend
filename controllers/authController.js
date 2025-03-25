/**
 * Authentication Controller
 * Handles user registration, login, and user management
 * 
 * Note: There's a key issue in the token generation function that may be causing
 * the "Server error" message - the token payload structure doesn't match what the
 * auth middleware expects. This has been fixed in this version.
 */
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Generate a JWT token for authentication
 * 
 * IMPORTANT: The previous implementation had an issue where the token payload
 * used { id } but the auth middleware expected { userId, role }. This mismatch
 * could cause authentication failures when the token is validated.
 * 
 * @param {string} userId - The user ID to encode in the token
 * @param {string} role - The user's role (coach or client)
 * @returns {string} - JWT token valid for 7 days
 */
const generateToken = (userId, role) => {
  // Create token with correct payload structure for the auth middleware
  return jwt.sign(
    { userId, role }, // Changed from { id } to match what auth middleware expects
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

/**
 * Register a new user
 * POST /api/auth/register
 * 
 * Creates a new user account with the provided details
 * Returns a JWT token for immediate authentication
 * 
 * Request body:
 * - name: User's full name
 * - email: User's email address
 * - password: User's password (will be hashed)
 * - role: 'coach' or 'client'
 */
exports.register = async (req, res) => {
  try {
    // Extract user details from request body
    const { name, email, password, role } = req.body;
    
    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide name, email, and password' 
      });
    }
    
    // Check if email is already registered
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ 
        success: false,
        message: 'User already exists with this email' 
      });
    }

    // Create new user in database
    // Password will be automatically hashed by the User model's pre-save hook
    const user = await User.create({ 
      name, 
      email: email.toLowerCase(), 
      password, 
      role: role || 'client' // Default to client if no role provided
    });

    // Generate token for immediate authentication
    const token = generateToken(user._id, user.role);

    // Return success response with user details and token
    // This structure matches what the frontend expects
    res.status(201).json({
      success: true,
      userId: user._id,
      name: user.name,
      role: user.role,
      token
    });
  } catch (error) {
    // Log detailed error for debugging
    console.error('Registration error:', error);
    
    // Return generic error to client
    res.status(500).json({ 
      success: false,
      message: 'Registration failed. Please try again.',
      // Only include technical details in development mode
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Login an existing user
 * POST /api/auth/login
 * 
 * Authenticates a user with email and password
 * Returns a JWT token and user details on success
 * 
 * Request body:
 * - email: User's email address
 * - password: User's password
 */
exports.login = async (req, res) => {
  try {
    // Extract credentials from request
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide email and password' 
      });
    }

    // Find user by email (case insensitive)
    const user = await User.findOne({ email: email.toLowerCase() });

    // Check if user exists and password matches
    // The matchPassword method is defined in the User model
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    // Generate authentication token with correct payload structure
    const token = generateToken(user._id, user.role);

    // Return success with token and user data
    // IMPORTANT: The frontend expects this specific response structure
    res.json({
      success: true,
      userId: user._id,
      name: user.name,
      role: user.role,
      token
    });
  } catch (error) {
    // Log detailed error for debugging
    console.error('Login error:', error);
    
    // Return generic error to client
    res.status(500).json({ 
      success: false,
      message: 'Login failed. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get user by ID
 * GET /api/auth/:id
 * 
 * Retrieves a user's details by their ID
 * Excludes the password field for security
 * 
 * URL parameters:
 * - id: MongoDB ObjectId of the user
 */
exports.getUser = async (req, res) => {
  try {
    // Find user but exclude password field
    const user = await User.findById(req.params.id).select('-password');
    
    // Check if user exists
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    // Return user details
    res.json({
      success: true,
      user
    });
  } catch (error) {
    // Log error for debugging
    console.error('Get user error:', error);
    
    // Return error response
    res.status(500).json({ 
      success: false,
      message: 'Failed to retrieve user',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update user data
 * PATCH /api/auth/:id
 * 
 * Updates a user's profile information
 * Only the user themselves should be able to update their profile
 * 
 * URL parameters:
 * - id: MongoDB ObjectId of the user
 * 
 * Request body (all fields optional):
 * - name: User's new name
 * - email: User's new email
 * - role: User's new role
 */
exports.updateUser = async (req, res) => {
  try {
    // Find the user to update
    const user = await User.findById(req.params.id);
    
    // Check if user exists
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Security check: Ensure users can only update their own profile
    // This check uses the user ID from the JWT token (req.user)
    if (req.user && req.user.userId.toString() !== user._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to update this user' 
      });
    }

    // Update fields if provided in request body
    if (req.body.name) user.name = req.body.name;
    if (req.body.email) user.email = req.body.email.toLowerCase();
    
    // Only allow role change if specifically requested
    // Additional role-based permissions could be added here
    if (req.body.role) {
      user.role = req.body.role;
    }

    // Save updated user data to database
    const updated = await user.save();
    
    // Return updated user information (excluding password)
    res.json({
      success: true,
      user: {
        _id: updated._id,
        name: updated.name,
        email: updated.email,
        role: updated.role
      }
    });
  } catch (error) {
    // Log error for debugging
    console.error('Update user error:', error);
    
    // Return error response
    res.status(500).json({ 
      success: false,
      message: 'Failed to update user',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Delete a user
 * DELETE /api/auth/:id
 * 
 * Removes a user account from the system
 * Only the user themselves should be able to delete their account
 * 
 * URL parameters:
 * - id: MongoDB ObjectId of the user
 */
exports.deleteUser = async (req, res) => {
  try {
    // Find user to delete
    const user = await User.findById(req.params.id);
    
    // Check if user exists
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Security check: Ensure users can only delete their own account
    // This check uses the user ID from the JWT token (req.user)
    if (req.user && req.user.userId.toString() !== user._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to delete this user' 
      });
    }

    // Delete user from database
    await user.deleteOne();
    
    // Return success message
    res.json({ 
      success: true,
      message: 'User deleted successfully' 
    });
  } catch (error) {
    // Log error for debugging
    console.error('Delete user error:', error);
    
    // Return error response
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete user',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Find user by email
 * GET /api/auth/email/:email
 * 
 * Searches for a user with the specified email address
 * Excludes password from the returned data
 * 
 * URL parameters:
 * - email: Email address to search for
 */
exports.getUserByEmail = async (req, res) => {
  try {
    // Find user by email (case insensitive) but exclude password
    const user = await User.findOne({ 
      email: req.params.email.toLowerCase() 
    }).select('-password');
    
    // Check if user exists
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    // Return user details
    res.json({
      success: true,
      user
    });
  } catch (error) {
    // Log error for debugging
    console.error('Get user by email error:', error);
    
    // Return error response
    res.status(500).json({ 
      success: false,
      message: 'Failed to retrieve user',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Find user by name
 * GET /api/auth/name/:name
 * 
 * Searches for a user with a name matching the provided string
 * Uses case-insensitive partial matching (regex)
 * Excludes password from the returned data
 * 
 * URL parameters:
 * - name: Name or part of name to search for
 */
exports.getUserByName = async (req, res) => {
  try {
    // Find user by name using regex for partial matching
    // The $options: 'i' makes it case insensitive
    const user = await User.findOne({
      name: { $regex: req.params.name, $options: 'i' }
    }).select('-password');
    
    // Check if user exists
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    // Return user details
    res.json({
      success: true,
      user
    });
  } catch (error) {
    // Log error for debugging
    console.error('Get user by name error:', error);
    
    // Return error response
    res.status(500).json({ 
      success: false,
      message: 'Failed to retrieve user',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};