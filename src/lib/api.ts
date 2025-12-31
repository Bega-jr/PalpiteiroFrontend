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

export const getUltimoConcurso = async () => {
  try {
    const resp = await api.get("/ultimos/1");
    console.log("DEBUG API (Dados Recebidos):", resp.data);
    
    // Acessa a lista 'concursos' conforme seu backend FastAPI
    if (resp.data && resp.data.concursos && Array.isArray(resp.data.concursos)) {
      return resp.data.concursos[0]; 
    }
    
    // Fallback para outros formatos de lista
    if (Array.isArray(resp.data)) return resp.data[0];
    
    return resp.data;
  } catch (error) {
    console.error("ERRO AO BUSCAR ULTIMO CONCURSO:", error);
    throw error;
  }
};

export const getEstatisticasScore = async () => {
  const resp = await api.get("/estatisticas/base");
  return resp.data;
};

export const getPalpitesEstatisticos = async () => {
  const resp = await api.get("/palpites/estatisticos");
  return resp.data;
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
