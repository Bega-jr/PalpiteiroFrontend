"use client";

import React, { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

import {
  CheckCircle2,
  Clock,
  Trash2,
  TrendingUp,
  Wallet,
  CalendarDays,
  Target,
} from "lucide-react";

interface SavedGame {
  id: number;

  user_id: string;

  numbers: number[];

  contest_type: string;

  stats: {
    contest_number?: number;
    hits?: number;
    checked?: boolean;
    strategy?: string;
    score?: number;
    generated_by?: string;
  } | null;

  played: boolean;

  prize_amount: number;

  created_at: string;
}

const HistoricoJogos = () => {
  const [jogos, setJogos] = useState<SavedGame[]>([]);
  const [loading, setLoading] = useState(true);

  // ======================================================
  // BUSCAR HISTÓRICO
  // ======================================================

  const fetchHistorico = async () => {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setJogos([]);
        return;
      }

      const { data, error } = await supabase
        .from("saved_games")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error("Erro Supabase:", error);
        setJogos([]);
        return;
      }

      setJogos(data || []);
    } catch (error) {
      console.error(
        "Erro ao buscar histórico:",
        error
      );

      setJogos([]);
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // DELETE
  // ======================================================

  const handleDelete = async (id: number) => {
    try {
      const { error } = await supabase
        .from("saved_games")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Erro delete:", error);
        return;
      }

      setJogos((prev) =>
        prev.filter((jogo) => jogo.id !== id)
      );
    } catch (error) {
      console.error(error);
    }
  };

  // ======================================================
  // LOAD
  // ======================================================

  useEffect(() => {
    fetchHistorico();
  }, []);

  // ======================================================
  // STATS
  // ======================================================

  const totalJogos = jogos.length;

  const valorPorJogo = 3;

  const totalApostado =
    totalJogos * valorPorJogo;

  const totalGanhos = jogos.reduce(
    (acc, jogo) =>
      acc + Number(jogo.prize_amount || 0),
    0
  );

  const roi =
    totalApostado > 0
      ? (
          ((totalGanhos - totalApostado) /
            totalApostado) *
          100
        ).toFixed(1)
      : "0";

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div className="space-y-8 animate-fade-in">

      {/* HEADER */}

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-display font-bold tracking-tight">
          Histórico de Jogos
        </h1>

        <p className="text-muted-foreground">
          Gerencie seus jogos salvos,
          acompanhe resultados e analise ROI.
        </p>
      </div>

      {/* CARDS */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        {/* TOTAL */}

        <div className="gradient-card border rounded-2xl p-6 shadow-md">
          <p className="text-sm text-muted-foreground">
            Total de Jogos
          </p>

          <h3 className="text-3xl font-bold mt-2">
            {totalJogos}
          </h3>
        </div>

        {/* INVESTIMENTO */}

        <div className="gradient-card border rounded-2xl p-6 shadow-md">
          <p className="text-sm text-muted-foreground">
            Investimento
          </p>

          <h3 className="text-3xl font-bold mt-2 text-red-500">
            R$ {totalApostado.toFixed(2)}
          </h3>
        </div>

        {/* GANHOS */}

        <div className="gradient-card border rounded-2xl p-6 shadow-md">
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Wallet size={16} />
            Ganhos
          </p>

          <h3 className="text-3xl font-bold mt-2 text-green-600">
            R$ {totalGanhos.toFixed(2)}
          </h3>
        </div>

        {/* ROI */}

        <div className="gradient-card border rounded-2xl p-6 shadow-md">
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <TrendingUp size={16} />
            ROI
          </p>

          <h3
            className={`text-3xl font-bold mt-2 ${
              Number(roi) >= 0
                ? "text-green-600"
                : "text-red-500"
            }`}
          >
            {roi}%
          </h3>
        </div>
      </div>

      {/* TABELA */}

      <div className="bg-card border rounded-2xl overflow-hidden shadow-md">

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="bg-muted/50 border-b">
              <tr>

                <th className="text-left px-6 py-4 text-sm font-semibold whitespace-nowrap">
                  Data
                </th>

                <th className="text-left px-6 py-4 text-sm font-semibold whitespace-nowrap">
                  Concurso
                </th>

                <th className="text-left px-6 py-4 text-sm font-semibold">
                  Números
                </th>

                <th className="text-left px-6 py-4 text-sm font-semibold whitespace-nowrap">
                  Tipo
                </th>

                <th className="text-left px-6 py-4 text-sm font-semibold whitespace-nowrap">
                  Status
                </th>

                <th className="text-left px-6 py-4 text-sm font-semibold whitespace-nowrap">
                  Acertos
                </th>

                <th className="text-left px-6 py-4 text-sm font-semibold whitespace-nowrap">
                  Prêmio
                </th>

                <th className="text-left px-6 py-4 text-sm font-semibold whitespace-nowrap">
                  Ações
                </th>

              </tr>
            </thead>

            <tbody>

              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-16 text-muted-foreground"
                  >
                    Carregando histórico...
                  </td>
                </tr>
              ) : jogos.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-16 text-muted-foreground"
                  >
                    Nenhum jogo salvo.
                  </td>
                </tr>
              ) : (
                jogos.map((jogo) => {
                  const contestNumber =
                    jogo.stats?.contest_number;

                  const hits =
                    jogo.stats?.hits;

                  return (
                    <tr
                      key={jogo.id}
                      className="border-b hover:bg-muted/30 transition-colors"
                    >

                      {/* DATA */}

                      <td className="px-6 py-4 align-top">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium flex items-center gap-1">
                            <CalendarDays size={14} />
                            {new Date(
                              jogo.created_at
                            ).toLocaleDateString(
                              "pt-BR"
                            )}
                          </span>

                          <span className="text-xs text-muted-foreground mt-1">
                            {new Date(
                              jogo.created_at
                            ).toLocaleTimeString(
                              "pt-BR",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                        </div>
                      </td>

                      {/* CONCURSO */}

                      <td className="px-6 py-4 align-top">
                        <div className="flex items-center gap-2">
                          <Target
                            size={15}
                            className="text-primary"
                          />

                          <span className="font-semibold">
                            {contestNumber
                              ? `#${contestNumber}`
                              : "--"}
                          </span>
                        </div>
                      </td>

                      {/* NÚMEROS */}

                      <td className="px-6 py-4 min-w-[320px]">
                        <div className="flex flex-wrap gap-1.5">

                          {Array.isArray(
                            jogo.numbers
                          ) &&
                            jogo.numbers
                              .sort((a, b) => a - b)
                              .map((n) => (
                                <span
                                  key={`${jogo.id}-${n}`}
                                  className="
                                    w-9 h-9 rounded-full
                                    bg-primary
                                    text-primary-foreground
                                    text-xs font-bold
                                    flex items-center justify-center
                                    shadow-sm
                                  "
                                >
                                  {String(n).padStart(
                                    2,
                                    "0"
                                  )}
                                </span>
                              ))}
                        </div>
                      </td>

                      {/* TIPO */}

                      <td className="px-6 py-4 align-top">
                        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold capitalize">
                          {jogo.contest_type ||
                            "standard"}
                        </span>
                      </td>

                      {/* STATUS */}

                      <td className="px-6 py-4 align-top">

                        {jogo.played ? (
                          <span className="flex items-center gap-1 text-green-600 text-xs font-bold">
                            <CheckCircle2 size={14} />
                            Conferido
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                            <Clock size={14} />
                            Pendente
                          </span>
                        )}

                      </td>

                      {/* ACERTOS */}

                      <td className="px-6 py-4 align-top">
                        <span className="font-bold text-lg">
                          {hits ?? "--"}
                        </span>

                        {hits && (
                          <span className="text-xs text-muted-foreground ml-1">
                            pts
                          </span>
                        )}
                      </td>

                      {/* PRÊMIO */}

                      <td className="px-6 py-4 align-top">
                        <span
                          className={`font-bold ${
                            Number(
                              jogo.prize_amount
                            ) > 0
                              ? "text-green-600"
                              : "text-muted-foreground"
                          }`}
                        >
                          R${" "}
                          {Number(
                            jogo.prize_amount || 0
                          ).toFixed(2)}
                        </span>
                      </td>

                      {/* AÇÕES */}

                      <td className="px-6 py-4 align-top">

                        <button
                          onClick={() =>
                            handleDelete(jogo.id)
                          }
                          className="
                            text-muted-foreground
                            hover:text-red-500
                            transition-colors
                          "
                        >
                          <Trash2 size={18} />
                        </button>

                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HistoricoJogos;