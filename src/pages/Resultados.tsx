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

/**
 * Interface baseada no formato real da API oficial da Caixa para Lotofácil:
 * - numeroConcurso
 * - dataApuracao (ex: "01/01/2026")
 * - listaDezenas (array de strings como "01", "02", ...)
 */
interface ConcursoCaixa {
  numeroConcurso: number;
  dataApuracao: string;
  listaDezenas: string[];
}

/**
 * Interface que o ConcursoCard espera (mantida para compatibilidade)
 */
interface ConcursoFrontend {
  concurso: number;
  data: string; // "YYYY-MM-DD"
  dezenas: number[];
}

export default function Resultados() {
  const [searchConcurso, setSearchConcurso] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Lista dos últimos 50 concursos (assume que seu backend já retorna no formato correto)
  const { data: ultimosConcursos, isLoading: loadingLista, isError: errorLista } = useQuery<ConcursoFrontend[]>({
    queryKey: ["ultimosConcursos", 50],
    queryFn: () => api.getUltimosConcursos(50),
    staleTime: 1000 * 60 * 5,
  });

  // Busca por concurso específico - agora com mapeamento do formato real da Caixa
  const { data: concursoBuscadoRaw, isLoading: loadingBusca, isError: errorBusca } = useQuery<ConcursoCaixa | undefined>({
    queryKey: ["concurso", searchConcurso],
    queryFn: async () => {
      const num = parseInt(searchConcurso);
      if (isNaN(num)) return undefined;
      const response = await fetch(`https://servicebus2.caixa.gov.br/portaldeloterias/api/lotofacil/${num}`);
      if (!response.ok) throw new Error("Não encontrado");
      return response.json();
    },
    enabled: !!searchConcurso && !isNaN(parseInt(searchConcurso)),
    retry: false,
  });

  // Mapeia para o formato esperado pelo ConcursoCard
  const concursoBuscado: ConcursoFrontend | undefined = concursoBuscadoRaw
    ? {
        concurso: concursoBuscadoRaw.numeroConcurso,
        data: concursoBuscadoRaw.dataApuracao.split("/").reverse().join("-"), // "DD/MM/YYYY" → "YYYY-MM-DD"
        dezenas: concursoBuscadoRaw.listaDezenas.map(Number).sort((a, b) => a - b),
      }
    : undefined;

  const concursos = Array.isArray(ultimosConcursos) ? ultimosConcursos : [];
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
              Resultado do Concurso {searchConcurso}
            </h2>
            {loadingBusca ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  Buscando...
                </CardContent>
              </Card>
            ) : errorBusca ? (
              <Card>
                <CardContent className="p-6 text-center text-destructive flex items-center justify-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Concurso não encontrado.
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
                <CardContent className="p-6 text-center text-muted-foreground">
                  Nenhum resultado encontrado.
                </CardContent>
              </Card>
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
          ) : errorLista ? (
            <Card>
              <CardContent className="p-6 text-center text-destructive flex items-center justify-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Erro ao carregar a lista de concursos.
              </CardContent>
            </Card>
          ) : paginatedConcursos.length > 0 ? (
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
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                Nenhum resultado disponível no momento.
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </Layout>
  );
}
