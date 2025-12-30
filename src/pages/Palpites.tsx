import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { PalpiteCard } from "@/components/PalpiteCard";
import { LoadingCard } from "@/components/LoadingStates";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clover, RefreshCw, Star, Info } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

/* =========================
   Tipagens (Interfaces)
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
  status?: string;
  tipo?: string;
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
    error: errorFixo
  } = useQuery<RespostaPalpiteFixo>({
    queryKey: ["palpite-fixo", refreshKey],
    queryFn: async () => {
      // Forçamos a captura da resposta bruta para debug
      const response = await api.get("/palpites/fixo");
      console.log("DEBUG API (Fixo):", response.data);
      return response.data;
    },
    staleTime: 0, // Resetamos para teste para garantir que busque sempre
  });

  /* 🔹 Palpites Estatísticos */
  const {
    data: palpitesEstatisticos,
    isLoading: loadingEstatisticos,
    refetch: refetchEstatisticos,
    error: errorEstatisticos
  } = useQuery<RespostaPalpitesEstatisticos>({
    queryKey: ["palpites-estatisticos", refreshKey],
    queryFn: async () => {
      const response = await api.get("/palpites/estatisticos");
      console.log("DEBUG API (Estatísticos):", response.data);
      return response.data;
    },
    staleTime: 0,
  });

  // Monitor de erros no console
  useEffect(() => {
    if (errorFixo) console.error("Erro na query Fixo:", errorFixo);
    if (errorEstatisticos) console.error("Erro na query Estatísticos:", errorEstatisticos);
  }, [errorFixo, errorEstatisticos]);

  const handleRefresh = async () => {
    setRefreshKey((prev) => prev + 1);
    await Promise.all([refetchFixo(), refetchEstatisticos()]);
    toast({
      title: "Atualizando...",
      description: "Buscando novos dados nos servidores.",
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
      <section className="gradient-hero text-primary-foreground py-12">
        <div className="container max-w-2xl">
          <h1 className="text-3xl font-bold mb-4">Palpites Estatísticos</h1>
          <p className="text-white/80">Palpites gerados por algoritmo estatístico da Lotofácil.</p>
        </div>
      </section>

      <div className="container py-10 space-y-10">
        
        {/* Bloco de Debug (Pode apagar após testar) */}
        <div className="p-4 bg-slate-100 rounded-md border border-slate-300 text-xs font-mono overflow-auto max-h-40">
          <p className="font-bold text-slate-700">DEBUG PANEL:</p>
          <pre>{JSON.stringify({ 
            hasFixo: !!palpiteFixo, 
            hasEstatisticos: !!palpitesEstatisticos?.palpites?.length,
            fixoDataSample: palpiteFixo?.palpite ? "OK" : "VAZIO"
          }, null, 2)}</pre>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Info className="h-4 w-4" />
            Gerar novos palpites para 2025
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
          ) : (palpiteFixo && (palpiteFixo.palpite || (palpiteFixo as any).numeros)) ? (
            <PalpiteCard
              numeros={palpiteFixo.palpite || (palpiteFixo as any).numeros}
              scoreMedio={palpiteFixo.score_medio}
              highlight
              showSaveButton
              onSave={handleSave}
            />
          ) : (
            <div className="p-8 border border-dashed rounded-lg text-center">
              <p className="text-muted-foreground">O palpite fixo não pôde ser carregado ou o formato está incorreto.</p>
            </div>
          )}
        </section>

        {/* Palpites Estatísticos */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Clover className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">7 Palpites Estatísticos</h2>
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
                  onSave={handleSave}
                />
              ))}
            </div>
          ) : (
            <div className="p-8 border border-dashed rounded-lg text-center">
              <p className="text-muted-foreground">Nenhum palpite estatístico disponível no momento.</p>
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}
