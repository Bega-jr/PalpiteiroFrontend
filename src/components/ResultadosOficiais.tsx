"use client";

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Search, Trophy } from 'lucide-react';

interface Concurso {
  numero: number;
  data: string;
  dezenas: number[];
  ganhadores_15: number;
  valor_estimado: string;
}

const ResultadosOficiais = () => {
  const [concursos, setConcursos] = useState<Concurso[]>([]);
  const [pagina, setPagina] = useState(1);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);

  // Simulação de chamada ao seu backend (ajuste a rota conforme sua API)
  const fetchResultados = async (p: number) => {
    setLoading(true);
    try {
      const response = await fetch(`palpiteiro-backend.vercel.app{p}`);
      const data = await response.json();
      setConcursos(data);
    } catch (error) {
      console.error("Erro ao buscar resultados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResultados(pagina);
  }, [pagina]);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header e Busca */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Trophy className="text-amber-500" /> Resultados Oficiais
          </h1>
          <p className="text-slate-500">Histórico completo da Lotofácil atualizado em 2025</p>
        </div>
        
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="number"
            placeholder="Buscar concurso..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-all"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
      </div>

      {/* Lista de Resultados */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-slate-400">Carregando histórico...</div>
        ) : (
          concursos.map((conc) => (
            <div key={conc.numero} className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    Concurso {conc.numero}
                  </span>
                  <p className="text-sm text-slate-400 mt-1">{conc.data}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 uppercase font-bold">Ganhadores 15 pts</p>
                  <p className="text-lg font-bold text-green-600">{conc.ganhadores_15}</p>
                </div>
              </div>

              {/* Volante de dezenas sorteadas */}
              <div className="flex flex-wrap gap-2">
                {conc.dezenas.map((num) => (
                  <div 
                    key={num}
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-800 text-white font-bold text-sm shadow-sm border-2 border-slate-700"
                  >
                    {num.toString().padStart(2, '0')}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Paginação */}
      <div className="flex justify-center items-center gap-4 pt-6">
        <button 
          onClick={() => setPagina(p => Math.max(1, p - 1))}
          disabled={pagina === 1}
          className="p-2 border rounded-lg hover:bg-slate-50 disabled:opacity-30 transition-colors"
        >
          <ChevronLeft />
        </button>
        <span className="font-medium text-slate-700">Página {pagina}</span>
        <button 
          onClick={() => setPagina(p => p + 1)}
          className="p-2 border rounded-lg hover:bg-slate-50 transition-colors"
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  );
};

export default ResultadosOficiais;
