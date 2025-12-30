import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { PalpiteCard } from "@/components/PalpiteCard";
import { LoadingCard } from "@/components/LoadingStates";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { Clover, RefreshCw, Star, Info } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

/* =========================
   Tipagens reais da API
========================= */

interface EstatisticaBase {
  numero: number;
  frequencia: number;
  atraso: number;
}

interface RespostaEstatisticasBase {
  status: string;
  dados: EstatisticaBase[];
}

interface PalpiteGerado {
  numeros: number[];
  score_medio: number;
}

/* ========================= */

function gerarPalpites(dados: EstatisticaBase[]): PalpiteGerado[] {
  // ordena por frequência (mais fortes primeiro)
  const ordenados = [...dados].sort(
    (a, b) => b.frequencia - a.frequencia
  );

  const palpites: PalpiteGerado[] = [];

  for (let i = 0; i < 7; i++) {
    const base = ordenados
      .slice(i * 3, i * 3 + 18)
      .sort(() => Math.random() - 0.5)
      .slice(0, 15)
      .map((n) => n.numero)
      .sort((a, b) => a - b);

    palpites.push({
      numeros: base,
      score_medio: Math.floor(
        base.reduce((acc, n) => acc + n, 0) / 15
      ),
    });
  }

  return palpites;
}

export default function Palpites() {
  const { toast } = useToast();
  const [refreshKey, setRefreshKey] = useState(0);

  /* 🔹 Estatísticas Base */
  const {
    data,
    isLoading,
    refetch,
  } = useQuery<RespostaEstatisticasBase>({
    queryKey: ["estatisticasBase", refreshKey],
    queryFn: async () => {
      const { data } = await api.get(
        "https://palpiteiro-backend.vercel.app/estatisticas/base"
      );
      return data;
    },
  });

  const palpitesGerados = data?.dados
    ? gerarPalpites(data.dados)
    : [];

  const handleRefresh = async () => {
    setRefreshKey((prev) => prev + 1);
    await refetch();
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
            Palpites gerados com base em estatísticas reais da Lotofácil.
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

        {/* Palpites */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Clover className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-bold">
              7 Palpites Estatísticos
            </h2>
            <Badge variant="secondary">Base Real</Badge>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 7 }).map((_, i) => (
                <LoadingCard key={i} />
              ))}
            </div>
          ) : palpitesGerados.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {palpitesGerados.map((palpite, index) => (
                <PalpiteCard
                  key={index}
                  index={index}
                  numeros={palpite.numeros}
                  scoreMedio={palpite.score_medio}
                  showSaveButton
                  onSave={() => handleSave(palpite.numeros)}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                Não foi possível gerar os palpites.
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </Layout>
  );
}
