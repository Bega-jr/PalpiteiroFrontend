import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { ConcursoCard } from "@/components/ConcursoCard";
import { LoadingList } from "@/components/LoadingStates";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { Trophy, Search, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";

export default function Resultados() {
  const [searchConcurso, setSearchConcurso] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Busca lista de 50 concursos
  const { data: ultimosConcursos, isLoading: loadingLista, isError: errorLista } = useQuery({
    queryKey: ["ultimosConcursos", 50],
    queryFn: () => api.getUltimosConcursos(50),
    staleTime: 1000 * 60 * 5, // Cache de 5 minutos
  });

  // Busca concurso específico
  const { data: concursoBuscado, isLoading: loadingBusca, isError: errorBusca } = useQuery({
    queryKey: ["concurso", searchConcurso],
    queryFn: () => api.getConcurso(parseInt(searchConcurso)),
    enabled: !!searchConcurso && !isNaN(parseInt(searchConcurso)) && searchConcurso.length >= 1,
    retry: false, // Não tenta novamente se não encontrar (404)
  });

  const concursos = Array.isArray(ultimosConcursos) ? ultimosConcursos : [];
  const totalPages = Math.ceil(concursos.length / itemsPerPage);
  const paginatedConcursos = concursos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // A busca é automática pelo 'enabled' do useQuery, 
    // mas o preventDefault evita o refresh da página.
  };

  return (
    <Layout>
      {/* Header */}
      <section className="gradient-hero text-primary-foreground py-12 md:py-16">
        <div className="container">
          <div className="max-w-2xl">
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
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
        <Card className="border-primary/10 shadow-md">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder="Ex: 3270..."
                  value={searchConcurso}
                  onChange={(e) => {
                    setSearchConcurso(e.target.value);
                    setCurrentPage(1); // Volta para pag 1 ao buscar
                  }}
                  className="w-full"
                />
              </div>
              <Button type="submit" disabled={!searchConcurso || loadingBusca}>
                {loadingBusca ? "Buscando..." : (
                  <><Search className="mr-2 h-4 w-4" /> Buscar</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Resultado da Busca Específica */}
        {searchConcurso && (
          <section className="animate-in fade-in slide-in-from-top-4 duration-500">
            <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-lottery-gold" />
              Resultado do Concurso {searchConcurso}
            </h2>
            
            {loadingBusca ? (
              <Card><CardContent className="p-12 text-center text-muted-foreground">Buscando detalhes...</CardContent></Card>
            ) : errorBusca ? (
              <Card className="border-destructive/20 bg-destructive/5">
                <CardContent className="p-6 text-center text-destructive flex items-center justify-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Concurso {searchConcurso} não encontrado em nossa base.
                </CardContent>
              </Card>
            ) : concursoBuscado && (
              <ConcursoCard
                concurso={concursoBuscado.concurso}
                data={concursoBuscado.data}
                dezenas={concursoBuscado.dezenas}
              />
            )}
          </section>
        )}

        {/* Lista de Concursos (Histórico) */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Últimos Resultados
            </h2>
            {!loadingLista && (
               <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
                 Total: {concursos.length} registros
               </span>
            )}
          </div>

          {loadingLista ? (
            <LoadingList />
          ) : errorLista ? (
            <div className="text-center py-12 text-muted-foreground">
              Erro ao carregar os resultados. Tente novamente mais tarde.
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {paginatedConcursos.length > 0 ? (
                  paginatedConcursos.map((concurso) => (
                    <ConcursoCard
                      key={concurso.concurso}
                      concurso={concurso.concurso}
                      data={concurso.data}
                      dezenas={concurso.dezenas}
                      compact
                    />
                  ))
                ) : (
                  <p className="text-center py-10 text-muted-foreground">Nenhum resultado encontrado.</p>
                )}
              </div>

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 border-t pt-8">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Próxima <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    Página {currentPage} de {totalPages}
                  </span>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </Layout>
  );
}
