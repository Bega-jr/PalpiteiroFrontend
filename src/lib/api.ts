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
 * Nota: Certifique-se de injetar o 'X-User-Id' nos headers caso use autenticação.
 */
export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000, 
  headers: { 
    "Content-Type": "application/json"
  },
});

/* =====================
   ESTATÍSTICAS
===================== */

/**
 * Busca estatísticas baseadas nos cálculos pre-calculados do banco.
 */
export const getEstatisticasScore = async () => {
  const resp = await api.get("/estatisticas/base");
  return resp.data;
};

/* =====================
   PALPITES
===================== */

/**
 * Busca um palpite fixo gerado pelo algoritmo.
 */
export const getPalpiteFixo = async () => {
  const resp = await api.get("/palpites/fixo");
  return resp.data;
};

/**
 * Busca a lista de 7 palpites estatísticos.
 */
export const getPalpitesEstatisticos = async () => {
  const resp = await api.get("/palpites/estatisticos");
  return resp.data;
};


/* =====================
   RESULTADOS / CONCURSOS (PARA O COMPONENTE RESULTADOS.TSX)
===================== */

/**
 * Busca os últimos N concursos.
 * O Backend retorna uma Lista direta: [ {concurso: 1, dezenas: []}, ... ]
 */
export const getUltimosConcursos = async (quantidade: number = 50) => {
  const resp = await api.get(`/ultimos/${quantidade}`);
  return resp.data;
};

/**
 * Busca os dados de um concurso específico pelo seu número.
 */
export const getConcurso = async (id: number) => {
  const resp = await api.get(`/concurso/${id}`);
  return resp.data;
};

/**
 * Busca o concurso mais recente disponível.
 */
export const getUltimoConcurso = async () => {
  const resp = await api.get("/ultimos/1");
  // Como o backend retorna uma lista, pegamos o primeiro item se for array
  return Array.isArray(resp.data) ? resp.data[0] : resp.data;
};

/* =====================
   HISTÓRICO DO USUÁRIO
===================== */

/**
 * Lista o histórico de jogos do usuário autenticado.
 * Importante: O frontend deve enviar o header X-User-Id na requisição.
 */
export const getHistorico = async () => {
  const resp = await api.get("/historico/");
  return resp.data;
};

/**
 * Salva um novo palpite no histórico do usuário.
 */
export const postSalvarPalpite = async (payload: any) => {
  // Rota corrigida para bater com o router.post("/") do backend
  const resp = await api.post("/historico/", payload);
  return resp.data;
};
