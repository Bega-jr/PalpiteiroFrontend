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
  const [palpites, setPalpites] = useState<Palpite[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPalpites = async () => {
    setLoading(true);
    try {
      // Substitua pela URL real do seu backend na Vercel
      const response = await fetch('palpiteiro-backend.vercel.app');
      const data = await response.json();
      setPalpites(data);
    } catch (error) {
      console.error("Erro ao gerar palpites:", error);
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
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all"
        >
          <RefreshCw className={loading ? "animate-spin" : ""} size={20} />
          {loading ? "Gerando..." : "Gerar Novos Palpites"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
        {palpites.map((palpite, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl shadow-md border border-slate-100 hover:border-green-200 transition-colors">
            <div className="flex flex-wrap justify-between items-center mb-4">
              <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                Palpite #{idx + 1}
              </span>
              <div className="flex gap-4 text-xs font-medium text-slate-400">
                <span>Pares: {palpite.metricas.pares}</span>
                <span>Ímpares: {palpite.metricas.impares}</span>
                <span>Soma: {palpite.metricas.soma}</span>
                <span className="text-green-600 font-bold">Score: {palpite.score}</span>
              </div>
            </div>

            {/* Visual do Volante */}
            <div className="flex flex-wrap gap-2 mb-4">
              {palpite.numeros.sort((a, b) => a - b).map((num) => (
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
        ))}
      </div>
    </div>
  );
};

export default GeraPalpites;
