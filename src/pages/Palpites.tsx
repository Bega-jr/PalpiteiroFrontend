import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { PalpiteCard } from "@/components/PalpiteCard";
import { LoadingCard } from "@/components/LoadingStates";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Palpites() {
  const { toast } = useToast();
  const [refreshKey, setRefreshKey] = useState(0);

  /* PALPITE FIXO */
  const {
    data: palpiteFixo,
    isLoading: loadingFixo,
    refetch: refetchFixo,
  } = useQuery(["palpiteFixo", refreshKey], () => api.getPalpiteFixo());

  /* PALPITES ESTATÍSTICOS */
  const {
    data: estatisticos,
    isLoading: loadingEstatisticos,
    refetch: refetchEstatisticos,
  } = useQuery(["estatisticos", refreshKey], () =>
    api.getPalpitesEstatisticos()
  );

  /* HISTÓRICO (JÁ SALVOS) */
  const {
    data: historico,
    isLoading: loadingHistorico,
    refetch: refetchHistorico,
  } = useQuery(["historico"], () => api.getHistorico());

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
    refetchFixo();
    refetchEstatisticos();
  };

  const handleSave = async (nums: number[]) => {
    try {
      await api.postSalvarPalpite(nums);
      toast({
        title: "Salvo!",
        description: "Palpite salvo com sucesso.",
      });
      refetchHistorico();
    } catch {
      toast({
        title: "Erro",
        description: "Não foi possível salvar.",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      {/* Palpite Fixo */}
      {loadingFixo ? (
        <LoadingCard />
      ) : palpiteFixo ? (
        <PalpiteCard
          numeros={palpiteFixo.palpite}
          scoreMedio={palpiteFixo.score_medio}
          highlight
          showSaveButton
          onSave={() => handleSave(palpiteFixo.palpite)}
        />
      ) : null}

      {/* Palpites Estatísticos */}
      {loadingEstatisticos ? (
        <LoadingCard />
      ) : estatisticos?.palpites ? (
        estatisticos.palpites.map((p, i) => (
          <PalpiteCard
            key={i}
            numeros={p.numeros}
            scoreMedio={p.score_medio}
            metricas={p.estatistica.metricas}
            showSaveButton
            onSave={() => handleSave(p.numeros)}
          />
        ))
      ) : null}

      {/* Histórico de Palpites Salvos */}
      {loadingHistorico ? (
        <p>Carregando histórico...</p>
      ) : historico?.historico ? (
        historico.historico.map((h: any) => (
          <PalpiteCard
            key={h.id}
            numeros={h.numeros}
            metricas={{
              soma: 0,
              pares: 0,
              impares: 0,
              primos: 0,
            }}
          />
        ))
      ) : null}
    </Layout>
  );
}
