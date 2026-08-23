import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "/QUEST";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 30000,
  headers: {
    Accept: "application/json"
  }
});

// Response interceptor for unified, user-friendly error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (!error.response) {
      // Network Error / CORS / Connection Timeout
      const netError = new Error(
        "Unable to connect to QUEST backend. Please verify network connectivity."
      );
      netError.isNetworkError = true;
      return Promise.reject(netError);
    }

    const { status, data } = error.response;

    let message = "";
    if (typeof data === "object" && data !== null) {
      message = data.message || data.error || data.detail || "";
      if (!message && data.errors) {
        if (typeof data.errors === "string") {
          message = data.errors;
        } else if (Array.isArray(data.errors)) {
          message = data.errors.join(", ");
        } else if (typeof data.errors === "object") {
          message = Object.values(data.errors).flat().join(", ");
        }
      }
    } else if (typeof data === "string" && data.length < 200 && !data.includes("<!DOCTYPE")) {
      message = data;
    }

    if (!message) {
      switch (status) {
        case 400:
          message = "Bad request. Please check your submitted data.";
          break;
        case 401:
          message = "Authentication required. Please sign in.";
          break;
        case 403:
          message = "You don't have permission to perform this action.";
          break;
        case 404:
          message = "The requested resource was not found.";
          break;
        case 409:
          message = "A conflict occurred with the current state.";
          break;
        case 500:
        case 502:
        case 503:
          message = "A backend server error occurred. Please try again.";
          break;
        default:
          message = `Request failed with status ${status}.`;
          break;
      }
    }

    const customError = new Error(message);
    customError.status = status;
    customError.data = data;
    return Promise.reject(customError);
  }
);

export default apiClient;
