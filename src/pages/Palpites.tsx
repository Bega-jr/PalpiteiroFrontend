import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { PalpiteCard } from "@/components/PalpiteCard";
import { LoadingCard } from "@/components/LoadingStates";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getPalpiteFixo,
  getPalpitesEstatisticos,
} from "@/lib/api";
import { Clover, RefreshCw, Star, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Palpites() {
  const { toast } = useToast();

  const palpiteFixoQuery = useQuery({
    queryKey: ["palpiteFixo"],
    queryFn: getPalpiteFixo,
    staleTime: 1000 * 60 * 5,
  });

  const palpitesEstatisticosQuery = useQuery({
    queryKey: ["palpitesEstatisticos"],
    queryFn: getPalpitesEstatisticos,
    staleTime: 1000 * 60 * 5,
  });

  const handleRefresh = async () => {
    await Promise.all([
      palpiteFixoQuery.refetch(),
      palpitesEstatisticosQuery.refetch(),
    ]);

    toast({
      title: "Palpites atualizados!",
      description: "Novos palpites gerados com sucesso.",
    });
  };

  return (
    <Layout>
      <section className="gradient-hero text-primary-foreground py-12">
        <div className="container max-w-2xl">
          <h1 className="font-display text-3xl font-bold mb-4">
            Palpites Estatísticos
          </h1>
          <p className="text-white/80">
            Palpites baseados em frequência, atraso e score estatístico real.
          </p>
        </div>
      </section>

      <div className="container py-10 space-y-8">
        {/* Botão atualizar */}
        <div className="flex justify-between items-center">
          <div className="flex gap-2 text-sm text-muted-foreground">
            <Info className="h-4 w-4" />
            Atualizar palpites
          </div>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Gerar Novos
          </Button>
        </div>

        {/* Palpite fixo */}
        <section>
          <div className="flex gap-2 items-center mb-4">
            <Star className="h-5 w-5 text-lottery-gold" />
            <h2 className="font-display text-xl font-bold">
              Palpite Fixo do Dia
            </h2>
            <Badge>Destaque</Badge>
          </div>

          {palpiteFixoQuery.isLoading ? (
            <LoadingCard />
          ) : palpiteFixoQuery.data?.palpite ? (
            <PalpiteCard
              numeros={palpiteFixoQuery.data.palpite}
              scoreMedio={palpiteFixoQuery.data.score_medio}
              highlight
            />
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                Nenhum palpite fixo disponível.
              </CardContent>
            </Card>
          )}
        </section>

        {/* Palpites estatísticos */}
        <section>
          <div className="flex gap-2 items-center mb-4">
            <Clover className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-bold">
              Palpites Estatísticos
            </h2>
          </div>

          {palpitesEstatisticosQuery.isLoading ? (
            <div className="grid md:grid-cols-3 gap-4">
              {Array.from({ length: 7 }).map((_, i) => (
                <LoadingCard key={i} />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              {palpitesEstatisticosQuery.data?.palpites?.map(
                (palpite: any, index: number) => (
                  <PalpiteCard
                    key={index}
                    index={index}
                    numeros={palpite.numeros}
                    scoreMedio={palpite.score_medio}
                    metricas={palpite.estatistica.metricas}
                  />
                )
              )}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}
