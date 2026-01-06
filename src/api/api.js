import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080",
  headers: { "Content-Type": "application/json" },
});

// Attach token automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle expired tokens / 401 errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      console.warn("❌ 401 Unauthorized - Token invalid or expired");
      localStorage.removeItem("token"); // clear invalid token
      // Delay redirect to let error be caught and handled by calling code first
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
    }
    return Promise.reject(error);
  }
);

export default API;
