import axios from "axios";

/**
 * URL base da API
 */
const API_URL = (
  import.meta.env.VITE_API_URL ||
  "https://palpiteiro-backend.vercel.app"
).replace(/\/$/, "");

/**
 * Instância principal do Axios
 */
export const api = axios.create({
  baseURL: API_URL,
  timeout: 25000,
  headers: {
    "Content-Type": "application/json",
  },
});

/* =====================
   HOME (ÚLTIMO SORTEIO)
===================== */
export const getUltimoConcurso = async () => {
  const resp = await api.get("/home");
  return resp.data?.data || null;
};

/* =====================
   DESEMPENHO DO GERADOR (2026)
===================== */
export const getDesempenhoGerador = async (params?: { ano?: number; tipo?: string }) => {
  const resp = await api.get("/home/desempenho", { params });
  return resp.data?.dados || null;
};

/* =====================
   ESTATÍSTICAS
===================== */
export const getEstatisticasScore = async () => {
  const resp = await api.get("/estatisticas/base");
  const data = resp.data?.dados || resp.data;
  return Array.isArray(data) ? data : [];
};

/* =====================
   PALPITES
===================== */
export const getPalpiteFixo = async () => {
  const resp = await api.get("/palpites/fixo");
  return resp.data;
};

export const getPalpitesEstatisticos = async () => {
  const resp = await api.get("/palpites/estatisticos");
  return resp.data;
};

/* =====================
   EXPORT DEFAULT
===================== */
export default api;

