import { apiRequest } from "./api";

/**
 * Staff Service
 * Communicates with Django FBV Staff and Quiz management endpoints.
 */
export const staffService = {
  /**
   * Fetch staff dashboard metrics and managed quizzes
   * GET /staff/dashboard/
   */
  async getDashboard() {
    return await apiRequest("/staff/dashboard/", {
      method: "GET"
    });
  },

  /**
   * Create a new quiz assessment (supports JSON or FormData with reference file)
   * POST /staff/quizzes/create/
   * @param {FormData|Object} payload
   */
  async createQuiz(payload) {
    return await apiRequest("/staff/quizzes/create/", {
      method: "POST",
      body: payload
    });
  },

  /**
   * Trigger material quiz generation
   * POST /staff/quizzes/<quiz_id>/generate-material/
   * @param {string|number} quizId
   */
  async generateMaterialQuiz(quizId) {
    return await apiRequest(`/staff/quizzes/${quizId}/generate-material/`, {
      method: "POST"
    });
  },

  /**
   * Generate AI Specification schema
   * POST /staff/quizzes/<quiz_id>/ai-specification/
   * @param {string|number} quizId
   * @param {Object} [payload]
   */
  async generateAISpecification(quizId, payload = {}) {
    return await apiRequest(`/staff/quizzes/${quizId}/ai-specification/`, {
      method: "POST",
      body: payload
    });
  },

  /**
   * Import AI generated JSON specification
   * POST /staff/quizzes/<quiz_id>/import-ai/
   * @param {string|number} quizId
   * @param {Object} payload
   */
  async importAIQuiz(quizId, payload) {
    return await apiRequest(`/staff/quizzes/${quizId}/import-ai/`, {
      method: "POST",
      body: payload
    });
  },

  /**
   * Fetch quiz preview details with full question breakdown
   * GET /staff/quizzes/<quiz_id>/preview/
   * @param {string|number} quizId
   */
  async getQuizPreview(quizId) {
    return await apiRequest(`/staff/quizzes/${quizId}/preview/`, {
      method: "GET"
    });
  },

  /**
   * Activate quiz for student submissions
   * POST /staff/quizzes/<quiz_id>/activate/
   * @param {string|number} quizId
   */
  async activateQuiz(quizId) {
    return await apiRequest(`/staff/quizzes/${quizId}/activate/`, {
      method: "POST"
    });
  },

  /**
   * Close quiz to stop student submissions
   * POST /staff/quizzes/<quiz_id>/close/
   * @param {string|number} quizId
   */
  async closeQuiz(quizId) {
    return await apiRequest(`/staff/quizzes/${quizId}/close/`, {
      method: "POST"
    });
  },

  /**
   * Fetch live results and scorecards for a quiz
   * GET /staff/quizzes/<quiz_id>/results/
   * @param {string|number} quizId
   */
  async getQuizResults(quizId) {
    return await apiRequest(`/staff/quizzes/${quizId}/results/`, {
      method: "GET"
    });
  }
};
