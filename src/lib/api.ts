import axios from "axios";

/**
 * URL base da API
 */
const API_URL = (
  import.meta.env.VITE_API_URL ||
  "https://palpiteiro-backend.vercel.app"
).replace(/\/$/, "");

/**
 * Instância principal do Axios
 */
export const api = axios.create({
  baseURL: API_URL,
  timeout: 25000,
  headers: {
    "Content-Type": "application/json",
  },
});

/* =====================
   HOME (ÚLTIMO SORTEIO)
===================== */
export const getUltimoConcurso = async () => {
  const resp = await api.get("/home");
  return resp.data?.data ?? null;
};

/* =====================
   DESEMPENHO DO GERADOR
   (FIXO + ESTATÍSTICO UNIFICADOS)
   FORMATO COMPATÍVEL COM HOME
===================== */
export const getDesempenhoGerador = async (ano = 2026) => {
  const [fixoResp, estatResp] = await Promise.all([
    api.get("/home/desempenho", { params: { ano, tipo: "fixo" } }),
    api.get("/home/desempenho", { params: { ano, tipo: "estatistico" } }),
  ]);

  const r1 = fixoResp.data?.resumo || {};
  const r2 = estatResp.data?.resumo || {};

  return {
    ano,
    resumo: {
      "11": (r1["11"] || r1.acertos_11 || 0) + (r2["11"] || r2.acertos_11 || 0),
      "12": (r1["12"] || r1.acertos_12 || 0) + (r2["12"] || r2.acertos_12 || 0),
      "13": (r1["13"] || r1.acertos_13 || 0) + (r2["13"] || r2.acertos_13 || 0),
      "14": (r1["14"] || r1.acertos_14 || 0) + (r2["14"] || r2.acertos_14 || 0),
      "15": (r1["15"] || r1.acertos_15 || 0) + (r2["15"] || r2.acertos_15 || 0),
    },
  };
};

/* =====================
   PALPITES CONCILIADOS (v18.1 Adaptive)
===================== */

// Mantemos a assinatura para evitar quebras no compilador caso seja importada em outro arquivo
export const getPalpiteFixo = async () => {
  try {
    const resp = await api.get("/palpites/fixo");
    return resp.data;
  } catch {
    return null; // Retorna nulo silenciosamente em vez de estourar 404 na tela
  }
};

/**
 * ROTA CENTRAL DE CONCILIAÇÃO:
 * Intercepta o payload da Vercel, normaliza os dados e injeta compatibilidade
 * de nomes (ex: mapeia 'indice' para 'indice_palpite' e 'soma' para 'soma_total').
 */
export const getPalpitesEstatisticos = async () => {
  const resp = await api.get("/palpites/estatisticos");
  
  // Captura a lista de palpites independente de como o backend envelopar (data.palpites, data.data ou array puro)
  const listaBruta = resp.data?.palpites || resp.data?.data || (Array.isArray(resp.data) ? resp.data : []);

  // Mapeamento indestrutível de colunas antigas vs novas
  const palpitesNormalizados = listaBruta.map((p: any) => ({
    id: p.id || undefined,
    indice_palpite: p.indice || p.indice_palpite || 0,
    numeros: p.numeros || [],
    soma_total: p.soma || p.soma_total || 0,
    pares: p.pares || 0,
    impares: p.impares || 0,
    score: typeof p.score === "number" ? p.score : 0,
    versao_gerador: p.metodo || p.versao_gerador || p.versao_generator || '--'
  }));

  // Retorna o objeto envelopado com suporte nativo aos cards contextuais do front-end
  return {
    status: resp.data?.status || "ok",
    data_referencia: resp.data?.data_referencia || null,
    total: resp.data?.total || palpitesNormalizados.length,
    tipo_regime: resp.data?.tipo_regime || "NEUTRO", 
    dispersao: resp.data?.dispersao || 0,
    palpites: palpitesNormalizados
  };
};

export default api;
