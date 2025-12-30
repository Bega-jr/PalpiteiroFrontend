import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { PalpiteCard } from "@/components/PalpiteCard";
import { LoadingCard } from "@/components/LoadingStates";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clover, RefreshCw, Star, Info } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

/* =========================
   Tipagens
========================= */

interface PalpiteEstatistico {
  numeros: number[];
  estatistica: {
    metricas: {
      soma: number;
      pares: number;
      impares: number;
      primos: number;
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
    queryKey: ["palpite-fixo", refreshKey],
    queryFn: async () => {
      const { data } = await api.get("/palpites/fixo");
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos (cache)
  });

  /* 🔹 Palpites Estatísticos */
  const {
    data: palpitesEstatisticos,
    isLoading: loadingEstatisticos,
    refetch: refetchEstatisticos,
  } = useQuery<RespostaPalpitesEstatisticos>({
    queryKey: ["palpites-estatisticos", refreshKey],
    queryFn: async () => {
      const { data } = await api.get("/palpites/estatisticos");
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const handleRefresh = async () => {
    setRefreshKey((prev) => prev + 1);
    await Promise.all([refetchFixo(), refetchEstatisticos()]);
    toast({
      title: "Palpites atualizados!",
      description: "Novos palpites foram gerados com sucesso.",
    });
  };

  const handleSave = () => {
    toast({
      title: "Login necessário",
      description: "Faça login para salvar seus palpites.",
      variant: "destructive",
    });
  };

  return (
    <Layout>
      {/* Header */}
      <section className="gradient-hero text-primary-foreground py-12">
        <div className="container max-w-2xl">
          <h1 className="text-3xl font-bold mb-4">
            Palpites Estatísticos
          </h1>
          <p className="text-white/80">
            Palpites gerados por algoritmo estatístico da Lotofácil.
          </p>
        </div>
      </section>

      <div className="container py-10 space-y-10">

        {/* Atualizar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Info className="h-4 w-4" />
            Gerar novos palpites
          </div>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
        </div>

        {/* Palpite Fixo */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-5 w-5 text-yellow-400" />
            <h2 className="text-xl font-bold">Palpite Fixo</h2>
            <Badge>Destaque</Badge>
          </div>

          {loadingFixo ? (
            <LoadingCard />
          ) : palpiteFixo?.palpite ? (
            <PalpiteCard
              numeros={palpiteFixo.palpite}
              scoreMedio={palpiteFixo.score_medio}
              highlight
              showSaveButton
              onSave={handleSave}
            />
          ) : (
            <p className="text-muted-foreground">
              Não foi possível carregar o palpite fixo.
            </p>
          )}
        </section>

        {/* Palpites Estatísticos */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Clover className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">
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
                  metricas={palpite.estatistica.metricas}
                  showSaveButton
                  onSave={handleSave}
                />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">
              Nenhum palpite estatístico disponível.
            </p>
          )}
        </section>
      </div>
    </Layout>
  );
}
