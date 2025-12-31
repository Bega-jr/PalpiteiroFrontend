import axios from "axios";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "https://palpiteiro-backend.vercel.app"
).replace(/\/$/, "");

export const api = axios.create({
  baseURL: API_URL,
  // Podemos voltar o timeout para 15s, já que o backend será rápido agora
  timeout: 15000, 
  headers: { "Content-Type": "application/json" },
});

/* =====================
   ESTATÍSTICAS
===================== */
export const getEstatisticasScore = async () => {
  const resp = await api.get("/estatisticas/base");
  // Esta rota agora leria a tabela do Supabase com as estatísticas pre-calculadas
  return resp.data;
};

/* =====================
   PALPITES (Backend Rápido - Sem Cache no Front)
===================== */
// Estas funções apenas leem a tabela de palpites pre-calculados no Supabase
export const getPalpiteFixo = async () => {
  const resp = await api.get("/palpites/fixo");
  return resp.data;
};

export const getPalpitesEstatisticos = async () => {
  const resp = await api.get("/palpites/estatisticos");
  return resp.data;
};


/* =====================
   CONCURSO / HISTÓRICO COM CACHE (Mantido para UX)
===================== */
export const getUltimoConcurso = async () => {
  const CACHE_KEY = "palpiteiro_concurso_cache";
  const TIMESTAMP_KEY = "palpiteiro_cache_time";
  const TRINTA_MINUTOS = 30 * 60 * 1000;

  try {
    const cached = localStorage.getItem(CACHE_KEY);
    const lastFetch = localStorage.getItem(TIMESTAMP_KEY);
    const agora = Date.now();

    if (cached && lastFetch && (agora - Number(lastFetch) < TRINTA_MINUTOS)) {
      return JSON.parse(cached);
    }

    const resp = await api.get("/ultimos/1");
    // ... lógica de cache ...
    return resp.data.concursos?.[0] || resp.data;
  } catch (error) {
    const fallback = localStorage.getItem(CACHE_KEY);
    if (fallback) return JSON.parse(fallback);
    throw error;
  }
};

export const getHistorico = async () => {
  const resp = await api.get("/historico/");
  return resp.data;
};

export const postSalvarPalpite = async (numeros: number[]) => {
  const resp = await api.post("/historico/registrar", {
    id: crypto.randomUUID(),
    data: new Date().toISOString(),
    tipo: "estatistico",
    numeros,
    valor_aposta: 3,
  });
  return resp.data;
};
