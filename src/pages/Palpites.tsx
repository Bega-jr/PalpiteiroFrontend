import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { PalpiteCard } from "@/components/PalpiteCard";
import { LoadingCard } from "@/components/LoadingStates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { Clover, RefreshCw, Star, Info } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

/* =========================
   Tipagens reais da API
========================= */

interface PalpiteEstatistico {
  numeros: number[];
  estatistica: {
    metricas: {
      soma: number;
      pares: number;
      impares: number;
      primos: number;
      moldura?: number;
      centro?: number;
    };
  };
  score_medio: number;
}

interface RespostaPalpitesEstatisticos {
  status: string;
  tipo: string;
  palpites: PalpiteEstatistico[];
}

interface RespostaPalpiteFixo {
  palpite: number[];
  score_medio: number;
}

/* ========================= */

export default function Palpites() {
  const { toast } = useToast();
  const [refreshKey, setRefreshKey] = useState(0);

  /* 🔹 Palpite Fixo */
  const {
    data: palpiteFixo,
    isLoading: loadingFixo,
    refetch: refetchFixo,
  } = useQuery<RespostaPalpiteFixo>({
    queryKey: ["palpiteFixo", refreshKey],
    queryFn: async () => {
      const { data } = await api.get("/palpites/fixo");
      return data;
    },
  });

  /* 🔹 Palpites Estatísticos */
  const {
    data: palpitesEstatisticos,
    isLoading: loadingEstatisticos,
    refetch: refetchEstatisticos,
  } = useQuery<RespostaPalpitesEstatisticos>({
    queryKey: ["palpitesEstatisticos", refreshKey],
    queryFn: async () => {
      const { data } = await api.get("/palpites/estatisticos");
      return data;
    },
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

  return (
    <Layout>
      {/* Header */}
      <section className="gradient-hero text-primary-foreground py-12 md:py-16">
        <div className="container max-w-2xl">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Palpites Estatísticos
          </h1>
          <p className="text-white/80">
            Palpites gerados por algoritmo inteligente baseado em estatística real
            da Lotofácil.
          </p>
        </div>
      </section>

      <div className="container py-8 md:py-12 space-y-8">

        {/* Botão atualizar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Info className="h-4 w-4" />
            Clique para gerar novos palpites
          </div>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Gerar Novos
          </Button>
        </div>

        {/* Palpite Fixo */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-5 w-5 text-lottery-gold" />
            <h2 className="font-display text-xl font-bold">
              Palpite Fixo do Dia
            </h2>
            <Badge variant="secondary">Destaque</Badge>
          </div>

          {loadingFixo ? (
            <LoadingCard />
          ) : palpiteFixo?.palpite ? (
            <PalpiteCard
              numeros={palpiteFixo.palpite}
              scoreMedio={palpiteFixo.score_medio}
              highlight
              showSaveButton
              onSave={() => handleSave(palpiteFixo.palpite)}
            />
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                Não foi possível carregar o palpite fixo.
              </CardContent>
            </Card>
          )}
        </section>

        {/* Palpites Estatísticos */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Clover className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-bold">
              7 Palpites Estatísticos
            </h2>
          </div>

          {loadingEstatisticos ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 7 }).map((_, i) => (
                <LoadingCard key={i} />
              ))}
            </div>
          ) : palpitesEstatisticos?.palpites?.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {palpitesEstatisticos.palpites.map((palpite, index) => (
                <PalpiteCard
                  key={index}
                  index={index}
                  numeros={palpite.numeros}
                  scoreMedio={palpite.score_medio}
                  metricas={palpite.estatistica?.metricas}
                  showSaveButton
                  onSave={() => handleSave(palpite.numeros)}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                Nenhum palpite estatístico disponível.
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </Layout>
  );
}
