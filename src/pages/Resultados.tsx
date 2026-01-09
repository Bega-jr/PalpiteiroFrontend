import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query"; // Importe useQueryClient
import { Layout } from "@/components/Layout";
import { ConcursoCard } from "@/components/ConcursoCard";
import { LoadingList } from "@/components/LoadingStates";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Trophy,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw, // Importe o ícone de refresh
} from "lucide-react";

const BASE_URL = "https://palpiteiro-backend.vercel.app";

interface Concurso {
  concurso: number;
  data: string;
  dezenas: number[];
  acumulado?: boolean;
}

export default function Resultados() {
  const queryClient = useQueryClient(); // Inicialize o cliente de query

  const [searchConcurso, setSearchConcurso] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  // Função para forçar o refresh e invalidar todos os caches de resultados
  const forceRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["resultados"] });
    queryClient.invalidateQueries({ queryKey: ["total-concursos"] });
  };

  // ===============================
  // 🔹 TOTAL DE CONCURSOS
  // ===============================
  const { data: totalData, isFetching: fetchingTotal } = useQuery({
    queryKey: ["total-concursos"],
    queryFn: async () => {
      // Usa sua rota de backend correta
      const res = await fetch(`${BASE_URL}/resultados/total`);
      if (!res.ok) throw new Error("Erro ao buscar total");
      return res.json();
    },
    staleTime: 10 * 60 * 1000,
  });

  const total = totalData?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  // ===============================
  // 🔹 LISTA PAGINADA
  // ===============================
  const {
    data: listaData,
    isLoading: loadingLista,
    isError: errorLista,
    isFetching: fetchingLista,
  } = useQuery({
    queryKey: ["resultados", currentPage],
    queryFn: async () => {
      // Usa sua rota de backend correta
      const res = await fetch(
        `${BASE_URL}/resultados?page=${currentPage}&limit=${limit}`
      );
      if (!res.ok) throw new Error("Erro ao carregar resultados");
      return res.json();
    },
    // keepPreviousData: true, // Removendo para garantir que sempre puxe o mais novo na transição
    staleTime: 0, // Muda para 0 para que sempre verifique a cada foco na janela
    cacheTime: 5 * 60 * 1000,
  });

  // O backend retorna {status, page, limit, resultados}
  const concursos: Concurso[] = listaData?.resultados ?? []; 

  // ... (código de busca por concurso permanece o mesmo) ...

  return (
    <Layout>
      {/* Header */}
      <section className="gradient-hero text-primary-foreground py-12 md:py-16">
        <div className="container flex justify-between items-center">
          <div className="max-w-2xl">
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Resultados Oficiais
            </h1>
            <p className="text-white/80">
              Resultados da Lotofácil atualizados automaticamente.
            </p>
          </div>
          {/* Adiciona o botão de forçar atualização ao lado do título */}
          <Button
            onClick={forceRefresh}
            variant="outline"
            size="sm"
            disabled={fetchingTotal || fetchingLista}
            className="gap-2 bg-white text-primary hover:bg-slate-100"
          >
            <RefreshCw className={`h-4 w-4 ${fetchingTotal || fetchingLista ? "animate-spin" : ""}`} />
            Sincronizar
          </Button>
        </div>
      </section>

      <div className="container py-8 md:py-12 space-y-8">
        {/* Busca e Lista permanecem iguais */}
        {/* ... */}
      </div>
    </Layout>
  );
}
