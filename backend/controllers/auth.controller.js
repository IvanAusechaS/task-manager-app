/**
 * Authentication Controller
 * Handles user authentication, registration, and session management
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import * as yup from 'yup';
import User from '../models/user.model.js';
import { requireAuth, validateRequest } from '../utils/decorators.js';

// Configure path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from root
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const secretKey = process.env.JWT_SECRET;

// Verify JWT secret key availability
console.log('Auth Controller - JWT_SECRET:', secretKey ? 'Available' : 'Missing');

/**
 * Validation schema for user registration
 * Ensures all required fields are present and valid
 */
const signupSchema = yup.object().shape({
  firstName: yup.string().required(),
  lastName: yup.string().required(),
  age: yup.number().min(0).optional(),
  email: yup.string().email().required(),
  password: yup.string().min(6).required(),
});

/**
 * Validation schema for user login
 * Validates email format and password presence
 */
const loginSchema = yup.object().shape({
  email: yup.string().email().required(),
  password: yup.string().min(6).required(),
});

/**
 * Authentication Controller Class
 * Handles all authentication-related operations
 */
class AuthController {
  /**
   * Register a new user
   * @param {Object} req - Express request object containing user details
   * @param {Object} res - Express response object
   * @returns {Object} Created user ID or error message
   */
  async signup(req, res) {
    try {
      await signupSchema.validate(req.body);
      const { firstName, lastName, age, email, password } = req.body;

      // Check if user already exists
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(409).json({ message: "This email is already registered." });
      }

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create new user in database
      const newUser = new User({
        firstName,
        lastName,
        age,
        email,
        password: hashedPassword
      });

      const savedUser = await newUser.save();

      // Generate JWT token
      const token = jwt.sign(
        { userId: savedUser._id, email: savedUser.email },
        secretKey,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        message: "User created successfully",
        userId: savedUser._id,
        token,
        user: {
          id: savedUser._id,
          firstName: savedUser.firstName,
          lastName: savedUser.lastName,
          email: savedUser.email,
          age: savedUser.age
        }
      });

    } catch (error) {
      if (error.name === 'ValidationError') {
        return res.status(400).json({ message: error.message });
      }
      console.error('Signup error:', error);
      res.status(500).json({ message: "Internal server error during registration" });
    }
  }

  /**
   * Authenticate user and generate JWT token
   * @param {Object} req - Express request object with login credentials
   * @param {Object} res - Express response object
   * @returns {Object} JWT token or error message
   */
  async login(req, res) {
    try {
      await loginSchema.validate(req.body);
      const { email, password } = req.body;
      
      // Find user in database
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password." });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid email or password." });
      }

      // Ensure JWT secret is configured
      if (!secretKey) {
        throw new Error('JWT_SECRET is not configured');
      }

      // Generate JWT token with user data
      const token = jwt.sign(
        { userId: user._id, email: user.email }, 
        secretKey,
        { expiresIn: '24h' }
      );

      res.status(200).json({ 
        message: "Login successful",
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          age: user.age
        }
      });

    } catch (error) {
      console.error('Login error:', error.message);
      res.status(500).json({ message: "Error during login process" });
    }
  }

  /**
   * End user session
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Success message
   */
  async logout(req, res) {
    return res.status(200).json({ message: "Logout successful." });
  }

  /**
   * Handle password recovery request
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Success message
   */
  async recoverPassword(req, res) {
    return res.status(200).json({ message: "Password recovery email sent (placeholder)." });
  }
}

// Create single instance of controller
const controller = new AuthController();

/**
 * Export controller methods wrapped with authentication and validation middleware
 * Each route is protected by appropriate middleware chain
 */
export default {
  signup: [
    validateRequest(signupSchema), // Validate request body
    (req, res) => controller.signup(req, res)
  ],
  login: [
    validateRequest(loginSchema), // Validate login credentials
    (req, res) => controller.login(req, res)
  ],
  logout: [
    requireAuth, // Ensure user is authenticated
    (req, res) => controller.logout(req, res)
  ],
  recoverPassword: [
    (req, res) => controller.recoverPassword(req, res)
  ]
};