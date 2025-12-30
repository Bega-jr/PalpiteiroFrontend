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
   Tipagens Corrigidas
========================= */
// Resposta real do /palpites/fixo
interface RespostaPalpiteFixo {
  numeros: number[];
  score_medio: number;
}

// Resposta real do /palpites/estatisticos
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
  palpites: PalpiteEstatistico[];
}

/* ========================= */
export default function Palpites() {
  const { toast } = useToast();
  const [refreshKey, setRefreshKey] = useState(0);

  /* 🔹 Query: Palpite Fixo */
  const {
    data: palpiteFixo,
    isLoading: loadingFixo,
    refetch: refetchFixo,
  } = useQuery<RespostaPalpiteFixo>({
    queryKey: ["palpite-fixo", refreshKey],
    queryFn: async () => {
      const response = await api.get("/palpites/fixo");
      console.log("DEBUG - Palpite Fixo:", response.data);
      return response.data; // Já vem com { numeros, score_medio }
    },
    staleTime: 0,
  });

  /* 🔹 Query: Palpites Estatísticos */
  const {
    data: palpitesEstatisticos,
    isLoading: loadingEstatisticos,
    refetch: refetchEstatisticos,
  } = useQuery<RespostaPalpitesEstatisticos>({
    queryKey: ["palpites-estatisticos", refreshKey],
    queryFn: async () => {
      const response = await api.get("/palpites/estatisticos");
      console.log("DEBUG - Palpites Estatísticos:", response.data);
      return response.data; // Já vem com { palpites: [...] }
    },
    staleTime: 0,
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
            Palpites gerados por algoritmo estatístico da Lotofácil (Dados atualizados).
          </p>
        </div>
      </section>

      <div className="container py-10 space-y-10">
        {/* Botão Atualizar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Info className="h-4 w-4" />
            Gerar novos palpites agora
          </div>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
        </div>

        {/* SEÇÃO: Palpite Fixo */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-5 w-5 text-yellow-400" />
            <h2 className="text-xl font-bold">Palpite Fixo</h2>
            <Badge variant="default">Destaque</Badge>
          </div>

          {loadingFixo ? (
            <LoadingCard />
          ) : palpiteFixo && palpiteFixo.numeros && palpiteFixo.numeros.length > 0 ? (
            <PalpiteCard
              numeros={palpiteFixo.numeros}
              scoreMedio={palpiteFixo.score_medio}
              highlight
              showSaveButton
              onSave={handleSave}
            />
          ) : (
            <div className="p-6 border rounded-lg bg-muted/20 text-center">
              <p className="text-muted-foreground text-sm">
                Não foi possível carregar o palpite fixo. Tente atualizar.
              </p>
            </div>
          )}
        </section>

        {/* SEÇÃO: Palpites Estatísticos */}
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
          ) : palpitesEstatisticos?.palpites && palpitesEstatisticos.palpites.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {palpitesEstatisticos.palpites.map((palpite, index) => (
                <PalpiteCard
                  key={`palpite-${index}`}
                  index={index + 1}
                  numeros={palpite.numeros}
                  scoreMedio={palpite.score_medio}
                  metricas={palpite.estatistica.metricas}
                  showSaveButton
                  onSave={handleSave}
                />
              ))}
            </div>
          ) : (
            <div className="p-6 border rounded-lg bg-muted/20 text-center">
              <p className="text-muted-foreground text-sm">
                Nenhum palpite estatístico disponível no momento. Tente atualizar.
              </p>
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}
