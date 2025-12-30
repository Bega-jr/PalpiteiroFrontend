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
   Tipagens baseadas no backend REAL (30/12/2025)
========================= */
interface Metrica {
  soma: number;
  pares: number;
  impares: number;
  primos: number;
  // outros como moldura, centro, etc. o PalpiteCard já deve lidar
}

interface Estatistica {
  aprovado: boolean;
  metricas: Metrica;
  // outros campos ignorados
}

interface PalpiteEstatistico {
  numeros: number[];
  estatistica: Estatistica;
  score_medio: number;
}

interface RespostaPalpitesEstatisticos {
  palpites: PalpiteEstatistico[];
}

interface RespostaPalpiteFixo {
  numeros: number[];
  // sem score_medio no fixo
}

/* ========================= */
export default function Palpites() {
  const { toast } = useToast();
  const [refreshKey, setRefreshKey] = useState(0);

  /* 🔹 Palpite Fixo */
  const {
    data: palpiteFixo,
    isLoading: loadingFixo,
    isError: errorFixo,
  } = useQuery<RespostaPalpiteFixo>({
    queryKey: ["palpite-fixo", refreshKey],
    queryFn: async () => {
      const response = await api.get("/palpites/fixo");
      console.log("DEBUG Fixo:", response.data);
      return response.data;
    },
  });

  /* 🔹 Palpites Estatísticos */
  const {
    data: palpitesEstatisticos,
    isLoading: loadingEstatisticos,
    isError: errorEstatisticos,
  } = useQuery<RespostaPalpitesEstatisticos>({
    queryKey: ["palpites-estatisticos", refreshKey],
    queryFn: async () => {
      const response = await api.get("/palpites/estatisticos");
      console.log("DEBUG Estatísticos:", response.data);
      return response.data;
    },
  });

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
    toast({
      title: "Palpites atualizados!",
      description: "Novos palpites carregados com sucesso.",
    });
  };

  const handleSave = () => {
    toast({
      title: "Login necessário",
      description: "Faça login para salvar seus palpites.",
      variant: "destructive",
    });
  };

  const hasError = errorFixo || errorEstatisticos;

  return (
    <Layout>
      <section className="gradient-hero text-primary-foreground py-12">
        <div className="container max-w-2xl">
          <h1 className="text-3xl font-bold mb-4">Palpites Estatísticos</h1>
          <p className="text-white/80">
            Palpites gerados por algoritmo estatístico da Lotofácil.
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

        {/* Erro geral só se realmente houver */}
        {hasError && (
          <div className="p-4 border border-destructive rounded-lg bg-destructive/10 text-center">
            <p className="text-destructive">
              Erro ao carregar palpites. Verifique a conexão e tente atualizar.
            </p>
          </div>
        )}

        {/* Palpite Fixo */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-5 w-5 text-yellow-400" />
            <h2 className="text-xl font-bold">Palpite Fixo</h2>
            <Badge variant="default">Destaque</Badge>
          </div>

          {loadingFixo ? (
            <LoadingCard />
          ) : palpiteFixo?.numeros?.length === 15 ? (
            <PalpiteCard
              numeros={palpiteFixo.numeros}
              scoreMedio={undefined}  // Fixo não tem score
              highlight
              showSaveButton
              onSave={handleSave}
            />
          ) : (
            <div className="p-6 border rounded-lg bg-muted/20 text-center">
              <p className="text-muted-foreground text-sm">
                Palpite fixo indisponível no momento. Tente atualizar.
              </p>
            </div>
          )}
        </section>

        {/* 7 Palpites Estatísticos */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Clover className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">7 Palpites Estatísticos</h2>
          </div>

          {loadingEstatisticos ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 7 }).map((_, i) => (
                <LoadingCard key={i} />
              ))}
            </div>
          ) : palpitesEstatisticos?.palpites?.length === 7 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {palpitesEstatisticos.palpites.map((palpite, index) => (
                <PalpiteCard
                  key={index}
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
                Nenhum palpite estatístico disponível. Tente atualizar.
              </p>
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}
