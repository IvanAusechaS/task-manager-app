/**
 * Authentication Controller
 * Handles user authentication, registration, and session management
 */

import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import * as yup from "yup";
import User from "../models/user.model.js";
import EmailService from "../services/email.service.js";
import { requireAuth, validateRequest } from "../utils/decorators.js";

// Configure path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from root
dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });

const secretKey = process.env.JWT_SECRET;

// Verify JWT secret key availability
console.log(
  "Auth Controller - JWT_SECRET:",
  secretKey ? "Available" : "Missing"
);

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

const resetPasswordSchema = yup.object().shape({
  email: yup.string().email().required(),
});

const newPasswordSchema = yup.object().shape({
  password: yup.string().min(6).required(),
  token: yup.string().required(),
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
        return res
          .status(409)
          .json({ message: "This email is already registered." });
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
        password: hashedPassword,
      });

      const savedUser = await newUser.save();

      // Generate JWT token
      const token = jwt.sign(
        { userId: savedUser._id, email: savedUser.email },
        secretKey,
        { expiresIn: "24h" }
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
          age: savedUser.age,
        },
      });
    } catch (error) {
      if (error.name === "ValidationError") {
        return res.status(400).json({ message: error.message });
      }
      console.error("Signup error:", error);
      res
        .status(500)
        .json({ message: "Internal server error during registration" });
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
        throw new Error("JWT_SECRET is not configured");
      }

      // Generate JWT token with user data
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        secretKey,
        { expiresIn: "24h" }
      );

      res.status(200).json({
        message: "Login successful",
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          age: user.age,
        },
      });
    } catch (error) {
      console.error("Login error:", error.message);
      res.status(500).json({ message: "Error during login process" });
    }
  }

  async googleCallback(req, res) {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Authentication failed",
        });
      }

      const token = jwt.sign(
        {
          userId: user._id,
          email: user.email,
        },
        secretKey,
        { expiresIn: "24h" }
      );

      // Preparar datos de usuario y token
      const userData = {
        success: true,
        message: "Login successful",
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          age: user.age,
        },
      };

      // Redirigir a la página de callback con los datos como query params
      const frontendURL = process.env.FRONTEND_URL || "http://localhost:5173";
      const callbackURL = `${frontendURL}/google-callback.html`;

      // Convertir los datos a un string seguro para URL y enviarlo como parámetro
      const userDataStr = encodeURIComponent(JSON.stringify(userData));

      res.redirect(`${callbackURL}?data=${userDataStr}`);
    } catch (error) {
      console.error("Google auth error:", error);
      const frontendURL = process.env.FRONTEND_URL || "http://localhost:5173";
      res.redirect(
        `${frontendURL}/login?error=${encodeURIComponent(
          "Error during authentication process"
        )}`
      );
    }
  }

  /**
   * End user session
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Success message
   */
  async logout(req, res) {
    try {
      // Limpiar la sesión
      req.logout((err) => {
        if (err) {
          return res.status(500).json({ message: "Error during logout" });
        }
        // Destruir la sesión
        req.session.destroy((err) => {
          if (err) {
            return res
              .status(500)
              .json({ message: "Error destroying session" });
          }
          res.clearCookie("connect.sid");
          return res.status(200).json({ message: "Logout successful" });
        });
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Error during logout process" });
    }
  }

  /**
   * Handle password recovery request
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Success message
   */
  async recoverPassword(req, res) {
    try {
      await resetPasswordSchema.validate(req.body);
      const { email } = req.body;

      console.log("Password recovery request for:", email);

      // Mensaje genérico por seguridad
      const genericMessage = {
        success: true,
        message:
          "Si existe una cuenta con este email, recibirás un correo con las instrucciones.",
      };

      const user = await User.findOne({ email });
      if (!user) {
        console.log("User not found for recovery:", email);
        return res.status(200).json(genericMessage);
      }

      console.log("User found, generating reset token");
      const resetToken = crypto.randomBytes(32).toString("hex");
      const hash = crypto.createHash("sha256").update(resetToken).digest("hex");

      user.resetPasswordToken = hash;
      user.resetPasswordExpires = Date.now() + 3600000; // 1 hora
      await user.save();
      console.log("Reset token saved to user");

      console.log("Sending reset email");
      try {
        const emailSent = await EmailService.sendPasswordResetEmail(
          email,
          resetToken
        );

        if (!emailSent) {
          console.error("Failed to send reset email");
          // No lanzamos error, continuamos con respuesta genérica
          console.log("Responding with generic message despite email failure");
        } else {
          console.log("Reset email sent successfully");
        }
      } catch (emailError) {
        console.error("Email service error:", emailError);
        // No lanzamos error, continuamos con respuesta genérica
      }

      // Siempre devolver mensaje genérico independientemente de si el correo se envió
      res.status(200).json(genericMessage);
    } catch (error) {
      console.error("Password recovery error:", error);
      res.status(500).json({
        success: false,
        message:
          "Error en el proceso de recuperación de contraseña: " + error.message,
      });
    }
  }

  async resetPassword(req, res) {
    try {
      await newPasswordSchema.validate(req.body);
      const { token, password } = req.body;

      const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
      const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() },
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          message: "Token inválido o expirado",
        });
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      user.password = hashedPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      // Generar nuevo token de acceso después del reset
      const newToken = jwt.sign(
        { userId: user._id, email: user.email },
        secretKey,
        { expiresIn: "24h" }
      );

      res.status(200).json({
        success: true,
        message: "Contraseña actualizada exitosamente",
        token: newToken,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          age: user.age,
        },
      });
    } catch (error) {
      console.error("Password reset error:", error);
      res.status(500).json({
        success: false,
        message: "Error al restablecer la contraseña",
      });
    }
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
    validateRequest(signupSchema),
    (req, res) => controller.signup(req, res),
  ],
  login: [
    validateRequest(loginSchema),
    (req, res) => controller.login(req, res),
  ],
  googleCallback: (req, res) => controller.googleCallback(req, res), // Cambiado de authController a controller
  logout: [requireAuth, (req, res) => controller.logout(req, res)],
  recoverPassword: [(req, res) => controller.recoverPassword(req, res)],
  resetPassword: [(req, res) => controller.resetPassword(req, res)],
};
