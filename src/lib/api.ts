import axios from "axios";

// Pega a URL da variável de ambiente (definida no Netlify)
// Se não existir, usa o backend correto como fallback
const API_URL = import.meta.env.VITE_API_URL || "https://palpiteiro-backend.vercel.app";

// Remove qualquer barra final para evitar duplicação
const cleanBaseURL = API_URL.replace(/\/$/, "");

export const api = axios.create({
  baseURL: cleanBaseURL,  // Sem barra no final aqui
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Todas as chamadas usam path com barra inicial → axios junta corretamente
// Ex: baseURL = "https://palpiteiro-backend.vercel.app" + "/palpites/fixo"

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
  return resp.data.concurso; // Retorna só o objeto interno
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
