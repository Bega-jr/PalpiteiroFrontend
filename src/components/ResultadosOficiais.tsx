"use client";

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Search, Trophy } from 'lucide-react';

interface Concurso {
  numero: number;
  data: string;
  dezenas: number[];
  ganhadores_15: number;
  valor_15: string;
}

const ResultadosOficiais = () => {
  const [concursos, setConcursos] = useState<Concurso[]>([]);
  const [pagina, setPagina] = useState(1);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchResultados = async (p: number) => {
    setLoading(true);
    try {
      // 1. URL corrigida com protocolo HTTPS
      // Nota: Atualmente sua API retorna apenas o ÚLTIMO. 
      // Se criar uma rota de listagem no futuro, altere o endpoint aqui.
      const url = busca 
        ? `palpiteiro-backend.vercel.app{busca}`
        : `palpiteiro-backend.vercel.app`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "ok" && data.concurso) {
        const c = data.concurso;
        
        // 2. Mapeia as bolas individuais do CSV para a array 'dezenas'
        const concursoFormatado: Concurso = {
          numero: c.concurso,
          data: c.data,
          ganhadores_15: c.ganhadores_15 || 0,
          valor_15: c.valor_15 || "0.00",
          dezenas: [
            c.bola1, c.bola2, c.bola3, c.bola4, c.bola5, 
            c.bola6, c.bola7, c.bola8, c.bola9, c.bola10, 
            c.bola11, c.bola12, c.bola13, c.bola14, c.bola15
          ].map(Number).filter(n => !isNaN(n)) // Converte para número e remove falhas
        };

        // 3. Define como Array [ ] para que o .map() no JSX funcione sem erro
        setConcursos([concursoFormatado]);
      } else {
        setConcursos([]);
      }
    } catch (error) {
      console.error("Erro ao buscar resultados:", error);
      setConcursos([]);
    } finally {
      setLoading(false);
    }
  };

  // Dispara a busca quando a página muda ou quando o usuário termina de digitar a busca
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchResultados(pagina);
    }, 500); // Pequeno delay para não sobrecarregar a API enquanto digita
    return () => clearTimeout(timer);
  }, [pagina, busca]);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header e Busca */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Trophy className="text-amber-500" /> Resultados Oficiais
          </h1>
          <p className="text-slate-500">Histórico da Lotofácil (Dados de 2025)</p>
        </div>
        
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="number"
            placeholder="Buscar concurso ex: 3280"
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-all"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
      </div>

      {/* Lista de Resultados */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-slate-400">Carregando dados...</div>
        ) : concursos.length > 0 ? (
          concursos.map((conc) => (
            <div key={conc.numero} className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    Concurso {conc.numero}
                  </span>
                  <p className="text-sm text-slate-400 mt-1">{conc.data}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 uppercase font-bold">Ganhadores 15 pts</p>
                  <p className="text-lg font-bold text-green-600">{conc.ganhadores_15}</p>
                  <p className="text-xs text-slate-400">Prêmio: R$ {conc.valor_15}</p>
                </div>
              </div>

              {/* Volante de dezenas */}
              <div className="flex flex-wrap gap-2">
                {conc.dezenas.map((num, idx) => (
                  <div 
                    key={`${conc.numero}-${idx}`}
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-800 text-white font-bold text-sm shadow-sm border-2 border-slate-700"
                  >
                    {num.toString().padStart(2, '0')}
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border-2 border-dashed">
            Nenhum resultado encontrado para "{busca}".
          </div>
        )}
      </div>

      {/* Paginação (Simplificada pois a API atual retorna 1 por vez) */}
      <div className="flex justify-center items-center gap-4 pt-6">
        <button 
          onClick={() => setPagina(p => Math.max(1, p - 1))}
          disabled={pagina === 1 || !!busca}
          className="p-2 border rounded-lg hover:bg-slate-50 disabled:opacity-30 transition-colors"
        >
          <ChevronLeft />
        </button>
        <span className="font-medium text-slate-700">Página {pagina}</span>
        <button 
          onClick={() => setPagina(p => p + 1)}
          disabled={!!busca}
          className="p-2 border rounded-lg hover:bg-slate-50 disabled:opacity-30 transition-colors"
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  );
};

export default ResultadosOficiais;
