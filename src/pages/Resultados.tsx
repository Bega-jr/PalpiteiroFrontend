import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
  AlertCircle,
} from "lucide-react";

const BASE_URL = "https://palpiteiro-backend.vercel.app";

interface Concurso {
  concurso: number;
  data: string;
  dezenas: number[];
  acumulado?: boolean;
}

export default function Resultados() {
  const [searchConcurso, setSearchConcurso] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  // ===============================
  // 🔹 TOTAL DE CONCURSOS
  // ===============================
  const { data: totalData } = useQuery({
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
  } = useQuery({
    queryKey: ["resultados", currentPage],
    queryFn: async () => {
      const res = await fetch(
        `${BASE_URL}/resultados?page=${currentPage}&limit=${limit}`
      );
      if (!res.ok) throw new Error("Erro ao carregar resultados");
      return res.json();
    },
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
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

      const res = await fetch(
        `${BASE_URL}/resultados/${num}`
      );

      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error("Erro ao buscar concurso");
      }

      const json = await res.json();
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
        <div className="container">
          <div className="max-w-2xl">
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Resultados Oficiais
            </h1>
            <p className="text-white/80">
              Resultados da Lotofácil atualizados automaticamente.
            </p>
          </div>
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

          {loadingLista ? (
            <LoadingList />
          ) : errorLista ? (
            <Card>
              <CardContent className="p-6 text-destructive text-center">
                Erro ao carregar resultados
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="space-y-3">
                {concursos.map((c) => (
                  <ConcursoCard
                    key={c.concurso}
                    concurso={c.concurso}
                    data={c.data}
                    dezenas={c.dezenas}
                    compact
                  />
                ))}
              </div>

              {/* Paginação */}
              <div className="flex justify-center items-center gap-4 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
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
                  disabled={currentPage >= totalPages}
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
