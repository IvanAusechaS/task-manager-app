/**
 * Authentication Controller
 * Handles user authentication, registration, and session management
 */

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import * as yup from 'yup';
import { requireAuth, validateRequest } from '../utils/decorators.js';

// Load environment variables
dotenv.config();

// Temporary in-memory storage for users (will be replaced with database)
let fakeUsers = [];
const secretKey = process.env.JWT_SECRET;
let currentUserId = 1;

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

      // Prevent duplicate email registrations
      const userExists = fakeUsers.find(user => user.email === email);
      if (userExists) {
        return res.status(409).json({ message: "This email is already registered." });
      }

      // Create new user object with metadata
      const newUser = {
        id: currentUserId++,
        firstName,
        lastName,
        age,
        email,
        password, // Note: Password should be hashed in production
        createdAt: new Date().toISOString(),
      };

      fakeUsers.push(newUser);
      console.log('Current Users:', fakeUsers);
      return res.status(201).json({ userId: newUser.id });
    } catch (error) {
      return res.status(400).json({ message: error.message });
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
      
      // Verify user credentials
      const user = fakeUsers.find(user => user.email === email);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid email or password." });
      }

      // Ensure JWT secret is configured
      if (!secretKey) {
        throw new Error('JWT_SECRET is not configured');
      }

      // Generate JWT token with user data
      const token = jwt.sign(
        { userId: user.id, email: user.email }, 
        secretKey,
        { expiresIn: '1h' }
      );

      return res.status(200).json({ token });
    } catch (error) {
      console.error('Login error:', error.message);
      return res.status(500).json({ message: "Error during login process" });
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