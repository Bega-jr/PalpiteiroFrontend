import axios from "axios";

// Usa a variável de ambiente, mas garante que não duplique
const API_URL = import.meta.env.VITE_API_URL || "https://palpiteiro-backend.vercel.app";

// Remove barra final para evitar duplicação
const cleanURL = API_URL.replace(/\/$/, "");

export const api = axios.create({
  baseURL: cleanURL + "/",  // Adiciona uma barra só no final
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Ou alternativa mais segura: baseURL vazia e paths absolutos nas chamadas
// export const api = axios.create({
//   timeout: 15000,
//   headers: { "Content-Type": "application/json" },
// });

// Então nas funções use caminho completo:
// const resp = await axios.get(`${cleanURL}/palpites/fixo`);

export const getPalpiteFixo = async () => {
  const resp = await api.get("palpites/fixo");  // Sem barra inicial!
  console.log("DEBUG Palpite Fixo:", resp.data);
  return resp.data;
};

export const getPalpitesEstatisticos = async () => {
  const resp = await api.get("palpites/estatisticos");  // Sem barra inicial!
  console.log("DEBUG Palpites Estatísticos:", resp.data);
  return resp.data;
};

export const getUltimoConcurso = async () => {
  const resp = await api.get("concurso/ultimo");  // Sem barra inicial!
  console.log("DEBUG Último Concurso:", resp.data);
  return resp.data.concurso;
};

// ... o resto das funções (historico, post etc.) igual, com paths sem barra inicial

export default api;
