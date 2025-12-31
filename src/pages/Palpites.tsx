import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { PalpiteCard } from "@/components/PalpiteCard";
import { LoadingCard } from "@/components/LoadingStates";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clover, RefreshCw, Star, Info } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { getPalpiteFixo, getPalpitesEstatisticos } from "@/lib/api";

export default function Palpites() {
  const { toast } = useToast();
  const [refreshKey, setRefreshKey] = useState(0);

  // Palpite Fixo
  const {
    data: palpiteFixoData,
    isLoading: loadingFixo,
    error: errorFixo,
  } = useQuery({
    queryKey: ["palpite-fixo", refreshKey],
    queryFn: getPalpiteFixo,
    refetchOnWindowFocus: false, // Não recarrega ao voltar para a página
    staleTime: 1000 * 60 * 15, // Cache de 15 minutos
  });

  const numerosFixo = palpiteFixoData?.numeros || [];

  // Palpites Estatísticos
  const {
    data: palpitesData,
    isLoading: loadingEstatisticos,
    error: errorEstatisticos,
  } = useQuery({
    queryKey: ["palpites-estatisticos", refreshKey],
    queryFn: getPalpitesEstatisticos,
    refetchOnWindowFocus: false, // Não recarrega ao voltar para a página
    staleTime: 1000 * 60 * 15, // Cache de 15 minutos
  });

  const palpites = palpitesData?.palpites || [];

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
    toast({
      title: "Palpites atualizados!",
      description: "Novos palpites gerados com sucesso para o sorteio de hoje.",
    });
  };

  const handleSave = () => {
    toast({
      title: "Login necessário",
      description: "Faça login para salvar seus palpites favoritos.",
      variant: "destructive",
    });
  };

  return (
    <Layout>
      <section className="gradient-hero text-primary-foreground py-12">
        <div className="container max-w-2xl">
          <h1 className="text-3xl font-bold mb-4">Palpites Estatísticos</h1>
          <p className="text-white/80">
            Palpites gerados por algoritmo inteligente com base em estatísticas reais da Lotofácil. Atualizado para o concurso de hoje.
          </p>
        </div>
      </section>

      <div className="container py-10 space-y-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Info className="h-4 w-4" />
            Clique em atualizar para gerar novos palpites
          </div>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Atualizar Palpites
          </Button>
        </div>

        {/* Palpite Fixo */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-5 w-5 text-yellow-400" />
            <h2 className="text-xl font-bold">Palpite Fixo do Dia</h2>
            <Badge variant="default">Destaque</Badge>
          </div>

          {loadingFixo ? (
            <LoadingCard />
          ) : errorFixo ? (
            <div className="p-6 border rounded-lg bg-destructive/10 text-center">
              <p className="text-destructive text-sm">
                Erro ao carregar o palpite fixo. Tente atualizar.
              </p>
            </div>
          ) : numerosFixo.length === 15 ? (
            <PalpiteCard
              numeros={numerosFixo}
              scoreMedio={undefined}
              highlight
              showSaveButton
              onSave={handleSave}
            />
          ) : (
            <div className="p-6 border rounded-lg bg-muted/20 text-center">
              <p className="text-muted-foreground text-sm">
                Palpite fixo indisponível no momento.
              </p>
            </div>
          )}
        </section>

        {/* Palpites Estatísticos */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Clover className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Palpites Estatísticos</h2>
            <Badge variant="secondary">{palpites.length} palpites gerados</Badge>
          </div>

          {loadingEstatisticos ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <LoadingCard key={i} />
              ))}
            </div>
          ) : errorEstatisticos ? (
            <div className="p-6 border rounded-lg bg-destructive/10 text-center">
              <p className="text-destructive">
                Erro ao carregar palpites estatísticos. Verifique sua conexão e tente atualizar.
              </p>
            </div>
          ) : palpites.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {palpites.map((palpite: any, index: number) => (
                <PalpiteCard
                  key={index}
                  index={index + 1}
                  numeros={palpite.numeros || []}
                  scoreMedio={palpite.score_medio}
                  metricas={palpite.estatistica?.metricas}
                  showSaveButton
                  onSave={handleSave}
                />
              ))}
            </div>
          ) : (
            <div className="p-6 border rounded-lg bg-muted/20 text-center">
              <p className="text-muted-foreground text-sm">
                Nenhum palpite estatístico disponível no momento. Clique em atualizar para gerar novos.
              </p>
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}
