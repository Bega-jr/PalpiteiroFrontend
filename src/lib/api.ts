import axios from "axios";

/**
 * URL base da API. Prioriza a variável de ambiente do Vite,
 * caso contrário utiliza a URL padrão da Vercel.
 */
const API_URL = (
  import.meta.env.VITE_API_URL ||
  "https://palpiteiro-backend.vercel.app"
).replace(/\/$/, "");

/**
 * Instância do Axios com configurações globais.
 */
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

/**
 * Busca as estatísticas base (frequência e atraso)
 */
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
   RESULTADOS / CONCURSOS
===================== */

/**
 * Busca o último concurso consumindo o Backend próprio.
 * O Backend já realiza o mapeamento integral da API da Caixa,
 * evitando erros de CORS e de propriedades 'undefined' (como listaRateioPremio).
 */
export const getUltimoConcurso = async () => {
  try {
    // Chamada para o endpoint do seu backend que já mapeia a Caixa
    const resp = await api.get("/concurso/ultimo");
    
    // Como o Python já entrega o objeto formatado (com dezenas, ganhadores_15, etc),
    // apenas garantimos que retornamos o objeto diretamente.
    const data = resp.data;
    
    // Se o backend retornar um array por engano, pegamos o primeiro item
    return Array.isArray(data) ? data[0] : data;
    
  } catch (error) {
    console.error("Erro ao buscar último concurso via Backend:", error);
    
    // Fallback: tenta a rota alternativa de últimos
    try {
      const resp = await api.get("/ultimos/1");
      return Array.isArray(resp.data) ? resp.data[0] : resp.data;
    } catch (fallbackError) {
      console.error("Erro no fallback de resultados:", fallbackError);
      throw fallbackError;
    }
  }
};

// Exportação única e padronizada da instância do axios
export default api;

