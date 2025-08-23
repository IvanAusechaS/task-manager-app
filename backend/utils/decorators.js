/**
 * Authentication and Validation Decorators
 * Provides middleware functions for route protection and request validation
 */

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Load environment variables for JWT configuration
dotenv.config();
const secretKey = process.env.JWT_SECRET;

/**
 * JWT Token Verification Middleware
 * Validates the JWT token from the Authorization header
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void|Object} Proceeds to next middleware or returns error response
 */
export const verifyToken = (req, res, next) => {
  try {
    // Extract token from Authorization header
    // Expected format: "Bearer <token>"
    const token = req.headers.authorization?.split(' ')[1];
    
    // Check token presence
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Verify and decode the token
    const decoded = jwt.verify(token, secretKey);
    
    // Attach user data to request object for later use
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

/**
 * Authentication Middleware
 * Protects routes by requiring valid JWT token
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Function} Executes verifyToken middleware
 */
export const requireAuth = (req, res, next) => {
  return verifyToken(req, res, next);
};

/**
 * Request Validation Middleware Factory
 * Creates middleware for validating request body against a schema
 * 
 * @param {Object} schema - Yup validation schema
 * @returns {Function} Middleware function that validates request body
 * 
 * Usage example:
 * router.post('/endpoint', validateRequest(mySchema), handler);
 */
export const validateRequest = (schema) => {
  return async (req, res, next) => {
    try {
      // Validate request body against provided schema
      await schema.validate(req.body);
      next();
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };
};