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
  return resp.data?.data ?? null;
};

/* =====================
   DESEMPENHO DO GERADOR
   (FIXO + ESTATÍSTICO UNIFICADOS)
   FORMATO COMPATÍVEL COM HOME
===================== */
export const getDesempenhoGerador = async (ano = 2026) => {
  const [fixoResp, estatResp] = await Promise.all([
    api.get("/home/desempenho", { params: { ano, tipo: "fixo" } }),
    api.get("/home/desempenho", { params: { ano, tipo: "estatistico" } }),
  ]);

  const r1 = fixoResp.data?.resumo || {};
  const r2 = estatResp.data?.resumo || {};

  return {
    ano,
    resumo: {
      "11": (r1["11"] || r1.acertos_11 || 0) + (r2["11"] || r2.acertos_11 || 0),
      "12": (r1["12"] || r1.acertos_12 || 0) + (r2["12"] || r2.acertos_12 || 0),
      "13": (r1["13"] || r1.acertos_13 || 0) + (r2["13"] || r2.acertos_13 || 0),
      "14": (r1["14"] || r1.acertos_14 || 0) + (r2["14"] || r2.acertos_14 || 0),
      "15": (r1["15"] || r1.acertos_15 || 0) + (r2["15"] || r2.acertos_15 || 0),
    },
  };
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

export default api;

