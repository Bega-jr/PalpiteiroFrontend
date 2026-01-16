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
===================== */
export const getDesempenhoGerador = async (ano = 2026) => {
  const [fixoResp, estatResp] = await Promise.all([
    api.get("/home/desempenho", { params: { ano, tipo: "fixo" } }),
    api.get("/home/desempenho", { params: { ano, tipo: "estatistico" } }),
  ]);

  const fixo = fixoResp.data || {};
  const estat = estatResp.data || {};

  const r1 = fixo.resumo || {};
  const r2 = estat.resumo || {};

  return {
    ano,

    total_concursos:
      (fixo.total_concursos || 0) +
      (estat.total_concursos || 0),

    resumo: {
      acertos_11: (r1.acertos_11 || 0) + (r2.acertos_11 || 0),
      acertos_12: (r1.acertos_12 || 0) + (r2.acertos_12 || 0),
      acertos_13: (r1.acertos_13 || 0) + (r2.acertos_13 || 0),
      acertos_14: (r1.acertos_14 || 0) + (r2.acertos_14 || 0),
      acertos_15: (r1.acertos_15 || 0) + (r2.acertos_15 || 0),
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

/* =====================
   EXPORT DEFAULT
===================== */
export default api;
