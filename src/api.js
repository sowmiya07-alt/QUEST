/**
 * QUEST API Client Service
 * Configured for Django Function-Based Views (FBV) backend endpoints.
 * 
 * Set API_BASE_URL to your Django backend URL (e.g. "http://127.0.0.1:8000/api")
 * When backend is not running or unreachable, operations seamlessly fall back to local state.
 */

export const API_BASE_URL = window.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000/api";

async function request(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || `HTTP error ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn(`[QUEST API] Django FBV endpoint ${endpoint} offline or unreachable:`, err.message);
    return null; // Return null so caller falls back to local state
  }
}

/**
 * Teacher Login API
 * Django FBV: @api_view(['POST']) def teacher_login(request): ...
 */
export async function apiTeacherLogin(email, name) {
  return await request("/staff/login/", {
    method: "POST",
    body: JSON.stringify({ email, name }),
  });
}

/**
 * Student Login API
 * Django FBV: @api_view(['POST']) def student_login(request): ...
 */
export async function apiStudentLogin(code, name) {
  return await request("/student/login/", {
    method: "POST",
    body: JSON.stringify({ code, name }),
  });
}

/**
 * Fetch All Quizzes API
 * Django FBV: @api_view(['GET']) def get_quizzes(request): ...
 */
export async function apiFetchQuizzes() {
  return await request("/quizzes/");
}

/**
 * Create Quiz API
 * Django FBV: @api_view(['POST']) def create_quiz(request): ...
 */
export async function apiCreateQuiz(quizData) {
  return await request("/quizzes/create/", {
    method: "POST",
    body: JSON.stringify(quizData),
  });
}

/**
 * Update / Modify Quiz API (Verify & Modify)
 * Django FBV: @api_view(['PUT', 'PATCH']) def update_quiz(request, quiz_id): ...
 */
export async function apiUpdateQuiz(quizId, quizData) {
  return await request(`/quizzes/${quizId}/update/`, {
    method: "PUT",
    body: JSON.stringify(quizData),
  });
}

/**
 * Submit Quiz Attempt API
 * Django FBV: @api_view(['POST']) def submit_attempt(request): ...
 */
export async function apiSubmitAttempt(attemptData) {
  return await request("/attempts/submit/", {
    method: "POST",
    body: JSON.stringify(attemptData),
  });
}

/**
 * Fetch Attempts / Score Cards API
 * Django FBV: @api_view(['GET']) def get_attempts(request): ...
 */
export async function apiFetchAttempts() {
  return await request("/attempts/");
}
