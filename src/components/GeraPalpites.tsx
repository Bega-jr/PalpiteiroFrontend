import React, { useState, useEffect } from 'react';
import { Sparkles, Save, RefreshCw } from 'lucide-react';

interface Palpite {
  numeros: number[];
  score: number;
  metricas: {
    pares: number;
    impares: number;
    soma: number;
  };
}

const GeraPalpites = () => {
  // Inicializamos sempre como array vazio para o .map não quebrar
  const [palpites, setPalpites] = useState<Palpite[]>([]);
  const [loading, setLoading] = useState(false);

    const fetchPalpites = async () => {
    setLoading(true);
    try {
      // 1. URL corrigida apontando para a rota de estatísticos
      const response = await fetch(
  "https://palpiteiro-backend.vercel.app/palpites/estatistico"
);
      const data = await response.json();

      // 2. Acessa data.palpites (o objeto retornado pelo FastAPI tem essa chave)
      if (data && data.status === "ok" && Array.isArray(data.palpites)) {
        setPalpites(data.palpites);
      } else {
        console.warn("Formato inesperado ou lista vazia:", data);
        setPalpites([]);
      }
    } catch (error) {
      console.error("Erro ao gerar palpites:", error);
      setPalpites([]);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchPalpites();
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Sparkles className="text-green-600" /> Palpites Estatísticos
        </h1>
        <button 
          onClick={fetchPalpites}
          disabled={loading}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all disabled:opacity-50"
        >
          <RefreshCw className={loading ? "animate-spin" : ""} size={20} />
          {loading ? "Gerando..." : "Gerar Novos Palpites"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
        {palpites.length > 0 ? (
          palpites.map((palpite, idx) => (
            <div key={idx} className="bg-white p-6 rounded-xl shadow-md border border-slate-100 hover:border-green-200 transition-colors">
              <div className="flex flex-wrap justify-between items-center mb-4">
                <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                  Palpite #{idx + 1}
                </span>
                {palpite.metricas && (
                  <div className="flex gap-4 text-xs font-medium text-slate-400">
                    <span>Pares: {palpite.metricas.pares}</span>
                    <span>Ímpares: {palpite.metricas.impares}</span>
                    <span>Soma: {palpite.metricas.soma}</span>
                    <span className="text-green-600 font-bold">Score: {palpite.score}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {/* Proteção para garantir que numeros seja uma array antes do sort */}
                {(palpite.numeros || []).sort((a, b) => a - b).map((num) => (
                  <div 
                    key={num}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-green-600 text-white font-bold shadow-sm"
                  >
                    {num.toString().padStart(2, '0')}
                  </div>
                ))}
              </div>

              <button className="flex items-center gap-2 text-sm text-slate-600 hover:text-green-600 transition-colors">
                <Save size={16} /> Salvar este jogo
              </button>
            </div>
          ))
        ) : !loading && (
          <div className="text-center py-20 text-slate-400 border-2 border-dashed rounded-2xl">
            Nenhum palpite disponível. Clique em gerar.
          </div>
        )}
      </div>
    </div>
  );
};

export default GeraPalpites;

