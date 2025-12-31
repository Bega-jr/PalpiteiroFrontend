import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { PalpiteCard } from "@/components/PalpiteCard";
import { LoadingCard } from "@/components/LoadingStates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getPalpiteFixo, getPalpitesEstatisticos } from "@/lib/api";
import { Clover, RefreshCw, Star, Info, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Palpites() {
  const { toast } = useToast();
  const [refreshKey, setRefreshKey] = useState(0);

  // Busca do Palpite Fixo (Destaque do Dia)
  const {
    data: palpiteFixo,
    isLoading: loadingFixo,
    refetch: refetchFixo,
  } = useQuery({
    queryKey: ["palpiteFixo", refreshKey],
    queryFn: getPalpiteFixo,
  });

  // Busca dos 7 Palpites Estatísticos com Filtros
  const {
    data: palpitesEstatisticos,
    isLoading: loadingEstatisticos,
    refetch: refetchEstatisticos,
  } = useQuery({
    queryKey: ["palpitesEstatisticos", refreshKey],
    queryFn: getPalpitesEstatisticos,
  });

  const handleRefresh = async () => {
    setRefreshKey((prev) => prev + 1);
    await Promise.all([refetchFixo(), refetchEstatisticos()]);
    toast({
      title: "Algoritmo Atualizado",
      description: "Novas combinações geradas com base nos últimos sorteios.",
    });
  };

  const handleSave = (numeros: number[]) => {
    toast({
      title: "Login necessário",
      description: "Acesse sua conta para salvar e monitorar seus palpites.",
      variant: "destructive",
    });
  };

  return (
    <Layout>
      {/* Header Premium com Estilo 2025 */}
      <section className="gradient-hero text-primary-foreground py-12 md:py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="container relative z-10">
          <div className="max-w-3xl">
            <Badge className="mb-4 bg-white/20 border-none text-white backdrop-blur-md">
              <Sparkles className="h-3 w-3 mr-1" /> Inteligência Artificial 2025
            </Badge>
            <h1 className="font-display text-4xl md:text-6xl font-black mb-4 tracking-tighter uppercase italic">
              Gerador de <span className="text-amber-400">Palpites</span>
            </h1>
            <p className="text-white/80 text-lg md:text-xl max-w-xl border-l-2 border-amber-400 pl-4">
              Combinações geradas por algoritmos que filtram tendências, 
              equilíbrio de pares/ímpares e score estatístico avançado.
            </p>
          </div>
        </div>
      </section>

      <div className="container py-8 md:py-12 space-y-10">
        
        {/* Barra de Ações Rápidas */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-muted/30 p-4 rounded-2xl border border-muted">
          <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium">
            <div className="p-2 bg-primary/10 rounded-full">
              <Info className="h-4 w-4 text-primary" />
            </div>
            Os palpites expiram a cada novo sorteio oficial.
          </div>
          <Button 
            onClick={handleRefresh} 
            className="rounded-full shadow-lg hover:scale-105 transition-transform font-bold"
            size="lg"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Gerar Novos Palpites
          </Button>
        </div>

        {/* Seção: Palpite Fixo (Ouro) */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500 rounded-lg shadow-amber-200 shadow-lg">
              <Star className="h-5 w-5 text-white fill-white" />
            </div>
            <h2 className="font-display text-2xl font-black tracking-tight uppercase">
              Palpite Fixo do Dia
            </h2>
          </div>

          {loadingFixo ? (
            <LoadingCard />
          ) : palpiteFixo?.palpite ? (
            <div className="group transition-all hover:scale-[1.01]">
              <PalpiteCard
                numeros={palpiteFixo.palpite}
                scoreMedio={palpiteFixo.score_medio}
                highlight
                showSaveButton
                onSave={() => handleSave(palpiteFixo.palpite)}
              />
            </div>
          ) : (
            <Card className="border-dashed bg-muted/20">
              <CardContent className="p-10 text-center text-muted-foreground font-medium">
                Nenhum palpite fixo disponível para este concurso.
              </CardContent>
            </Card>
          )}
        </section>

        {/* Seção: Filtros Aplicados (Resumo Técnico) */}
        {palpitesEstatisticos?.filtros_aplicados && (
          <Card className="border-none shadow-md bg-gradient-to-r from-muted/50 to-transparent">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-black flex items-center gap-2 uppercase tracking-widest text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                Configuração do Algoritmo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Soma", val: palpitesEstatisticos.filtros_aplicados.soma_range },
                  { label: "Pares", val: palpitesEstatisticos.filtros_aplicados.pares_range },
                  { label: "Primos", val: palpitesEstatisticos.filtros_aplicados.primos_range },
                  { label: "Moldura", val: palpitesEstatisticos.filtros_aplicados.moldura_range }
                ].map((f, i) => (
                  <Badge key={i} variant="secondary" className="px-3 py-1 bg-white shadow-sm border-none font-bold">
                    {f.label}: {f.val?.[0]}-{f.val?.[1]}
                  </Badge>
                ))}
                <Badge variant="outline" className="font-bold border-primary/20 bg-primary/5">
                  Score Min: {palpitesEstatisticos.filtros_aplicados.score_minimo}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Seção: Lista de Palpites Estatísticos */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary rounded-lg shadow-primary/20 shadow-lg">
                <Clover className="h-5 w-5 text-white" />
              </div>
              <h2 className="font-display text-2xl font-black tracking-tight uppercase text-primary">
                Sugestões Estatísticas
              </h2>
            </div>
            <Badge variant="outline" className="font-black opacity-60 italic">TOP 7 COMBINAÇÕES</Badge>
          </div>

          {loadingEstatisticos ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <LoadingCard key={i} />
              ))}
            </div>
          ) : palpitesEstatisticos?.palpites ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {palpitesEstatisticos.palpites.map((palpite: any, index: number) => (
                <div key={index} className="hover:translate-y-[-4px] transition-transform duration-300">
                  <PalpiteCard
                    index={index}
                    numeros={palpite.numeros}
                    scoreMedio={palpite.score_medio}
                    metricas={palpite.metricas}
                    showSaveButton
                    onSave={() => handleSave(palpite.numeros)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <Card className="border-none bg-muted/10">
              <CardContent className="p-12 text-center text-muted-foreground italic">
                Não foi possível processar os palpites estatísticos agora.
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </Layout>
  );
}
