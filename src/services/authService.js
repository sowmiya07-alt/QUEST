import apiClient from "../api/client";

/**
 * Authentication Service for QUEST (Student & Staff)
 */
export const authService = {
  /**
   * Get current authenticated user session
   * GET /me/
   */
  async getCurrentUser() {
    const res = await apiClient.get("/me/");
    return res.data;
  },

  /**
   * Register a new student
   * POST /student/register/
   * Payload: { name, email, password }
   */
  async registerStudent(data) {
    const res = await apiClient.post("/student/register/", {
      name: data.name,
      email: data.email,
      password: data.password
    });
    return res.data;
  },

  /**
   * Log in as a student
   * POST /student/login/
   * Payload: { user_code, password }
   */
  async loginStudent(credentials) {
    const res = await apiClient.post("/student/login/", {
      user_code: credentials.user_code || credentials.code || credentials.identity,
      password: credentials.password
    });
    return res.data;
  },

  /**
   * Log in as staff/faculty
   * POST /staff/login/
   * Payload: { user_code, password }
   */
  async loginStaff(credentials) {
    const res = await apiClient.post("/staff/login/", {
      user_code: credentials.user_code || credentials.code || credentials.identity || credentials.email,
      password: credentials.password
    });
    return res.data;
  },

  /**
   * Log out current user session
   * POST /logout/
   */
  async logout() {
    const res = await apiClient.post("/logout/");
    return res.data;
  }
};

export default authService;
