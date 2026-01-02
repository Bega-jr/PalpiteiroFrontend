import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { ConcursoCard } from "@/components/ConcursoCard";
import { LoadingList } from "@/components/LoadingStates";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trophy, Search, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";

interface Concurso {
  concurso: number;
  data: string;
  dezenas: number[];
}

async function fetchUltimos(quantidade: number): Promise<Concurso[]> {
  const res = await fetch(`/ultimos/${quantidade}`);
  if (!res.ok) throw new Error("Erro ao carregar últimos concursos");
  return res.json(); // Já retorna array direto no formato correto
}

async function fetchConcurso(numero: number): Promise<Concurso | null> {
  const res = await fetch(`/concurso/${numero}`);
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error("Erro ao buscar concurso");
  }
  const data = await res.json();
  // Extrai o objeto dentro de "concurso" e mapeia dezenas
  const row = data.concurso;
  const bolas = [];
  for (let i = 1; i <= 15; i++) {
    const bola = row[`bola${i}`];
    if (bola !== undefined && bola !== null) {
      bolas.push(Number(bola));
    }
  }
  return {
    concurso: Number(row.concurso || row.Concurso),
    data: row.data,
    dezenas: bolas.sort((a, b) => a - b),
  };
}

export default function Resultados() {
  const [searchConcurso, setSearchConcurso] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const quantidadeLista = 50;

  const {
    data: ultimosConcursos = [],
    isLoading: loadingLista,
    isError: errorLista,
  } = useQuery<Concurso[]>({
    queryKey: ["ultimosConcursos", quantidadeLista],
    queryFn: () => fetchUltimos(quantidadeLista),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  const {
    data: concursoBuscado,
    isLoading: loadingBusca,
    isError: errorBusca,
  } = useQuery<Concurso | null>({
    queryKey: ["concurso", searchConcurso],
    queryFn: () => fetchConcurso(parseInt(searchConcurso)),
    enabled: !!searchConcurso && !isNaN(parseInt(searchConcurso)),
    retry: false,
  });

  const totalPages = Math.ceil(ultimosConcursos.length / itemsPerPage);
  const paginatedConcursos = ultimosConcursos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <Layout>
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
        {/* Busca */}
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
                  Erro ao buscar concurso.
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
                <CardContent className="p-6 text-center text-destructive flex items-center justify-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Concurso não encontrado.
                </CardContent>
              </Card>
            )}
          </section>
        )}

        {/* Lista de Últimos */}
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
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
