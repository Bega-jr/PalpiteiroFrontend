"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Search, Trophy } from "lucide-react";
import { LotteryBall } from "@/components/LotteryBall"; // Importei o componente que você me passou

interface Concurso {
  numero: number;
  data: string;
  dezenas?: number[];
  ganhadores_15: number;
  valor_estimado?: string;
}

const API_BASE_URL = "https://palpiteiro-backend.vercel.app";

const ResultadosOficiais = () => {
  const [concursos, setConcursos] = useState<Concurso[]>([]);
  const [pagina, setPagina] = useState(1);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const fetchResultados = async (numeroPagina: number) => {
    setLoading(true);
    setErro(null);
    try {
      // URL para buscar a página específica do histórico
      const url = `${API_BASE_URL}/ultimos-concursos?page=${numeroPagina}`;
      console.log("DEBUG: Buscando URL:", url);

      const response = await fetch(url);

      if (!response.ok) {
        // Se a resposta não for OK (ex: 404, 500)
        throw new Error(`Erro na API: ${response.statusText} (${response.status})`);
      }

      const data: Concurso[] = await response.json();
      
      console.log("DEBUG: Dados recebidos:", data);

      if (data.length === 0 && numeroPagina > 1) {
          // Se não houver dados na próxima página, impede o usuário de avançar mais
          setPagina(p => p - 1);
          setErro("Você chegou ao final do histórico.");
      } else {
          setConcursos(data);
      }

    } catch (error) {
      console.error("Erro ao buscar resultados:", error);
      setErro("Falha ao carregar os resultados. Verifique sua conexão ou a API.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ CHAVE 1: UseEffect para gerenciar a paginação e carregamento inicial
  useEffect(() => {
    // Isso dispara o fetch toda vez que a página muda
    fetchResultados(pagina);
  }, [pagina]);


  // 🔎 CHAVE 2: Lógica de Busca e Filtro (sem chamar a API para cada digitação)
  // Mantemos o filtro apenas no frontend para os concursos já carregados.
  const concursosFiltrados = concursos.filter((c) =>
    busca ? c.numero.toString().includes(busca.trim()) : true
  );

  // Função para lidar com a mudança de página
  const handlePageChange = (delta: number) => {
    // Apenas muda a página se não estiver carregando ou se não houver erro
    if (!loading) {
        setPagina((p) => Math.max(1, p + delta));
    }
  }


  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header e Busca */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Trophy className="text-amber-500" /> Resultados Oficiais
          </h1>
          <p className="text-slate-500">
            Histórico completo da Lotofácil atualizado (Dados de 2025)
          </p>
        </div>

        <div className="relative w-full md:w-64">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="number"
            placeholder="Buscar concurso..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-all"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
      </div>

      {/* Lista de Resultados e Estados de Carregamento/Erro */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-slate-400">
            Carregando histórico...
          </div>
        ) : erro ? (
            <div className="text-center py-12 text-red-500 border border-red-300 bg-red-50 p-4 rounded-lg">
                {erro}
            </div>
        ) : concursosFiltrados.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            Nenhum resultado encontrado para o filtro aplicado.
          </div>
        ) : (
          concursosFiltrados.map((conc) => {
            const dezenasOrdenadas = Array.isArray(conc.dezenas)
              ? [...conc.dezenas].sort((a, b) => a - b)
              : [];

            return (
              <div
                key={conc.numero}
                className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                      Concurso {conc.numero}
                    </span>
                    <p className="text-sm text-slate-400 mt-1">
                      {conc.data}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-slate-400 uppercase font-bold">
                      Ganhadores 15 pts
                    </p>
                    <p className="text-lg font-bold text-green-600">
                      {conc.ganhadores_15}
                    </p>
                  </div>
                </div>

                {/* Dezenas */}
                <div className="flex flex-wrap gap-2">
                  {dezenasOrdenadas.length > 0 ? (
                    dezenasOrdenadas.map((num) => (
                      // Usando o componente LotteryBall importado
                      <LotteryBall 
                        key={num} 
                        number={num} 
                        size="md" 
                        active={true} // Todos os números sorteados são ativos
                        className="bg-slate-800 text-white border-2 border-slate-700"
                      />
                    ))
                  ) : (
                    <span className="text-slate-400 text-sm">
                      Dezenas indisponíveis
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Paginação */}
      <div className="flex justify-center items-center gap-4 pt-6">
        <button
          onClick={() => handlePageChange(-1)}
          disabled={pagina === 1 || loading}
          className="p-2 border rounded-lg hover:bg-slate-50 disabled:opacity-30 transition-colors"
        >
          <ChevronLeft />
        </button>

        <span className="font-medium text-slate-700">
          Página {pagina}
        </span>

        <button
          onClick={() => handlePageChange(1)}
          disabled={loading} // Desabilita enquanto busca a próxima página
          className="p-2 border rounded-lg hover:bg-slate-50 transition-colors"
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  );
};

export default ResultadosOficiais;
