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
   RESULTADOS / CONCURSOS
===================== */
export const getUltimosConcursos = async (quantidade: number = 50) => {
  const resp = await api.get(`/ultimos/${quantidade}`);
  return resp.data;
};

export const getConcurso = async (id: number) => {
  const resp = await api.get(`/concurso/${id}`);
  return resp.data;
};

/**
 * Busca o último concurso diretamente da API oficial da Caixa
 * e mapeia para o formato esperado pelo componente Home.tsx
 */
export const getUltimoConcurso = async () => {
  const CAIXA_URL = "https://servicebus2.caixa.gov.br/portaldeloterias/api/lotofacil";

  try {
    const response = await axios.get(CAIXA_URL);
    const data = response.data;

    // Mapeia o rateio por faixa (1 = 15 acertos, 2 = 14 acertos, etc.)
    const rateioMap: { [key: number]: { ganhadores: number; valor: number } } = {};
    data.listaRateioPremio.forEach((item: any) => {
      rateioMap[item.faixa] = {
        ganhadores: item.numeroDeGanhadores,
        valor: item.valorPremio,
      };
    });

    return {
      concurso: data.numero,
      data: data.dataApuracao, // "DD/MM/YYYY" - formato brasileiro
      data_concurso: data.dataApuracao,
      dezenas: data.listaDezenas.map(Number).sort((a: number, b: number) => a - b),
      acumulado: data.acumulado,
      estimativa_proximo: data.valorEstimadoProximoConcurso,
      // Premiação por faixa
      ganhadores_15: rateioMap[1]?.ganhadores || 0,
      valor_15: rateioMap[1]?.valor || 0,
      ganhadores_14: rateioMap[2]?.ganhadores || 0,
      valor_14: rateioMap[2]?.valor || 0,
      ganhadores_13: rateioMap[3]?.ganhadores || 0,
      valor_13: rateioMap[3]?.valor || 0,
      ganhadores_12: rateioMap[4]?.ganhadores || 0,
      valor_12: rateioMap[4]?.valor || 0,
      ganhadores_11: rateioMap[5]?.ganhadores || 0,
      valor_11: rateioMap[5]?.valor || 0,
      // Cidades ganhadoras (15 acertos)
      listaMunicipioUFGanhadores: data.listaMunicipioUFGanhadores.map((item: any) => ({
        uf: item.uf || "--",
        municipio: item.municipio,
        ganhadores: item.ganhadores,
      })),
      // Arrecadação total
      arrecadacao: data.valorArrecadado || 0,
    };
  } catch (error) {
    console.error("Erro ao buscar último concurso da Caixa:", error);
    // Em caso de falha, tenta fallback no seu backend (se existir)
    try {
      const resp = await api.get("/ultimos/1");
      return Array.isArray(resp.data) ? resp.data[0] : resp.data;
    } catch (fallbackError) {
      throw new Error("Não foi possível carregar o último concurso.");
    }
  }
};

/* =====================
   HISTÓRICO DO USUÁRIO
===================== */
export const getHistorico = async () => {
  const resp = await api.get("/historico/");
  return resp.data;
};

export const postSalvarPalpite = async (payload: any) => {
  const resp = await api.post("/historico/", payload);
  return resp.data;
};
