"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Wallet, CheckCircle2, Clock, Trash2, TrendingUp } from 'lucide-react';

interface JogoSalvo {
  id: string;
  concurso: number;
  dezenas: number[];
  acertos: number | null;
  valor_premio: number;
  status: 'pendente' | 'conferido';
  data_criacao: string;
}

const HistoricoJogos = () => {
  const [jogos, setJogos] = useState<JogoSalvo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistorico = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    try {
      const response = await fetch('palpiteiro-backend.vercel.app', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      const data = await response.json();
      setJogos(data);
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistorico();
  }, []);

  // Cálculos de Resumo
  const totalApostado = jogos.length * 3.00; // Preço da Lotofácil em 2025
  const totalGanhos = jogos.reduce((acc, jogo) => acc + (jogo.valor_premio || 0), 0);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Cards de Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-slate-500 text-sm font-medium">Total de Jogos</p>
          <h3 className="text-3xl font-bold text-slate-800">{jogos.length}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-slate-500 text-sm font-medium">Investimento Total</p>
          <h3 className="text-3xl font-bold text-red-500">R$ {totalApostado.toFixed(2)}</h3>
        </div>
        <div className="bg-green-50 p-6 rounded-2xl shadow-sm border border-green-100">
          <p className="text-green-700 text-sm font-medium flex items-center gap-1">
            <TrendingUp size={16} /> Prêmios Ganhos
          </p>
          <h3 className="text-3xl font-bold text-green-600">R$ {totalGanhos.toFixed(2)}</h3>
        </div>
      </div>

      {/* Tabela de Jogos */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Data/Jogo</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Dezenas</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Acertos</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {jogos.map((jogo) => (
              <tr key={jogo.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <p className="text-sm font-bold text-slate-700">Conc. {jogo.concurso}</p>
                  <p className="text-xs text-slate-400">{new Date(jogo.data_criacao).toLocaleDateString()}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-1">
                    {jogo.dezenas.slice(0, 5).map(n => (
                      <span key={n} className="w-6 h-6 flex items-center justify-center bg-slate-100 rounded-full text-[10px] font-bold">
                        {n}
                      </span>
                    ))}
                    <span className="text-slate-400 text-[10px] self-center">...</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {jogo.status === 'conferido' ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full w-fit">
                      <CheckCircle2 size={12} /> Conferido
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full w-fit">
                      <Clock size={12} /> Pendente
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 font-bold text-slate-700">
                  {jogo.acertos !== null ? `${jogo.acertos} pts` : '-'}
                </td>
                <td className="px-6 py-4">
                  <button className="text-slate-300 hover:text-red-500 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistoricoJogos;
