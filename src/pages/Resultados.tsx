import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { ConcursoCard } from "@/components/ConcursoCard";
import { LoadingList } from "@/components/LoadingStates";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { Trophy, Search, ChevronLeft, ChevronRight } from "lucide-react";

export default function Resultados() {
  const [searchConcurso, setSearchConcurso] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: ultimosConcursos, isLoading: loadingLista } = useQuery({
    queryKey: ["ultimosConcursos", 50],
    queryFn: () => api.getUltimosConcursos(50),
  });

  const { data: concursoBuscado, isLoading: loadingBusca } = useQuery({
    queryKey: ["concurso", searchConcurso],
    queryFn: () => api.getConcurso(parseInt(searchConcurso)),
    enabled: searchConcurso.length > 0 && !isNaN(parseInt(searchConcurso)),
  });

  const concursos = ultimosConcursos || [];
  const totalPages = Math.ceil(concursos.length / itemsPerPage);
  const paginatedConcursos = concursos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
              Confira os últimos resultados da Lotofácil. Dados atualizados
              diretamente da Caixa Econômica Federal.
            </p>
          </div>
        </div>
      </section>

      <div className="container py-8 md:py-12 space-y-8">
        {/* Busca por Concurso */}
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder="Buscar por número do concurso..."
                  value={searchConcurso}
                  onChange={(e) => setSearchConcurso(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button type="submit" disabled={!searchConcurso}>
                <Search className="mr-2 h-4 w-4" />
                Buscar
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Resultado da Busca */}
        {searchConcurso && concursoBuscado && (
          <section>
            <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-lottery-gold" />
              Resultado do Concurso {searchConcurso}
            </h2>
            {loadingBusca ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  Buscando...
                </CardContent>
              </Card>
            ) : (
              <ConcursoCard
                concurso={concursoBuscado.concurso}
                data={concursoBuscado.data}
                dezenas={concursoBuscado.dezenas}
              />
            )}
          </section>
        )}

        {/* Lista de Concursos */}
        <section>
          <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Últimos Resultados
          </h2>

          {loadingLista ? (
            <LoadingList />
          ) : (
            <>
              <div className="space-y-3">
                {paginatedConcursos.map((concurso) => (
                  <ConcursoCard
                    key={concurso.concurso}
                    concurso={concurso.concurso}
                    data={concurso.data}
                    dezenas={concurso.dezenas}
                    compact
                  />
                ))}
              </div>

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-8">
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
                    disabled={currentPage === totalPages}
                  >
                    Próxima
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </Layout>
  );
}
