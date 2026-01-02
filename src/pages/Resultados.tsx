import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { ConcursoCard } from "@/components/ConcursoCard";
import { LoadingList } from "@/components/LoadingStates";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { Trophy, Search, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react"; // Adicionado AlertCircle

/**
 * [TEMPORÁRIO PARA TESTE] Interface de tipo para garantir que os dados do backend 
 * sejam compatíveis com o que o frontend espera. Pode ser movida para src/types/loteria.ts 
 * ou excluída se o problema não for a tipagem.
 */
interface ConcursoTeste {
  concurso: number;
  data: string; // Espera-se uma string no formato "YYYY-MM-DD"
  dezenas: number[]; // Espera-se uma lista de números [1, 2, ..., 25]
}

export default function Resultados() {
  const [searchConcurso, setSearchConcurso] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Aplicação da interface temporária <ConcursoTeste[]> e adição de isError
  const { data: ultimosConcursos, isLoading: loadingLista, isError: errorLista } = useQuery<ConcursoTeste[]>({
    queryKey: ["ultimosConcursos", 50],
    queryFn: () => api.getUltimosConcursos(50),
    staleTime: 1000 * 60 * 5, 
  });

  // Aplicação da interface temporária <ConcursoTeste | undefined> e adição de isError
  const { data: concursoBuscado, isLoading: loadingBusca, isError: errorBusca } = useQuery<ConcursoTeste | undefined>({
    queryKey: ["concurso", searchConcurso],
    queryFn: () => api.getConcurso(parseInt(searchConcurso)),
    enabled: !!searchConcurso && !isNaN(parseInt(searchConcurso)),
    retry: false, // Importante para não ficar tentando buscar um 404
  });

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
                 <Card><CardContent className="p-6 text-center text-destructive flex items-center justify-center gap-2"><AlertCircle className="h-4 w-4" /> Concurso não encontrado.</CardContent></Card>
            ) : concursoBuscado ? (
              <ConcursoCard
                concurso={concursoBuscado.concurso}
                data={concursoBuscado.data}
                dezenas={concursoBuscado.dezenas}
              />
            ) : null}
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
             <Card><CardContent className="p-6 text-center text-destructive flex items-center justify-center gap-2"><AlertCircle className="h-4 w-4" /> Erro ao carregar a lista de concursos.</CardContent></Card>
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
