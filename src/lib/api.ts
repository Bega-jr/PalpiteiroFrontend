import axios from "axios";

/* =====================
   CONFIGURAÇÃO BASE
===================== */

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "https://palpiteiro-backend.vercel.app"
).replace(/\/$/, "");

export const api = axios.create({
  baseURL: API_URL,
  timeout: 25000,
  headers: {
    "Content-Type": "application/json",
  },
});

/* =====================
   HOME — ÚLTIMO CONCURSO
   (concurso + dezenas + rateio completo)
===================== */
export const getUltimoConcurso = async () => {
  const resp = await api.get("/home");
  const data = resp.data?.data;

  if (!data) return null;

  return {
    concurso: data.concurso,
    data_sorteio: data.data_sorteio ?? null,
    dezenas: Array.isArray(data.dezenas) ? data.dezenas : [],

    arrecadacao_total: data.arrecadacao_total ?? 0,
    acumulado: data.acumulado ?? false,

    rateio: {
      15: {
        ganhadores: data.ganhadores_15 ?? 0,
        valor: data.valor_15 ?? 0,
      },
      14: {
        ganhadores: data.ganhadores_14 ?? 0,
        valor: data.valor_14 ?? 0,
      },
      13: {
        ganhadores: data.ganhadores_13 ?? 0,
        valor: data.valor_13 ?? 0,
      },
      12: {
        ganhadores: data.ganhadores_12 ?? 0,
        valor: data.valor_12 ?? 0,
      },
      11: {
        ganhadores: data.ganhadores_11 ?? 0,
        valor: data.valor_11 ?? 0,
      },
    },

    municipios: Array.isArray(data.municipios)
      ? data.municipios
      : [],
  };
};

/* =====================
   HOME — DESEMPENHO DO GERADOR
   (fixo + estatístico juntos)
===================== */
export const getDesempenhoGerador = async (params?: {
  ano?: number;
}) => {
  const resp = await api.get("/home/desempenho", {
    params: { ano: params?.ano ?? 2026 },
  });

  if (resp.data?.status !== "ok") return null;

  return {
    ano: resp.data.ano,
    total_concursos: resp.data.total_concursos ?? 0,

    resumo: {
      total_palpites: resp.data.resumo?.total_palpites ?? 0,
      total_premiacoes: resp.data.resumo?.total_premiacoes ?? 0,

      acertos: {
        15: resp.data.resumo?.acertos_15 ?? 0,
        14: resp.data.resumo?.acertos_14 ?? 0,
        13: resp.data.resumo?.acertos_13 ?? 0,
        12: resp.data.resumo?.acertos_12 ?? 0,
        11: resp.data.resumo?.acertos_11 ?? 0,
      },

      valor_total_premios:
        resp.data.resumo?.valor_total_premios ?? 0,
    },
  };
};

/* =====================
   ESTATÍSTICAS BASE
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
  return resp.data?.data ?? null;
};

export const getPalpitesEstatisticos = async () => {
  const resp = await api.get("/palpites/estatisticos");
  return resp.data?.data ?? null;
};

/* =====================
   EXPORT PADRÃO
===================== */
export default api;
