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
export const getUltimoConcurso = async () => {
  try {
    // Usando a rota que você confirmou que funciona no Vercel
    const resp = await api.get("/ultimos/1");
    console.log("DEBUG API (getUltimoConcurso):", resp.data);
    
    // Se a API retornar uma lista, pega o primeiro. Se for objeto, usa direto.
    const data = Array.isArray(resp.data) ? resp.data[0] : resp.data;
    return data;
  } catch (error) {
    console.error("ERRO AO BUSCAR ULTIMO CONCURSO:", error);
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

