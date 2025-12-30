const API_BASE_URL = 'https://palpiteiro-backend.vercel.app';

export interface Concurso {
  concurso: number;
  data: string;
  dezenas: number[];
}

export interface EstatisticasBase {
  numero: number;
  frequencia: number;
  atraso: number;
  score: number;
}

export interface EstatisticasScore {
  estatisticas: EstatisticasBase[];
  ciclo: {
    faltam: number[];
    total_faltam: number;
  };
  analise: {
    soma_media: number;
    pares_media: number;
    impares_media: number;
    primos_media: number;
  };
}

export interface Palpite {
  numeros: number[];
  score_medio: number;
  metricas: {
    soma: number;
    pares: number;
    impares: number;
    primos: number;
    moldura: number;
    centro: number;
    repetidos_ultimo: number;
  };
}

export interface PalpitesEstatisticos {
  palpites: Palpite[];
  filtros_aplicados: {
    soma_range: [number, number];
    pares_range: [number, number];
    primos_range: [number, number];
    moldura_range: [number, number];
    max_repetidos: number;
    max_sequencia: number;
    similaridade_max: number;
    score_minimo: number;
  };
}

export interface HistoricoJogo {
  id: string;
  numeros: number[];
  concurso_alvo: number | null;
  data_criacao: string;
  conferido: boolean;
  acertos: number | null;
  premio: number | null;
}

export interface HistoricoResumo {
  total_jogos: number;
  total_apostado: number;
  total_premios: number;
  roi_percentual: number;
  distribuicao_acertos: Record<string, number>;
}

class ApiService {
  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Health & Status
  async getHealth(): Promise<{ status: string; timestamp: string }> {
    return this.fetch('/health');
  }

  // Concursos
  async getUltimoConcurso(): Promise<Concurso> {
    return this.fetch('/concurso/ultimo');
  }

  async getConcurso(numero: number): Promise<Concurso> {
    return this.fetch(`/concurso/${numero}`);
  }

  async getUltimosConcursos(quantidade: number): Promise<Concurso[]> {
    return this.fetch(`/ultimos/${quantidade}`);
  }

  // Estatísticas
  async getEstatisticasBase(): Promise<EstatisticasBase[]> {
    return this.fetch('/estatisticas/base');
  }

  async getEstatisticasScore(): Promise<EstatisticasScore> {
    return this.fetch('/estatisticas/score');
  }

  // Palpites
  async getPalpiteFixo(): Promise<{ palpite: number[]; score_medio: number }> {
    return this.fetch('/palpites/fixo');
  }

  async getPalpitesEstatisticos(): Promise<PalpitesEstatisticos> {
    return this.fetch('/palpites/estatisticos');
  }

  // Histórico (requer autenticação)
  async getHistorico(token: string): Promise<HistoricoJogo[]> {
    return this.fetch('/historico/', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async getHistoricoResumo(token: string): Promise<HistoricoResumo> {
    return this.fetch('/historico/resumo', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async salvarPalpite(
    token: string,
    numeros: number[],
    concursoAlvo?: number
  ): Promise<HistoricoJogo> {
    return this.fetch('/historico/', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        numeros,
        concurso_alvo: concursoAlvo,
      }),
    });
  }
}

export const api = new ApiService();
