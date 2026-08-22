/**
 * QUEST Centralized API Client Service
 * Configured for Django Function-Based Views (FBV) backend endpoints.
 */

const DJANGO_BACKEND_URL = "https://roman-jolly-operable.ngrok-free.dev";

const getBaseUrl = () => {
  if (import.meta.env.DEV) {
    return "/QUEST";
  }
  let base = import.meta.env.VITE_API_BASE_URL || DJANGO_BACKEND_URL;
  if (!base || base === "" || base === "/" || base === "/QUEST") {
    base = DJANGO_BACKEND_URL;
  }
  base = base.replace(/\/+$/, "");
  if (!base.endsWith("/QUEST") && !base.includes("/QUEST/")) {
    base = `${base}/QUEST`;
  }
  return base;
};

export const API_BASE_URL = getBaseUrl();

/**
 * Extract CSRF token from document cookies (if available)
 */
function getCsrfToken() {
  if (typeof document === "undefined") return null;
  const cookies = document.cookie ? document.cookie.split(";") : [];
  for (let c of cookies) {
    const trimmed = c.trim();
    if (trimmed.startsWith("csrftoken=")) {
      return decodeURIComponent(trimmed.substring("csrftoken=".length));
    }
  }
  return null;
}

/**
 * Centralized API request handler
 * 
 * @param {string} endpoint - API path (e.g., "/me/", "/student/login/")
 * @param {object} options - Fetch options (method, body, headers, etc.)
 * @returns {Promise<object>} Parsed JSON response
 */
export async function apiRequest(endpoint, options = {}) {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  
  // Use query parameter to bypass ngrok browser warning without triggering custom header CORS preflight
  const separator = cleanEndpoint.includes("?") ? "&" : "?";
  const url = `${API_BASE_URL}${cleanEndpoint}${separator}ngrok-skip-browser-warning=true`;

  const isFormData = options.body instanceof FormData;
  const csrfToken = getCsrfToken();

  const headers = {
    ...(csrfToken ? { "X-CSRFToken": csrfToken } : {}),
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers || {})
  };

  const config = {
    method: options.method || "GET",
    credentials: "include",
    headers,
    ...options
  };

  if (config.body && !isFormData && typeof config.body !== "string") {
    config.body = JSON.stringify(config.body);
  }

  try {
    const res = await fetch(url, config);

    const contentType = res.headers.get("content-type") || "";
    let data;
    if (contentType.includes("application/json")) {
      data = await res.json().catch(() => ({}));
    } else {
      const text = await res.text().catch(() => "");
      data = { message: text };
    }

    if (!res.ok) {
      let errorMessage = "An error occurred while processing your request.";
      if (data && data.message) {
        errorMessage = data.message;
      } else if (data && data.error) {
        errorMessage = data.error;
      } else {
        switch (res.status) {
          case 400:
            errorMessage = "Invalid request data. Please check your inputs.";
            break;
          case 401:
            errorMessage = "Invalid credentials or session expired. Please check your user code and password.";
            break;
          case 403:
            errorMessage = "You do not have permission to perform this action.";
            break;
          case 404:
            errorMessage = "The requested resource was not found.";
            break;
          case 409:
            errorMessage = "A conflict occurred with this request.";
            break;
          case 500:
            errorMessage = "Internal server error. Please try again later.";
            break;
          default:
            errorMessage = `Request failed with status ${res.status}`;
        }
      }

      const error = new Error(errorMessage);
      error.status = res.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.status) {
      throw err;
    }
    console.error(`[QUEST API Error] ${config.method} ${cleanEndpoint}:`, err);
    const networkError = new Error(
      "QUEST backend is currently unreachable. Please verify your connection or backend server status."
    );
    networkError.isNetworkError = true;
    throw networkError;
  }
}
