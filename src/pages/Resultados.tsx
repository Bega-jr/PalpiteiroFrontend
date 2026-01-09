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

  /**
   * FORMATAÇÃO DE DATA À PROVA DE ERROS
   */
  const formatarDataFinal = (dataRaw: any) => {
    if (!dataRaw || typeof dataRaw !== 'string') return "Data não disponível";

    try {
      // 1. Se a data já estiver no formato brasileiro (DD/MM/YYYY), retorna direto
      if (dataRaw.includes('/') && dataRaw.split('/').length === 3) {
        return dataRaw;
      }

      // 2. Limpa a string de possíveis timestamps (T00:00:00 ou espaço)
      const dataApenas = dataRaw.split('T')[0].split(' ')[0];
      
      // 3. Verifica se é o formato ISO (YYYY-MM-DD)
      const partes = dataApenas.split('-');
      if (partes.length === 3) {
        const [ano, mes, dia] = partes;
        // Garante que o ano tenha 4 dígitos para ser válido
        if (ano.length === 4) {
          return `${dia}/${mes}/${ano}`;
        }
      }

      // 4. Se nada funcionar, tenta o Date padrão como último recurso
      const d = new Date(dataRaw);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
      }

      return dataRaw; // Retorna o que veio se não conseguir formatar
    } catch (e) {
      return "Data inválida";
    }
  };

  const forceRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["resultados"] });
    queryClient.invalidateQueries({ queryKey: ["total-concursos"] });
  };

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

  const {
    data: listaData,
    isLoading: loadingLista,
    isError: errorLista,
    isFetching: fetchingLista,
  } = useQuery({
    queryKey: ["resultados", currentPage],
    queryFn: async () => {
      const cacheBuster = Date.now();
      const url = `${BASE_URL}/resultados?page=${currentPage}&limit=${limit}&_cb=${cacheBuster}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Erro ao carregar resultados");
      return res.json();
    },
    placeholderData: (previousData) => previousData,
  });

  const concursos: Concurso[] = listaData?.resultados ?? [];

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
      if (!res.ok) return null;
      const json = await res.json();
      return json.concurso;
    },
    enabled: !!searchConcurso,
    retry: false,
  });

  return (
    <Layout>
      <section className="gradient-hero text-primary-foreground py-12 md:py-16">
        <div className="container flex justify-between items-center">
          <div className="max-w-2xl">
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Resultados Oficiais
            </h1>
            <p className="text-white/80">
              Resultados da Lotofácil (Base 2026).
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
        <Card>
          <CardContent className="p-6">
            <form onSubmit={(e) => e.preventDefault()} className="flex gap-4">
              <Input
                type="number"
                placeholder="Número do concurso..."
                value={searchConcurso}
                onChange={(e) => setSearchConcurso(e.target.value)}
              />
              <Button type="submit" disabled={!searchConcurso || loadingBusca}>
                <Search className="mr-2 h-4 w-4" /> Buscar
              </Button>
            </form>
          </CardContent>
        </Card>

        {searchConcurso && (
          <section>
            <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-lottery-gold" />
              Concurso {searchConcurso}
            </h2>
            {loadingBusca ? (
              <LoadingList />
            ) : concursoBuscado ? (
              <ConcursoCard
                concurso={concursoBuscado.concurso}
                data={formatarDataFinal(concursoBuscado.data)}
                dezenas={concursoBuscado.dezenas}
              />
            ) : (
              <Card><CardContent className="p-6 text-center">Concurso não encontrado</CardContent></Card>
            )}
          </section>
        )}

        <section>
          <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Últimos Resultados
          </h2>

          {loadingLista ? (
            <LoadingList />
          ) : (
            <>
              <div className="relative">
                {fetchingLista && !loadingLista && (
                  <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  </div>
                )}
                <div className="space-y-3">
                  {concursos.map((c) => (
                    <ConcursoCard
                      key={c.concurso}
                      concurso={c.concurso}
                      data={formatarDataFinal(c.data)}
                      dezenas={c.dezenas}
                      compact
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-center items-center gap-4 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || fetchingLista}
                >
                  <ChevronLeft className="h-4 w-4" /> Anterior
                </Button>
                <span className="text-sm text-muted-foreground">
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || fetchingLista}
                >
                  Próximo <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </section>
      </div>
    </Layout>
  );
}

