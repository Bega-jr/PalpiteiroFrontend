import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  RefreshCw,
  AlertCircle,
  Loader2,
} from "lucide-react";

const BASE_URL = "https://palpiteiro-backend.vercel.app";

interface Concurso {
  concurso: number;
  data: string;
  dezenas: number[];
  acumulado?: boolean;
}

export default function Resultados() {
  const queryClient = useQueryClient();
  const [searchConcurso, setSearchConcurso] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

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
      // ADICIONANDO UM TIMESTAMP PARA FURAR O CACHE DE REDE
      const cacheBuster = Date.now(); 
      const url = `${BASE_URL}/resultados?page=${currentPage}&limit=${limit}&_cb=${cacheBuster}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Erro ao carregar resultados");
      return res.json();
    },
    keepPreviousData: true,
    staleTime: 0, 
    cacheTime: 5 * 60 * 1000,
  });

  const concursos: Concurso[] = listaData?.resultados ?? [];

  // ===============================
  // 🔹 BUSCA POR CONCURSO
  // ===============================
  const {
    data: concursoBuscado,
    isLoading: loadingBusca,
    isError: errorBusca,
  } = useQuery({
    queryKey: ["concurso", searchConcurso],
    queryFn: async () => {
      const num = Number(searchConcurso);
      if (!num) return null;

      const res = await fetch(`${BASE_URL}/resultados/${num}`);

      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error("Erro ao buscar concurso");
      }

      const json = await res.json();
      // Sua API de busca retorna {status, concurso: {...}}
      return json.concurso;
    },
    enabled: !!searchConcurso,
    retry: false,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

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
        {/* Busca */}
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="flex gap-4">
              <Input
                type="number"
                placeholder="Buscar por número do concurso..."
                value={searchConcurso}
                onChange={(e) => setSearchConcurso(e.target.value)}
              />
              <Button type="submit" disabled={!searchConcurso || loadingBusca}>
                <Search className="mr-2 h-4 w-4" />
                Buscar
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Resultado da Busca */}
        {searchConcurso && (
          <section>
            <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-lottery-gold" />
              Concurso {searchConcurso}
            </h2>

            {loadingBusca ? (
              <LoadingList />
            ) : errorBusca ? (
              <Card>
                <CardContent className="p-6 text-destructive text-center">
                  Erro ao buscar concurso
                </CardContent>
              </Card>
            ) : concursoBuscado ? (
              <ConcursoCard
                concurso={concursoBuscado.concurso}
                data={concursoBuscado.data}
                dezenas={concursoBuscado.dezenas}
              />
            ) : (
              <Card>
                <CardContent className="p-6 text-destructive text-center">
                  Concurso não encontrado
                </CardContent>
              </Card>
            )}
          </section>
        )}

        {/* Lista */}
        <section>
          <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Últimos Resultados
          </h2>

          {/* TRATAMENTO DE ESTADOS DE CARREGAMENTO */}
          {loadingLista ? (
            <LoadingList />
          ) : errorLista ? (
            <Card>
              <CardContent className="p-6 text-destructive text-center">
                <AlertCircle className="h-5 w-5 inline mr-2" />
                Erro ao carregar resultados.
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Overlay de loading enquanto busca a próxima página */}
              <div className="relative">
                {fetchingLista && !loadingLista && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
                        <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    </div>
                )}
                
                <div className="space-y-3">
                  {concursos.map((c) => {
                    // CORREÇÃO AQUI: Extraímos a parte da data e formatamos manualmente
                    // Isso evita que o JavaScript aplique o fuso horário (UTC-3)
                    const formatarDataManual = (dataIso: string) => {
                      if (!dataIso) return "";
                      // Remove qualquer parte de tempo e separa os componentes
                      const [ano, mes, dia] = dataIso.split("T")[0].split("-");
                      return `${dia}/${mes}/${ano}`;
                    };
          
                    return (
                      <ConcursoCard
                        key={c.concurso}
                        concurso={c.concurso}
                        // Enviamos a data já formatada como string DD/MM/YYYY
                        data={formatarDataManual(c.data)}
                        dezenas={c.dezenas}
                        compact
                      />
                    );
                  })}
                </div>
              </div>


              {/* Paginação */}
              <div className="flex justify-center items-center gap-4 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || fetchingLista}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>

                <span className="text-sm text-muted-foreground">
                  Página {currentPage} de {totalPages}
                </span>

                <Button
                  variant="outline"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage >= totalPages || fetchingLista}
                >
                  Próxima
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </section>
      </div>
    </Layout>
  );
}


