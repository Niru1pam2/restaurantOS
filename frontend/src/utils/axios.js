import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";

// Create custom axios instance with default config
const api = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;

    if (status === 401) {
      if (!url?.includes("/api/auth/login") && !url?.includes("/api/auth/me")) {
        useAuthStore.getState().logoutUser();
      }
    }

    return Promise.reject(error);
  },
);

export default api;
