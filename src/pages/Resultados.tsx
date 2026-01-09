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
  data: string; // Recebe "DD/MM/YYYY" direto do Python
  dezenas: number[];
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

  const { data: totalData } = useQuery({
    queryKey: ["total-concursos"],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/resultados/total`);
      return res.json();
    },
  });

  const total = totalData?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  const { data: listaData, isLoading: loadingLista, isFetching: fetchingLista } = useQuery({
    queryKey: ["resultados", currentPage],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/resultados?page=${currentPage}&limit=${limit}`);
      return res.json();
    },
  });

  const concursos: Concurso[] = listaData?.resultados ?? [];

  const { data: concursoBuscado, isLoading: loadingBusca } = useQuery({
    queryKey: ["concurso", searchConcurso],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/resultados/${searchConcurso}`);
      const json = await res.json();
      return json.concurso;
    },
    enabled: !!searchConcurso,
  });

  return (
    <Layout>
      <section className="gradient-hero text-primary-foreground py-12">
        <div className="container flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Resultados Oficiais</h1>
            <p className="text-white/80">Base de dados sincronizada - 2026</p>
          </div>
          <Button onClick={forceRefresh} variant="outline" className="bg-white text-primary">
            <RefreshCw className={`h-4 w-4 mr-2 ${fetchingLista ? "animate-spin" : ""}`} />
            Sincronizar
          </Button>
        </div>
      </section>

      <div className="container py-8 space-y-8">
        <Card>
          <CardContent className="p-6">
            <form onSubmit={(e) => e.preventDefault()} className="flex gap-4">
              <Input
                type="number"
                placeholder="Número do concurso..."
                value={searchConcurso}
                onChange={(e) => setSearchConcurso(e.target.value)}
              />
              <Button type="submit"><Search className="h-4 w-4 mr-2" /> Buscar</Button>
            </form>
          </CardContent>
        </Card>

        {searchConcurso && (
          <section>
            <h2 className="text-xl font-bold mb-4">Busca: Concurso {searchConcurso}</h2>
            {loadingBusca ? <LoadingList /> : concursoBuscado ? (
              <ConcursoCard 
                concurso={concursoBuscado.concurso} 
                data={concursoBuscado.data} 
                dezenas={concursoBuscado.dezenas} 
              />
            ) : <p className="text-center">Não encontrado.</p>}
          </section>
        )}

        <section>
          <h2 className="text-xl font-bold mb-4">Últimos Resultados</h2>
          {loadingLista ? <LoadingList /> : (
            <>
              <div className="relative space-y-3">
                {fetchingLista && (
                  <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
                    <Loader2 className="animate-spin text-primary" />
                  </div>
                )}
                {concursos.map((c) => (
                  <ConcursoCard 
                    key={c.concurso} 
                    concurso={c.concurso} 
                    data={c.data} // Exibe a string "DD/MM/YYYY" sem transformações
                    dezenas={c.dezenas} 
                    compact 
                  />
                ))}
              </div>

              <div className="flex justify-center items-center gap-4 mt-8">
                <Button variant="outline" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>Anterior</Button>
                <span className="text-sm">Página {currentPage} de {totalPages}</span>
                <Button variant="outline" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}>Próximo</Button>
              </div>
            </>
          )}
        </section>
      </div>
    </Layout>
  );
}
