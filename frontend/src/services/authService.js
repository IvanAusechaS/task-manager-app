/**
 * Authentication Service
 * Manages user authentication, registration, and session state
 */

import { post } from "./api.js";

/**
 * Log in a user with email and password
 *
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<Object>} User data with auth token
 */
export async function login(email, password) {
  // Login doesn't require auth token
  return post("/auth/login", { email, password }, false);
}

/**
 * Register a new user
 *
 * @param {Object} userData - User registration data
 * @param {string} userData.firstName - User's first name
 * @param {string} userData.lastName - User's last name
 * @param {number} userData.age - User's age (optional)
 * @param {string} userData.email - User's email
 * @param {string} userData.password - User's password
 * @returns {Promise<Object>} New user data with auth token
 */
export async function signup(userData) {
  // Signup doesn't require auth token
  return post("/auth/signup", userData, false);
}

/**
 * Log out the current user
 *
 * @returns {Promise<Object>} Logout confirmation
 */
export async function logout() {
  const result = await post("/auth/logout", {});

  // Clear local storage
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  return result;
}

/**
 * Send password recovery email
 *
 * @param {string} email - User's email for password recovery
 * @returns {Promise<Object>} Recovery confirmation
 */
export async function sendPasswordResetEmail(email) {
  console.log("Sending password reset request for:", email);
  // Recovery doesn't require auth token
  return post("/auth/recover-password", { email }, false);
}

/**
 * Reset user password using token from email
 *
 * @param {string} token - Reset token from email
 * @param {string} newPassword - New password to set
 * @returns {Promise<Object>} Reset confirmation
 */
export async function resetPassword(token, newPassword) {
  // Reset doesn't require auth token
  return post("/auth/reset-password", { token, newPassword }, false);
}

/**
 * Check if user is currently logged in
 *
 * @returns {boolean} True if user is logged in
 */
export function isLoggedIn() {
  return !!localStorage.getItem("token");
}

/**
 * Get current user data from local storage
 *
 * @returns {Object|null} User data or null if not logged in
 */
export function getCurrentUser() {
  const userJson = localStorage.getItem("user");
  return userJson ? JSON.parse(userJson) : null;
}

/**
 * Update user session after profile changes
 *
 * @param {Object} userData - Updated user data
 */
export function updateUserSession(userData) {
  localStorage.setItem("user", JSON.stringify(userData));
}
