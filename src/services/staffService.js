import apiClient from "../api/client";

/**
 * Staff / Faculty Quiz Management Service for QUEST
 */
export const staffService = {
  /**
   * Get staff dashboard information (metrics, recent quizzes, student submissions)
   * GET /staff/dashboard/
   */
  async getDashboard() {
    const res = await apiClient.get("/staff/dashboard/");
    return res.data;
  },

  /**
   * Create a new quiz assessment
   * POST /staff/quizzes/create/
   * Payload: FormData or Object { title, difficulty, topics, time_limit, question_count, ... }
   */
  async createQuiz(quizData) {
    let payload = quizData;
    if (!(quizData instanceof FormData) && typeof quizData === "object" && quizData !== null) {
      const fd = new FormData();
      Object.keys(quizData).forEach((key) => {
        if (quizData[key] !== undefined && quizData[key] !== null) {
          fd.append(key, quizData[key]);
        }
      });
      payload = fd;
    }
    const res = await apiClient.post("/staff/quizzes/create/", payload);
    return res.data;
  },

  /**
   * Generate quiz questions from uploaded reference material (PDF/TXT)
   * POST /staff/quizzes/<quiz_id>/generate-material/
   * Payload: FormData with file/material
   */
  async generateMaterialQuiz(quizId, formDataOrFile) {
    let payload = formDataOrFile;
    let headers = {};
    if (formDataOrFile instanceof File) {
      const fd = new FormData();
      fd.append("file", formDataOrFile);
      fd.append("material", formDataOrFile);
      payload = fd;
      headers["Content-Type"] = undefined;
    } else if (formDataOrFile instanceof FormData) {
      headers["Content-Type"] = undefined;
    }
    const res = await apiClient.post(
      `/staff/quizzes/${quizId}/generate-material/`,
      payload,
      { headers }
    );
    return res.data;
  },

  /**
   * Generate a structured AI prompt specification when there is no reference material
   * POST /staff/quizzes/<quiz_id>/ai-specification/
   * Payload: { ... }
   */
  async generateAiSpecification(quizId, payload = {}) {
    const res = await apiClient.post(
      `/staff/quizzes/${quizId}/ai-specification/`,
      payload
    );
    return res.data;
  },

  /**
   * Import structured JSON returned by external AI model
   * POST /staff/quizzes/<quiz_id>/import-ai/
   * Payload: { questions: [...] } or raw JSON
   */
  async importAiQuiz(quizId, questionsPayload) {
    let payload = questionsPayload;
    if (typeof questionsPayload === "string") {
      try {
        payload = JSON.parse(questionsPayload);
      } catch (e) {
        payload = { questions: [] };
      }
    }
    if (Array.isArray(payload)) {
      payload = { questions: payload };
    }

    try {
      const res = await apiClient.post(
        `/staff/quizzes/${quizId}/import-ai/`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );
      return res.data;
    } catch (err) {
      // Fallback: if server expects FormData
      const fd = new FormData();
      const rawStr = JSON.stringify(payload);
      fd.append("ai_json", rawStr);
      fd.append("json_data", rawStr);
      fd.append("questions", JSON.stringify(payload.questions || []));
      const res = await apiClient.post(
        `/staff/quizzes/${quizId}/import-ai/`,
        fd
      );
      return res.data;
    }
  },

  /**
   * Get complete quiz preview with questions, options, correct answers, and explanations
   * GET /staff/quizzes/<quiz_id>/preview/
   */
  async getQuizPreview(quizId) {
    const res = await apiClient.get(`/staff/quizzes/${quizId}/preview/`);
    return res.data;
  },

  /**
   * Activate quiz for students (returns active quiz code)
   * POST /staff/quizzes/<quiz_id>/activate/
   */
  async activateQuiz(quizId) {
    const res = await apiClient.post(`/staff/quizzes/${quizId}/activate/`);
    return res.data;
  },

  /**
   * Close an active quiz
   * POST /staff/quizzes/<quiz_id>/close/
   */
  async closeQuiz(quizId) {
    const res = await apiClient.post(`/staff/quizzes/${quizId}/close/`);
    return res.data;
  },

  /**
   * Get student results and submission scorecards for a quiz
   * GET /staff/quizzes/<quiz_id>/results/
   */
  async getQuizResults(quizId) {
    const res = await apiClient.get(`/staff/quizzes/${quizId}/results/`);
    return res.data;
  }
};

export default staffService;
