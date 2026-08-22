import { apiRequest } from "./api";

/**
 * Authentication Service
 * Communicates with Django FBV Auth and System endpoints.
 */
export const authService = {
  /**
   * Fetch current authenticated user profile and role
   * GET /me/
   */
  async getCurrentUser() {
    return await apiRequest("/me/", {
      method: "GET"
    });
  },

  /**
   * Staff login
   * POST /staff/login/
   * @param {Object} credentials - { user_code, password }
   */
  async loginStaff(credentials) {
    return await apiRequest("/staff/login/", {
      method: "POST",
      body: credentials
    });
  },

  /**
   * Student login
   * POST /student/login/
   * @param {Object} credentials - { user_code, password }
   */
  async loginStudent(credentials) {
    return await apiRequest("/student/login/", {
      method: "POST",
      body: credentials
    });
  },

  /**
   * Student registration
   * POST /student/register/
   * @param {Object} data - { name, email, password }
   */
  async registerStudent(data) {
    return await apiRequest("/student/register/", {
      method: "POST",
      body: data
    });
  },

  /**
   * Logout from Django session
   * POST /logout/
   */
  async logout() {
    return await apiRequest("/logout/", {
      method: "POST"
    });
  }
};
