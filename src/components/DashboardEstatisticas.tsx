"use client";

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { BarChart3, Info, Calendar } from 'lucide-react';

interface EstatisticaNumero {
  numero: number;
  frequencia: number;
  atraso: number;
  score: number;
}

const DashboardEstatisticas = () => {
  // ✅ Garantia 1: Iniciar sempre com array vazio
  const [dados, setDados] = useState<EstatisticaNumero[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEstatisticas = async () => {
      try {
        // ✅ Ajuste de URL e Rota (verifique se a rota no python é /estatisticas)
        const response = await fetch('https://palpiteiro-backend.vercel.app/');
        const data = await response.json();
        
        // ✅ Garantia 2: Proteção contra objeto não iterável
        if (data && Array.isArray(data.estatisticas)) {
            setDados(data.estatisticas);
        } else if (Array.isArray(data)) {
            setDados(data);
        } else {
            console.error("Formato de dados inválido:", data);
            setDados([]);
        }
      } catch (error) {
        console.error("Erro ao buscar estatísticas:", error);
        setDados([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEstatisticas();
  }, []);

  // ✅ Garantia 3: Criar uma variável segura para o sorting (evita erro se dados for null)
  const dadosOrdenados = Array.isArray(dados) 
    ? [...dados].sort((a, b) => b.score - a.score).slice(0, 10) 
    : [];

  return (
    <div className="p-6 space-y-8 bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BarChart3 className="text-blue-600" /> Análise Estatística
          </h1>
          <p className="text-slate-500 text-sm">Dados baseados nos últimos 100 concursos</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-2 rounded-lg border shadow-sm text-sm">
          <Calendar size={16} className="text-slate-400" />
          <span className="font-medium">Atualizado em: Dez/2025</span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-700">Frequência das Dezenas</h2>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Info size={14} /> Vezes que cada número foi sorteado
          </div>
        </div>
        
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={Array.isArray(dados) ? dados : []}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="numero" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#64748b', fontSize: 12}}
              />
              <YAxis hide />
              <Tooltip 
                cursor={{fill: '#f8fafc'}}
                contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
              />
              <Bar dataKey="frequencia" radius={[4, 4, 0, 0]}>
                {/* ✅ Garantia 4: .map seguro no gráfico */}
                {Array.isArray(dados) && dados.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.frequencia > 60 ? '#16a34a' : '#3b82f6'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm uppercase">
              <tr>
                <th className="px-6 py-4 font-semibold">Número</th>
                <th className="px-6 py-4 font-semibold">Frequência</th>
                <th className="px-6 py-4 font-semibold">Atraso Atual</th>
                <th className="px-6 py-4 font-semibold text-green-600">Score</th>
              </tr>
            </thead>
            <tbody className="text-slate-700 divide-y divide-slate-100">
              {/* ✅ Garantia 5: Renderização usando a variável segura */}
              {loading ? (
                <tr><td colSpan={4} className="text-center py-4">Carregando...</td></tr>
              ) : dadosOrdenados.length > 0 ? (
                dadosOrdenados.map((n) => (
                  <tr key={n.numero} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 font-bold text-blue-600">{n.numero.toString().padStart(2, '0')}</td>
                    <td className="px-6 py-3">{n.frequencia}x</td>
                    <td className="px-6 py-3 font-medium text-amber-600">{n.atraso} concursos</td>
                    <td className="px-6 py-3 font-bold">{n.score}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={4} className="text-center py-4 text-slate-400">Sem dados disponíveis</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-green-700 p-6 rounded-xl text-white shadow-lg">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            Análise de Ciclo
          </h3>
          <p className="text-green-100 text-sm mb-6">
            Números que faltam ser sorteados para fechar o ciclo atual:
          </p>
          <div className="flex flex-wrap gap-3">
            {[4, 12, 18, 25].map(n => (
              <div key={n} className="w-12 h-12 bg-white text-green-700 flex items-center justify-center rounded-full font-black text-lg shadow-md border-2 border-green-400">
                {n}
              </div>
            ))}
          </div>
          <div className="mt-8 pt-6 border-t border-green-500/30">
            <p className="text-xs opacity-80 italic">O ciclo fecha quando todos os 25 números são sorteados ao menos uma vez.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardEstatisticas;

