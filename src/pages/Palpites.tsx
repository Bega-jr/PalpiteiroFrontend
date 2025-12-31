import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { PalpiteCard } from "@/components/PalpiteCard";
import { LoadingCard } from "@/components/LoadingStates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api"; // Importa suas funções tipadas
import { Clover, RefreshCw, Star, Info } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Palpites() {
  const { toast } = useToast();
  const [refreshKey, setRefreshKey] = useState(0);

  // Busca do Palpite Fixo
  const {
    data: palpiteFixoData,
    isLoading: loadingFixo,
    refetch: refetchFixo,
  } = useQuery({
    queryKey: ["palpiteFixo", refreshKey],
    queryFn: () => api.getPalpiteFixo(),
  });

  // Busca dos Palpites Estatísticos
  const {
    data: palpitesEstatisticos,
    isLoading: loadingEstatisticos,
    refetch: refetchEstatisticos,
  } = useQuery({
    queryKey: ["palpitesEstatisticos", refreshKey],
    queryFn: () => api.getPalpitesEstatisticos(),
  });

  // Extração segura dos números do Palpite Fixo (Ajustado para funcionar com 'numeros' ou 'palpite')
  const numerosFixo = palpiteFixoData?.numeros || palpiteFixoData?.palpite || [];
  const scoreFixo = palpiteFixoData?.score_medio || 0;

  const handleRefresh = async () => {
    setRefreshKey((prev) => prev + 1);
    await Promise.all([refetchFixo(), refetchEstatisticos()]);
    toast({
      title: "Palpites atualizados!",
      description: "Novos palpites foram gerados com base nos dados de 2025.",
    });
  };

  const handleSave = (numeros: number[]) => {
    toast({
      title: "Login necessário",
      description: "Faça login para salvar seus palpites no histórico.",
      variant: "destructive",
    });
  };

  return (
    <Layout>
      <section className="gradient-hero text-primary-foreground py-12 md:py-16">
        <div className="container">
          <div className="max-w-2xl">
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Palpites Estatísticos
            </h1>
            <p className="text-white/80">
              Algoritmo inteligente atualizado para 2025. Analisamos frequência, 
              atraso e ciclos para gerar combinações de alta probabilidade.
            </p>
          </div>
        </div>
      </section>

      <div className="container py-8 md:py-12 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Info className="h-4 w-4" />
            Clique em "Gerar Novos" para recalcular as probabilidades.
          </div>
          <Button onClick={handleRefresh} variant="outline" className="shadow-sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Gerar Novos Palpites
          </Button>
        </div>

        {/* Seção Palpite Fixo - Ajustada para funcionar com 'numeros' */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-5 w-5 text-lottery-gold fill-lottery-gold" />
            <h2 className="font-display text-xl font-bold">Palpite Fixo do Dia</h2>
            <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-200">Destaque</Badge>
          </div>
          {loadingFixo ? (
            <LoadingCard />
          ) : numerosFixo.length > 0 ? (
            <PalpiteCard
              numeros={numerosFixo}
              scoreMedio={scoreFixo}
              highlight
              showSaveButton
              onSave={() => handleSave(numerosFixo)}
            />
          ) : (
            <Card className="border-dashed bg-muted/20">
              <CardContent className="p-6 text-center text-muted-foreground italic">
                Aguardando processamento do palpite fixo...
              </CardContent>
            </Card>
          )}
        </section>

        {/* Filtros Aplicados (Visual Melhorado) */}
        {palpitesEstatisticos?.filtros_aplicados && (
          <Card className="border-none shadow-sm bg-muted/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Clover className="h-4 w-4 text-primary" />
                Configuração do Filtro Inteligente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-white">
                  Soma: {palpitesEstatisticos.filtros_aplicados.soma_range[0]}-
                  {palpitesEstatisticos.filtros_aplicados.soma_range[1]}
                </Badge>
                <Badge variant="outline" className="bg-white">
                  Pares: {palpitesEstatisticos.filtros_aplicados.pares_range[0]}-
                  {palpitesEstatisticos.filtros_aplicados.pares_range[1]}
                </Badge>
                <Badge variant="outline" className="bg-white">
                  Primos: {palpitesEstatisticos.filtros_aplicados.primos_range[0]}-
                  {palpitesEstatisticos.filtros_aplicados.primos_range[1]}
                </Badge>
                <Badge variant="outline" className="bg-white">
                  Moldura: {palpitesEstatisticos.filtros_aplicados.moldura_range[0]}-
                  {palpitesEstatisticos.filtros_aplicados.moldura_range[1]}
                </Badge>
                <Badge variant="outline" className="bg-white">
                  Repetidos: {palpitesEstatisticos.filtros_aplicados.max_repetidos}
                </Badge>
                <Badge variant="outline" className="bg-white">
                  Seq. Máx: {palpitesEstatisticos.filtros_aplicados.max_sequencia}
                </Badge>
                <Badge className="bg-primary/10 text-primary border-primary/20">
                  Score Mín: {palpitesEstatisticos.filtros_aplicados.score_minimo}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Seção 7 Palpites - Mantida lógica que já funcionava */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Clover className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-bold uppercase tracking-tight">
              Sugestões Técnicas (7 Jogos)
            </h2>
          </div>
          {loadingEstatisticos ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <LoadingCard key={i} />)}
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
            <Card className="border-none bg-muted/10">
              <CardContent className="p-10 text-center text-muted-foreground italic">
                Não foi possível processar os palpites estatísticos no momento. Tente atualizar a página.
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </Layout>
  );
}
