import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { PalpiteCard } from "@/components/PalpiteCard";
import { LoadingCard } from "@/components/LoadingStates";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import * as apiFunctions from "@/lib/api";
import { RefreshCw, BarChart3, Calculator, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Palpites() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: palpiteFixo,
    isLoading: loadingFixo,
    isFetching: fetchingFixo,
  } = useQuery({
    queryKey: ["palpiteFixo"],
    queryFn: apiFunctions.getPalpiteFixo,
  });

  const {
    data: palpitesEstatisticos,
    isLoading: loadingEstatisticos,
    isFetching: fetchingEstatisticos,
  } = useQuery({
    queryKey: ["palpitesEstatisticos"],
    queryFn: apiFunctions.getPalpitesEstatisticos,
  });

  const isFetchingAny = fetchingFixo || fetchingEstatisticos;

  // Data de referência vinda do backend (pega do primeiro registro disponível)
  const dataReferencia = palpiteFixo?.data_referencia || palpitesEstatisticos?.data_referencia;

  const handleRefresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["palpiteFixo"] }),
      queryClient.invalidateQueries({ queryKey: ["palpitesEstatisticos"] }),
    ]);
    toast({ title: "Dados sincronizados com o servidor!" });
  };

  return (
    <Layout>
      {/* HERO */}
      <section className="gradient-hero text-primary-foreground py-12 md:py-16">
        <div className="container max-w-3xl space-y-4">
          <div className="flex items-center gap-2 text-white/60 text-sm mb-2">
            <Calendar className="h-4 w-4" />
            <span>
              {dataReferencia 
                ? `Análise de hoje: ${format(new Date(dataReferencia), "dd 'de' MMMM", { locale: ptBR })}`
                : "Processando estatísticas..."}
            </span>
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
            Gerador de Palpites
          </h1>
          <p className="text-white/80 text-lg leading-relaxed">
            Palpites inteligentes validados por algoritmos de tendência e scores de frequência.
          </p>
        </div>
      </section>

      <div className="container py-8 md:py-12 space-y-10">
        {/* CONTROLE */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/30 p-4 rounded-2xl border">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            <p className="text-sm text-muted-foreground">
              Algoritmo atualizado com o último concurso.
            </p>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={isFetchingAny}
            variant="outline"
            className="w-full sm:w-auto bg-background"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isFetchingAny ? "animate-spin" : ""}`} />
            Sincronizar Dados
          </Button>
        </div>

        {/* PALPITE FIXO */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="font-display text-2xl font-bold">Ouro do Dia</h2>
              <Badge className="bg-lottery-gold text-white border-none animate-pulse">
                Melhor Score
              </Badge>
            </div>
            {palpiteFixo?.metricas?.score && (
              <span className="text-xs font-medium text-muted-foreground">
                Score: {(palpiteFixo.metricas.score * 100).toFixed(0)}%
              </span>
            )}
          </div>

          {loadingFixo ? (
            <LoadingCard />
          ) : palpiteFixo?.numeros ? (
            <div className="space-y-3">
              <PalpiteCard
                numeros={palpiteFixo.numeros}
                highlight
                showSaveButton
              />
              <div className="flex gap-4 px-2 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                <span className="flex items-center gap-1"><Calculator className="h-3 w-3"/> Soma: {palpiteFixo.metricas?.soma || '--'}</span>
                <span>Pares: {palpiteFixo.metricas?.pares || '--'}</span>
                <span>Ímpares: {palpiteFixo.metricas?.impares || '--'}</span>
              </div>
            </div>
          ) : (
            <Card className="border-dashed bg-muted/10">
              <CardContent className="p-12 text-center text-muted-foreground">
                Aguardando processamento do palpite mestre...
              </CardContent>
            </Card>
          )}
        </section>

        {/* PALPITES ESTATÍSTICOS */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <h2 className="font-display text-2xl font-bold">Sugestões do Sistema</h2>
            <Badge variant="secondary" className="font-mono">
              {palpitesEstatisticos?.palpites?.length || 0}
            </Badge>
          </div>

          {loadingEstatisticos ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => <LoadingCard key={i} />)}
            </div>
          ) : palpitesEstatisticos?.palpites?.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {palpitesEstatisticos.palpites.map((p: any) => (
                <div key={p.indice} className="space-y-2">
                  <PalpiteCard
                    index={p.indice}
                    numeros={p.numeros}
                    showSaveButton
                  />
                  <div className="flex justify-between items-center px-1">
                    <div className="flex gap-2 text-[9px] text-muted-foreground font-bold uppercase">
                      <span>Soma: {p.soma}</span>
                      <span>P: {p.pares} / I: {15 - p.pares}</span>
                    </div>
                    <Badge variant="outline" className="text-[9px] h-4 py-0 leading-none border-primary/20 text-primary">
                      Score: {(p.score * 100).toFixed(0)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="p-12 text-center text-muted-foreground">
                Nenhum palpite estatístico gerado para esta data.
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </Layout>
  );
}

}

