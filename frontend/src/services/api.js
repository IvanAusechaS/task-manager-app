/**
 * API Service
 * Handles all HTTP requests to the backend API
 */

const API_URL = "https://task-manager-app-aa92.onrender.com/api"; // Adjusted to match backend PORT in .env

/**
 * Make a GET request to the API
 *
 * @param {string} endpoint - API endpoint to request
 * @param {boolean} requiresAuth - Whether the request requires authentication
 * @returns {Promise<any>} Response data
 */
export async function get(endpoint, requiresAuth = true) {
  const headers = {
    "Content-Type": "application/json",
  };

  // Add authorization header if required
  if (requiresAuth) {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Authentication required");
    }
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method: "GET",
    headers,
  });

  // Handle response
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.message || `Request failed with status ${response.status}`
    );
  }

  return await response.json();
}

/**
 * Make a POST request to the API
 *
 * @param {string} endpoint - API endpoint to request
 * @param {object} data - Data to send in the request body
 * @param {boolean} requiresAuth - Whether the request requires authentication
 * @returns {Promise<any>} Response data
 */
export async function post(endpoint, data, requiresAuth = true) {
  const headers = {
    "Content-Type": "application/json",
  };

  // Add authorization header if required
  if (requiresAuth) {
    const token = localStorage.getItem("token");
    if (!token && requiresAuth) {
      throw new Error("Authentication required");
    }
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });

  // Handle response
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.message || `Request failed with status ${response.status}`
    );
  }

  return await response.json();
}

/**
 * Make a PUT request to the API
 *
 * @param {string} endpoint - API endpoint to request
 * @param {object} data - Data to send in the request body
 * @param {boolean} requiresAuth - Whether the request requires authentication
 * @returns {Promise<any>} Response data
 */
export async function put(endpoint, data, requiresAuth = true) {
  const headers = {
    "Content-Type": "application/json",
  };

  // Add authorization header if required
  if (requiresAuth) {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Authentication required");
    }
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(data),
  });

  // Handle response
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.message || `Request failed with status ${response.status}`
    );
  }

  return await response.json();
}

/**
 * Make a DELETE request to the API
 *
 * @param {string} endpoint - API endpoint to request
 * @param {boolean} requiresAuth - Whether the request requires authentication
 * @returns {Promise<any>} Response data
 */
export async function del(endpoint, requiresAuth = true) {
  const headers = {
    "Content-Type": "application/json",
  };

  // Add authorization header if required
  if (requiresAuth) {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Authentication required");
    }
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method: "DELETE",
    headers,
  });

  // Handle response
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.message || `Request failed with status ${response.status}`
    );
  }

  return await response.json();
}
