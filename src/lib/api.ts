import axios from "axios";

const API_URL = (import.meta.env.VITE_API_URL || "https://palpiteiro-backend.vercel.app").replace(/\/$/, "");

export const api = axios.create({
  baseURL: API_URL + "/",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Adicionada a função que estava faltando
export const getEstatisticasScore = async () => {
  const resp = await api.get("/estatisticas/base");
  console.log("DEBUG Estatísticas:", resp.data);
  return resp.data;
};

export const getPalpiteFixo = async () => {
  const resp = await api.get("/palpites/fixo");
  console.log("DEBUG Palpite Fixo:", resp.data);
  return resp.data;
};

export const getPalpitesEstatisticos = async () => {
  const resp = await api.get("/palpites/estatisticos");
  console.log("DEBUG Palpites Estatísticos:", resp.data);
  return resp.data;
};

export const getUltimoConcurso = async () => {
  const resp = await api.get("/concurso/ultimo");
  console.log("DEBUG Último Concurso:", resp.data);
  return resp.data.concurso;
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

export default api;

