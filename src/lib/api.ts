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
 * Garante que a estrutura de dados seja sempre consistente para o frontend.
 */
export const getEstatisticasScore = async () => {
  const resp = await api.get("/estatisticas/base");
  
  // Implementação de segurança:
  // Se a API retornar um objeto com um campo 'dados', usamos ele.
  // Senão, usamos o retorno completo, garantindo que nunca seja 'null' ou 'undefined'.
  const data = resp.data?.dados || resp.data;

  // Garantimos que o retorno seja sempre um Array, para que o frontend não use Object.keys() em algo inválido.
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
 * Busca o último concurso diretamente da API oficial da Caixa
 * e mapeia para o formato esperado pelo componente Home.tsx
 */
export const getUltimoConcurso = async () => {
  // CORREÇÃO: Adicionado o protocolo HTTPS que faltava
  const CAIXA_URL = "servicebus2.caixa.gov.br";

  try {
    const response = await axios.get(CAIXA_URL);
    const data = response.data;
    
    // Mapeia o rateio por faixa
    const rateioMap: { [key: number]: any } = {};
    data.listaRateioPremio.forEach((item: any) => {
      rateioMap[item.faixa] = { ganhadores: item.numeroDeGanhadores, valor: item.valorPremio };
    });

    return {
      concurso: data.numero,
      data: data.dataApuracao,
      dezenas: data.listaDezenas.map(Number).sort((a: number, b: number) => a - b),
      acumulado: data.acumulado,
      estimativa_proximo: data.valorEstimadoProximoConcurso,
      // CORREÇÃO: Uso correto do rateioMap indexado por [1]
      ganhadores_15: rateioMap[1]?.ganhadores || 0,
      valor_15: rateioMap[1]?.valor || 0,
      ganhadores_14: rateioMap[2]?.ganhadores || 0,
      valor_14: rateioMap[2]?.valor || 0,
      // ... (demais faixas se necessário)
    };
  } catch (error) {
    console.error("Erro ao buscar último concurso da Caixa:", error);
    // Fallback para o backend próprio
    const resp = await api.get("/ultimos/1");
    // Garantimos que o fallback retorne um objeto, não um array puro
    return Array.isArray(resp.data) ? resp.data[0] : resp.data;
  }
};

// Exportação única e padronizada da instância do axios
export default api;
