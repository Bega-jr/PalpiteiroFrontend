import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { ConcursoCard } from "@/components/ConcursoCard";
import { LoadingList } from "@/components/LoadingStates";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trophy, Search, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import Papa from 'papaparse';

// IMPORTANTE: Importa a URL do arquivo CSV onde quer que ele esteja
// Ajuste a quantidade de ../ se a pasta 'data' estiver em níveis diferentes
import csvUrl from "../../data/Lotofacil.csv?url";

interface Concurso {
  concurso: number;
  data: string;
  dezenas: number[];
}

export default function Resultados() {
  const [searchConcurso, setSearchConcurso] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [allConcursos, setAllConcursos] = useState<Concurso[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 10;

  useEffect(() => {
    // Usamos a csvUrl gerada pelo Vite para garantir que o Netlify ache o arquivo
    Papa.parse(csvUrl, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const concursos: Concurso[] = results.data
            .filter((row: any) => row.loteria === "lotofacil" && row.concurso)
            .map((row: any) => {
              const bolas = [
                row.bola1, row.bola2, row.bola3, row.bola4, row.bola5,
                row.bola6, row.bola7, row.bola8, row.bola9, row.bola10,
                row.bola11, row.bola12, row.bola13, row.bola14, row.bola15,
              ]
                .map(Number)
                .filter(n => !isNaN(n))
                .sort((a, b) => a - b);

              return {
                concurso: Number(row.concurso),
                data: row.data,
                dezenas: bolas,
              };
            })
            .sort((a, b) => b.concurso - a.concurso);

          setAllConcursos(concursos);
        } catch (err) {
          console.error("Erro ao processar dados do CSV:", err);
        } finally {
          setIsLoading(false);
        }
      },
      error: (error) => {
        console.error("Erro ao carregar arquivo CSV:", error);
        setIsLoading(false);
      },
    });
  }, []);

  const concursoBuscado = searchConcurso
    ? allConcursos.find(c => c.concurso === parseInt(searchConcurso))
    : undefined;

  const totalPages = Math.ceil(allConcursos.length / itemsPerPage);
  const paginatedConcursos = allConcursos.slice(
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
              diretamente da base de dados.
            </p>
          </div>
        </div>
      </section>

      <div className="container py-8 md:py-12 space-y-8">
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

        {searchConcurso && (
          <section>
            <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-lottery-gold" />
              Resultado do Concurso {searchConcurso}
            </h2>
            {isLoading ? (
              <Card><CardContent className="p-6 text-center">Carregando...</CardContent></Card>
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

        <section>
          <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Últimos Resultados
          </h2>

          {isLoading ? (
            <LoadingList />
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
