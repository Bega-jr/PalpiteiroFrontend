import axios from "axios";

/**
 * Base do backend (SEM /api)
 */
const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://palpiteiro-backend.vercel.app";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Interceptor para debug (Netlify / produção)
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("❌ Erro API:", {
      method: error?.config?.method,
      url: error?.config?.url,
      status: error?.response?.status,
      data: error?.response?.data,
    });
    return Promise.reject(error);
  }
);

export default api;
