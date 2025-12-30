import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://palpiteiro-ia-backend-docker.onrender.com";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Log simples para debug em produção
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Erro API:", error?.response || error);
    return Promise.reject(error);
  }
);

export default api;
