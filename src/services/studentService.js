import { apiRequest } from "./api";

/**
 * Student Service
 * Communicates with Django FBV Student endpoints.
 */
export const studentService = {
  /**
   * Fetch student dashboard data (active quizzes, previous attempts, profile)
   * GET /student/dashboard/
   */
  async getDashboard() {
    return await apiRequest("/student/dashboard/", {
      method: "GET"
    });
  },

  /**
   * Student joins a quiz with access code
   * POST /student/join/
   * @param {Object} payload - { quiz_code }
   */
  async joinQuiz(payload) {
    return await apiRequest("/student/join/", {
      method: "POST",
      body: payload
    });
  },

  /**
   * Fetch quiz questions for taking the assessment
   * GET /student/quizzes/<quiz_id>/
   * @param {string|number} quizId
   */
  async getQuiz(quizId) {
    return await apiRequest(`/student/quizzes/${quizId}/`, {
      method: "GET"
    });
  },

  /**
   * Submit quiz answers
   * POST /student/quizzes/<quiz_id>/submit/
   * @param {string|number} quizId
   * @param {Object} answersPayload - { answers: { ... } }
   */
  async submitQuiz(quizId, answersPayload) {
    return await apiRequest(`/student/quizzes/${quizId}/submit/`, {
      method: "POST",
      body: answersPayload
    });
  },

  /**
   * Fetch detailed attempt result & diagnostic explanations
   * GET /student/attempts/<attempt_id>/
   * @param {string|number} attemptId
   */
  async getAttemptResult(attemptId) {
    return await apiRequest(`/student/attempts/${attemptId}/`, {
      method: "GET"
    });
  }
};
