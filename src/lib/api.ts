import axios from "axios";

/**
 * Base URL do backend
 * Exemplo:
 * https://palpiteiro-backend.vercel.app
 */
const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://palpiteiro-backend.vercel.app";

/**
 * Instância principal do Axios
 */
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Interceptor de erro (debug)
 */
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Erro API:", error?.response || error);
    return Promise.reject(error);
  }
);

/**
 * API tipada usada no projeto
 */
export const api = {
  /**
   * Palpite fixo do dia
   * ⚠️ Ajuste a rota se o backend mudar
   */
  getPalpiteFixo: async () => {
    const response = await axiosInstance.get("/palpites/fixo");
    return response.data;
  },

  /**
   * Palpites estatísticos
   */
  getPalpitesEstatisticos: async () => {
    const response = await axiosInstance.get("/palpites/estatisticos");
    return response.data;
  },

  /**
   * Estatísticas base (frequência / atraso)
   * (caso você use em outra tela)
   */
  getEstatisticasBase: async () => {
    const response = await axiosInstance.get("/estatisticas/base");
    return response.data.dados;
  },
};

export default api;
