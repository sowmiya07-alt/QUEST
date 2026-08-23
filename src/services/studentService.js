import apiClient from "../api/client";

/**
 * Student Assessment Service for QUEST
 */
export const studentService = {
  /**
   * Get student dashboard data (active quizzes, previous attempts, student info)
   * GET /student/dashboard/
   */
  async getDashboard() {
    const res = await apiClient.get("/student/dashboard/");
    return res.data;
  },

  /**
   * Join an active quiz using access/quiz code
   * POST /student/join/
   * Payload: { quiz_code: "..." }
   */
  async joinQuiz(payload) {
    const code = typeof payload === "string" ? payload : payload.quiz_code || payload.code;
    const res = await apiClient.post("/student/join/", {
      quiz_code: code
    });
    return res.data;
  },

  /**
   * Get quiz questions for attempting (answers sanitized for security)
   * GET /student/quizzes/<quiz_id>/
   */
  async getQuiz(quizId) {
    const res = await apiClient.get(`/student/quizzes/${quizId}/`);
    return res.data;
  },

  /**
   * Submit student's answers for a quiz
   * POST /student/quizzes/<quiz_id>/submit/
   * Payload: { answers: { ... } }
   */
  async submitQuiz(quizId, answersPayload) {
    const payload = answersPayload?.answers ? answersPayload : { answers: answersPayload };
    const res = await apiClient.post(`/student/quizzes/${quizId}/submit/`, payload);
    return res.data;
  },

  /**
   * Get submitted quiz attempt results & diagnostic score card
   * GET /student/attempts/<attempt_id>/
   */
  async getAttempt(attemptId) {
    const res = await apiClient.get(`/student/attempts/${attemptId}/`);
    return res.data;
  }
};

export default studentService;
