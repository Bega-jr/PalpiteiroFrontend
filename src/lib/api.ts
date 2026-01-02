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
export const getPalpitesEstatisticos = async () => {
  const resp = await api.get("/palpites/estatisticos");
  return resp.data;
};

/* =====================
   RESULTADOS / CONCURSOS
===================== */
export const getUltimoConcurso = async () => {
  const CAIXA_URL = "servicebus2.caixa.gov.br";
  try {
    const response = await axios.get(CAIXA_URL);
    const data = response.data;
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
      ganhadores_15: rateioMap[1]?.ganhadores || 0,
      valor_15: rateioMap[1]?.valor || 0,
      // ... (demais faixas se necessário)
    };
  } catch (error) {
    const resp = await api.get("/ultimos/1");
    return Array.isArray(resp.data) ? resp.data[0] : resp.data;
  }
};

// Exportação única e padronizada
export default api;
