import React, { useState, useEffect } from "react";
import { Sparkles, Save, RefreshCw } from "lucide-react";

interface Palpite {
  numeros: number[];
  score: number;
  metricas: {
    pares: number;
    impares: number;
    soma: number;
  };
}

const API_URL = "https://palpiteiro-backend.vercel.app";

const GeraPalpites = () => {
  const [palpites, setPalpites] = useState<Palpite[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPalpites = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/palpites/estatistico`);
      const json = await response.json();

      // ✅ CORREÇÃO CRÍTICA
      setPalpites(Array.isArray(json.palpites) ? json.palpites : []);
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
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
        >
          <RefreshCw className={loading ? "animate-spin" : ""} size={20} />
          {loading ? "Gerando..." : "Gerar Novos Palpites"}
        </button>
      </div>

      {palpites.length === 0 && !loading && (
        <div className="text-center text-slate-400">
          Nenhum palpite disponível
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {palpites.map((palpite, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl shadow border">
            <div className="flex justify-between mb-3 text-sm">
              <span>Palpite #{idx + 1}</span>
              <span className="font-bold text-green-600">
                Score: {palpite.score.toFixed(2)}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {[...palpite.numeros].sort((a, b) => a - b).map((num) => (
                <div
                  key={num}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-green-600 text-white font-bold"
                >
                  {num.toString().padStart(2, "0")}
                </div>
              ))}
            </div>

            <div className="text-xs text-slate-500 flex gap-4">
              <span>Pares: {palpite.metricas.pares}</span>
              <span>Ímpares: {palpite.metricas.impares}</span>
              <span>Soma: {palpite.metricas.soma}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GeraPalpites;
