export interface PalpiteEstatistico {
  id?: string;
  indice_palpite: number;
  numeros: number[] | string;
  soma_total?: number;
  pares?: number;
  impares?: number;
  score: number;
  versao_gerador?: string;
  
  // 🟢 NOVAS CHAVES CONCILIADAS DO BACKTEST
  score_backtest?: number;
  memoria_aplicada?: boolean;
}
