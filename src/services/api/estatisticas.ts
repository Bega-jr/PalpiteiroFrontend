import api from "@/lib/api";

export interface EstatisticaBase {
  numero: number;
  frequencia: number;
  atraso: number;
}

export const EstatisticasService = {
  /**
   * Estatísticas base (frequência e atraso)
   */
  getBase: async (): Promise<EstatisticaBase[]> => {
    const response = await api.get("/estatisticas/base");
    return response.data.dados;
  },

  /**
   * Palpites estatísticos
   */
  getPalpitesEstatisticos: async () => {
    const response = await api.get("/palpites/estatisticos");
    return response.data.palpites;
  },
};

export default EstatisticasService;
