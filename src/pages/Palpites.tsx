import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { PalpiteCard } from "@/components/PalpiteCard";
import { LoadingCard } from "@/components/LoadingStates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import * as apiFunctions from "@/lib/api"; // Importando todas as funções
import { Clover, RefreshCw, Star, Info, Target, Calculator } from "lucide-react";
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
    queryFn: apiFunctions.getPalpiteFixo,
    staleTime: 0, // Palpites devem ser novos ao dar refresh
  });

  // Busca dos 7 Palpites Gerados por Algoritmo
  const {
    data: palpitesEstatisticos,
    isLoading: loadingEstatisticos,
    refetch: refetchEstatisticos,
  } = useQuery({
    queryKey: ["palpitesEstatisticos", refreshKey],
    queryFn: apiFunctions.getPalpitesEstatisticos,
    staleTime: 0,
  });

  const handleRefresh = async () => {
    setRefreshKey((prev) => prev + 1);
    await Promise.all([refetchFixo(), refetchEstatisticos()]);
    toast({
      title: "Algoritmo Atualizado",
      description: "Novas combinações geradas com base nas últimas estatísticas.",
    });
  };

  const handleSave = (numeros: number[]) => {
    // Integração futura com o histórico
    toast({
      title: "Palpite Identificado",
      description: "Em breve você poderá salvar palpites diretamente na sua conta.",
    });
  };

  return (
    <Layout>
      {/* Hero Header - Mantendo o padrão visual da Home */}
      <section className="gradient-hero text-primary-foreground py-12 md:py-16">
        <div className="container">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 text-xs border border-white/10">
              <Calculator className="h-3 w-3" />
              Algoritmo V3.0 Ativo 2025
            </div>
            <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
              Gerador de <span className="text-primary">Palpites</span>
            </h1>
            <p className="text-white/80 text-lg leading-relaxed">
              Combinações geradas por análise de paridade, soma, moldura e ciclos de atraso. 
              Filtros profissionais aplicados automaticamente para maior equilíbrio.
            </p>
          </div>
        </div>
      </section>

      <div className="container py-8 md:py-12 space-y-8">
        {/* Painel de Controle */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/30 p-4 rounded-2xl border">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Info className="h-4 w-4 text-primary" />
            </div>
            <p>Os palpites são atualizados após cada sorteio oficial.</p>
          </div>
          <Button onClick={handleRefresh} className="gradient-accent shadow-glow w-full sm:w-auto">
            <RefreshCw className={`mr-2 h-4 w-4 ${loadingEstatisticos ? 'animate-spin' : ''}`} />
            Gerar Novas Combinações
          </Button>
        </div>

        {/* Palpite Fixo (VIP) */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-lottery-gold/10 p-2 rounded-lg">
              <Star className="h-5 w-5 text-lottery-gold fill-lottery-gold" />
            </div>
            <h2 className="font-display text-2xl font-bold">Ouro do Dia</h2>
            <Badge className="bg-lottery-gold text-white border-none">Sugestão VIP</Badge>
          </div>
          
          {loadingFixo ? (
            <LoadingCard />
          ) : palpiteFixo ? (
            <PalpiteCard
              numeros={palpiteFixo.palpite || palpiteFixo.numeros}
              scoreMedio={palpiteFixo.score_medio}
              highlight
              showSaveButton
              onSave={() => handleSave(palpiteFixo.palpite || palpiteFixo.numeros)}
            />
          ) : (
            <Card className="border-dashed">
              <CardContent className="p-12 text-center text-muted-foreground">
                Aguardando sinal do algoritmo para gerar o palpite fixo...
              </CardContent>
            </Card>
          )}
        </section>

        {/* Resumo Técnico dos Filtros */}
        {palpitesEstatisticos?.filtros_aplicados && (
          <Card className="bg-slate-900 text-white border-none shadow-xl overflow-hidden">
            <div className="bg-white/5 px-6 py-3 border-b border-white/10 flex items-center justify-between">
              <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 text-primary">
                <Target className="h-4 w-4" /> Configuração da IA
              </CardTitle>
              <Badge variant="outline" className="border-primary/50 text-primary text-[10px]">PROFISSIONAL</Badge>
            </div>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-3">
                {[
                  { label: "Soma", val: `${palpitesEstatisticos.filtros_aplicados.soma_range[0]}-${palpitesEstatisticos.filtros_aplicados.soma_range[1]}` },
                  { label: "Pares", val: `${palpitesEstatisticos.filtros_aplicados.pares_range[0]}-${palpitesEstatisticos.filtros_aplicados.pares_range[1]}` },
                  { label: "Primos", val: `${palpitesEstatisticos.filtros_aplicados.primos_range[0]}-${palpitesEstatisticos.filtros_aplicados.primos_range[1]}` },
                  { label: "Moldura", val: `${palpitesEstatisticos.filtros_aplicados.moldura_range[0]}-${palpitesEstatisticos.filtros_aplicados.moldura_range[1]}` },
                  { label: "Score Mín", val: palpitesEstatisticos.filtros_aplicados.score_minimo },
                ].map((tag, i) => (
                  <div key={i} className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/5">
                    <span className="text-[10px] block text-slate-400 font-bold uppercase">{tag.label}</span>
                    <span className="text-sm font-mono font-bold text-primary">{tag.val}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Grid de Palpites Estatísticos */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Clover className="h-5 w-5 text-primary" />
            </div>
            <h2 className="font-display text-2xl font-bold">Palpites do Sistema</h2>
            <span className="text-xs text-muted-foreground font-medium">7 variações estatísticas</span>
          </div>

          {loadingEstatisticos ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <LoadingCard key={i} />
              ))}
            </div>
          ) : palpitesEstatisticos?.palpites ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {palpitesEstatisticos.palpites.map((palpite: any, index: number) => (
                <PalpiteCard
                  key={index}
                  index={index}
                  numeros={palpite.numeros}
                  scoreMedio={palpite.score_medio}
                  metricas={palpite.metricas}
                  showSaveButton
                  onSave={() => handleSave(palpite.numeros)}
                />
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="p-12 text-center text-muted-foreground">
                Não foi possível estabelecer conexão para gerar as combinações.
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </Layout>
  );
}
