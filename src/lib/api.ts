import axios from "axios";

/**
 * URL base da API.
 */
const API_URL = (
  import.meta.env.VITE_API_URL ||
  "https://palpiteiro-backend.vercel.app"
).replace(/\/$/, "");

/**
 * Instância do Axios.
 */
export const api = axios.create({
  baseURL: API_URL,
  timeout: 25000, // Timeout sincronizado com o backend
  headers: {
    "Content-Type": "application/json",
  },
});

/* =====================
   ESTATÍSTICAS
===================== */
export const getEstatisticasScore = async () => {
  const resp = await api.get("/estatisticas/base");
  const data = resp.data?.dados || resp.data;
  return Array.isArray(data) ? data : [];
};

/* =====================
   PALPITES
===================== */
export const getPalpitesEstatisticos = async () => {
  const resp = await api.get("/palpites/estatisticos");
  return resp.data;
};

/* =====================
   RESULTADOS / CONCURSOS (HOME)
===================== */
export const getUltimoConcurso = async () => {
  try {
    // Agora consome o Backend que já faz o mapeamento total
    const resp = await api.get("/concurso/ultimo");
    
    // O backend já envia o objeto mapeado (dezenas, ganhadores_15, municipios, etc)
    return resp.data;
  } catch (error) {
    console.error("Erro ao buscar último concurso via Backend:", error);
    
    // Fallback para a rota de últimos caso a principal falhe (502/Timeout)
    try {
      const respFallback = await api.get("/ultimos/1");
      const data = respFallback.data;
      return Array.isArray(data) ? data[0] : data;
    } catch (e) {
      // Retorno vazio seguro para evitar tela branca
      return {
        concurso: 0,
        data: "---",
        dezenas: [],
        listaMunicipioUFGanhadores: [],
        estimativa_proximo: 0
      };
    }
  }
};

export default api;

