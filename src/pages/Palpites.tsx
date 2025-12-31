import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { PalpiteCard } from "@/components/PalpiteCard";
import { LoadingCard } from "@/components/LoadingStates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getPalpiteFixo, getPalpitesEstatisticos } from "@/lib/api"; // Importação nomeada
import { Clover, RefreshCw, Star, Info } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Palpites() {
  const { toast } = useToast();
  const [refreshKey, setRefreshKey] = useState(0);

  const {
    data: palpiteFixoData, // Renomeado para evitar conflito
    isLoading: loadingFixo,
    refetch: refetchFixo,
  } = useQuery({
    queryKey: ["palpiteFixo", refreshKey],
    queryFn: () => getPalpiteFixo(),
  });

  const {
    data: palpitesEstatisticos,
    isLoading: loadingEstatisticos,
    refetch: refetchEstatisticos,
  } = useQuery({
    queryKey: ["palpitesEstatisticos", refreshKey],
    queryFn: () => getPalpitesEstatisticos(),
  });

  const handleRefresh = async () => {
    setRefreshKey((prev) => prev + 1);
    await Promise.all([refetchFixo(), refetchEstatisticos()]);
    toast({
      title: "Palpites atualizados!",
      description: "Novos palpites foram gerados com sucesso.",
    });
  };

  const handleSave = (numeros: number[]) => {
    toast({
      title: "Login necessário",
      description: "Faça login para salvar seus palpites.",
      variant: "destructive",
    });
  };

  // Extração segura dos dados, lendo a chave correta 'numeros'
  const palpiteFixoNumeros = palpiteFixoData?.numeros || [];
  const palpiteFixoScore = palpiteFixoData?.score_medio || 0;


  return (
    <Layout>
      {/* Header (Padrão visual da imagem) */}
      <section className="gradient-hero text-primary-foreground py-12 md:py-16">
        <div className="container">
          <div className="max-w-2xl">
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Palpites Estatísticos
            </h1>
            <p className="text-white/80">
              Palpites gerados por algoritmo inteligente que analisa frequência,
              atraso e ciclos de cada número. Filtros profissionais garantem
              diversidade e equilíbrio.
            </p>
          </div>
        </div>
      </section>

      <div className="container py-8 md:py-12 space-y-8">
        {/* Refresh Button (Padrão visual da imagem) */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Info className="h-4 w-4" />
            Clique em "Gerar Novos" para atualizar os palpites
          </div>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Gerar Novos Palpites
          </Button>
        </div>

        {/* Palpite Fixo do Dia (Padrão visual da imagem) */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-5 w-5 text-lottery-gold fill-lottery-gold" />
            <h2 className="font-display text-xl font-bold">
              Palpite Fixo do Dia
            </h2>
            <Badge variant="secondary">Destaque</Badge>
          </div>
          {loadingFixo ? (
            // A visualização exata da sua imagem (Aguardando processamento...)
            <Card className="border-dashed">
              <CardContent className="p-6 text-center text-muted-foreground italic">
                Aguardando processamento do palpite fixo...
              </CardContent>
            </Card>
          ) : palpiteFixoNumeros.length > 0 ? (
            // CORRIGIDO: Passando palpiteFixoNumeros em vez de palpiteFixo.palpite
            <PalpiteCard
              numeros={palpiteFixoNumeros} 
              scoreMedio={palpiteFixoScore}
              highlight
              showSaveButton
              onSave={() => handleSave(palpiteFixoNumeros)}
            />
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                Não foi possível carregar o palpite fixo.
              </CardContent>
            </Card>
          )}
        </section>

        {/* Filtros Aplicados */}
        {palpitesEstatisticos?.filtros_aplicados && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Clover className="h-4 w-4 text-primary" />
                Filtros Aplicados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">
                  Soma: {palpitesEstatisticos.filtros_aplicados.soma_range[0]}-
                  {palpitesEstatisticos.filtros_aplicados.soma_range[1]}
                </Badge>
                <Badge variant="outline">
                  Pares: {palpitesEstatisticos.filtros_aplicados.pares_range[0]}-
                  {palpitesEstatisticos.filtros_aplicados.pares_range[1]}
                </Badge>
                <Badge variant="outline">
                  Primos: {palpitesEstatisticos.filtros_aplicados.primos_range[0]}-
                  {palpitesEstatisticos.filtros_aplicados.primos_range[1]}
                </Badge>
                <Badge variant="outline">
                  Moldura: {palpitesEstatisticos.filtros_aplicados.moldura_range[0]}-
                  {palpitesEstatisticos.filtros_aplicados.moldura_range[1]}
                </Badge>
                <Badge variant="outline">
                  Max Repetidos: {palpitesEstatisticos.filtros_aplicados.max_repetidos}
                </Badge>
                <Badge variant="outline">
                  Max Sequência: {palpitesEstatisticos.filtros_aplicados.max_sequencia}
                </Badge>
                <Badge variant="outline">
                  Score Mínimo: {palpitesEstatisticos.filtros_aplicados.score_minimo}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 7 Palpites Estatísticos (Padrão visual da imagem) */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Clover className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-bold">
              7 Palpites Estatísticos
            </h2>
          </div>
          {loadingEstatisticos ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Mantém o visual de carregamento exato da sua imagem */}
              {Array.from({ length: 7 }).map((_, i) => (
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
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                Não foi possível carregar os palpites estatísticos.
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </Layout>
  );
}
