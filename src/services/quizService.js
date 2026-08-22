import { apiRequest } from "./api";

/**
 * Quiz Service
 * Handles quiz generation, material processing, AI import, preview, activation, and results.
 */
export const quizService = {
  /**
   * Create Quiz
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
   * Generate questions from uploaded reference material
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
   * Import AI JSON specification
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
   * Fetch quiz preview details
   * GET /staff/quizzes/<quiz_id>/preview/
   * @param {string|number} quizId
   */
  async getQuizPreview(quizId) {
    return await apiRequest(`/staff/quizzes/${quizId}/preview/`, {
      method: "GET"
    });
  },

  /**
   * Activate Quiz
   * POST /staff/quizzes/<quiz_id>/activate/
   * @param {string|number} quizId
   */
  async activateQuiz(quizId) {
    return await apiRequest(`/staff/quizzes/${quizId}/activate/`, {
      method: "POST"
    });
  },

  /**
   * Close Quiz
   * POST /staff/quizzes/<quiz_id>/close/
   * @param {string|number} quizId
   */
  async closeQuiz(quizId) {
    return await apiRequest(`/staff/quizzes/${quizId}/close/`, {
      method: "POST"
    });
  },

  /**
   * Get Quiz Results / Scorecards
   * GET /staff/quizzes/<quiz_id>/results/
   * @param {string|number} quizId
   */
  async getResults(quizId) {
    return await apiRequest(`/staff/quizzes/${quizId}/results/`, {
      method: "GET"
    });
  }
};
