import axios from "axios";

// Importante: garante que a URL termine sem barra duplicada
const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "https://palpiteiro-backend.vercel.app";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// GET PALPITE FIXO
export const getPalpiteFixo = async () => {
  const resp = await api.get("/palpites/fixo");
  console.log("DEBUG Palpite Fixo:", resp.data);
  return resp.data;
};

// GET PALPITES ESTATÍSTICOS
export const getPalpitesEstatisticos = async () => {
  const resp = await api.get("/palpites/estatisticos");
  console.log("DEBUG Palpites Estatísticos:", resp.data);
  return resp.data;
};

// GET ÚLTIMO CONCURSO
export const getUltimoConcurso = async () => {
  const resp = await api.get("/concurso/ultimo");
  console.log("DEBUG Último Concurso:", resp.data);
  return resp.data.concurso; // Retorna o objeto interno
};

// GET HISTÓRICO DE PALPITES
export const getHistorico = async () => {
  const resp = await api.get("/historico/");
  return resp.data;
};

// POST SALVAR PALPITE
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
