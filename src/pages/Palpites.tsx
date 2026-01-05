import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { PalpiteCard } from "@/components/PalpiteCard";
import { LoadingCard } from "@/components/LoadingStates";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import * as apiFunctions from "@/lib/api";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

  const handleRefresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["palpiteFixo"] }),
      queryClient.invalidateQueries({ queryKey: ["palpitesEstatisticos"] }),
    ]);

    toast({ title: "Novos palpites gerados com sucesso!" });
  };

  const handleSave = (numeros: number[]) => {
    console.log("Salvar palpite:", numeros);
  };

  return (
    <Layout>
      {/* HERO */}
      <section className="gradient-hero text-primary-foreground py-12 md:py-16">
        <div className="container max-w-3xl space-y-4">
          <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
            Gerador de Palpites
          </h1>
          <p className="text-white/80 text-lg leading-relaxed">
            Palpites estatísticos gerados a partir de dados históricos da Lotofácil.
          </p>
        </div>
      </section>

      <div className="container py-8 md:py-12 space-y-10">

        {/* CONTROLE */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/30 p-4 rounded-2xl border">
          <p className="text-sm text-muted-foreground">
            Clique para gerar novas combinações.
          </p>
          <Button
            onClick={handleRefresh}
            disabled={isFetchingAny}
            className="gradient-accent shadow-glow w-full sm:w-auto"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isFetchingAny ? "animate-spin" : ""}`}
            />
            {isFetchingAny ? "Gerando..." : "Atualizar Palpites"}
          </Button>
        </div>

        {/* PALPITE FIXO */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="font-display text-2xl font-bold">Ouro do Dia</h2>
            <Badge className="bg-lottery-gold text-white border-none">
              Sugestão Especial
            </Badge>
          </div>

          {loadingFixo ? (
            <LoadingCard />
          ) : palpiteFixo?.numeros ? (
            <PalpiteCard
              numeros={palpiteFixo.numeros}
              highlight
              showSaveButton
              onSave={() => handleSave(palpiteFixo.numeros)}
            />
          ) : (
            <Card className="border-dashed">
              <CardContent className="p-12 text-center text-muted-foreground">
                Palpite fixo indisponível no momento.
              </CardContent>
            </Card>
          )}
        </section>

        {/* PALPITES ESTATÍSTICOS */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <h2 className="font-display text-2xl font-bold">
              Palpites do Sistema
            </h2>
            <span className="text-xs text-muted-foreground">
              {palpitesEstatisticos?.palpites?.length || 0} combinações
            </span>
          </div>

          {loadingEstatisticos ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <LoadingCard key={i} />
              ))}
            </div>
          ) : palpitesEstatisticos?.palpites?.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {palpitesEstatisticos.palpites.map((p: any, index: number) => (
                <PalpiteCard
                  key={index}
                  index={index}
                  numeros={p.numeros}
                  showSaveButton
                  onSave={() => handleSave(p.numeros)}
                />
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="p-12 text-center text-muted-foreground">
                Nenhum palpite disponível no momento.
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </Layout>
  );
}

