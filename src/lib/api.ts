import axios from "axios";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "https://palpiteiro-backend.vercel.app"
).replace(/\/$/, "");

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

/* =====================
   ESTATÍSTICAS
===================== */
export const getEstatisticasScore = async () => {
  const resp = await api.get("/estatisticas/base");
  return resp.data;
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
   CONCURSO / HISTÓRICO
===================== */
/**
 * Busca o último concurso e trata a estrutura de lista retornada pelo FastAPI
 */
export const getUltimoConcurso = async () => {
  try {
    const resp = await api.get("/ultimos/1");
    console.log("DEBUG API (getUltimoConcurso):", resp.data);
    
    // De acordo com seu log, o dado está em resp.data.concursos (que é um Array)
    if (resp.data && resp.data.concursos && Array.isArray(resp.data.concursos)) {
      return resp.data.concursos[0]; // Retorna o objeto do último concurso
    }
    
    // Fallback caso a API retorne o objeto direto ou em outro formato de lista
    if (Array.isArray(resp.data)) return resp.data[0];
    
    return resp.data;
  } catch (error) {
    console.error("ERRO AO BUSCAR ULTIMO CONCURSO:", error);
    throw error;
  }
};

export const getHistorico = async () => {
  const resp = await api.get("/historico/");
  return resp.data;
};

/**
 * Salva um palpite no histórico do usuário
 */
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
