import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { LotteryBall } from "@/components/LotteryBall";
import { LoadingStats } from "@/components/LoadingStates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { api } from "@/lib/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { BarChart3, TrendingUp, Clock, Zap, Target, Award, SearchX } from "lucide-react";

export default function Estatisticas() {
  const { data: rawResponse, isLoading, isError } = useQuery({
    queryKey: ["estatisticasScore"],
    queryFn: async () => {
      const res = await api.getEstatisticasScore();
      // GARANTE QUE ESTAMOS PEGANDO O CONTEÚDO REAL
      // Se 'res' for a resposta do Axios, o conteúdo está em 'res.data'
      return res?.data ?? res;
    },
  });

  const processedData = useMemo(() => {
    // Tenta encontrar a lista de estatísticas em diferentes níveis do objeto
    const statsList = rawResponse?.estatisticas || (Array.isArray(rawResponse) ? rawResponse : []);
    
    if (statsList.length === 0) return null;

    const sorted = [...statsList].sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0));
    const top10Ids = new Set(sorted.slice(0, 10).map(s => s.numero));
    const baseData = [...statsList].sort((a, b) => a.numero - b.numero);

    return {
      stats: statsList,
      sortedByScore: sorted,
      top10Ids,
      frequenciaData: baseData.map(s => ({
        numero: s.numero.toString().padStart(2, "0"),
        frequencia: Number(s.frequencia) || 0,
        isTop: top10Ids.has(s.numero),
      })),
      atrasoData: baseData.map(s => ({
        numero: s.numero.toString().padStart(2, "0"),
        atraso: Number(s.atraso) || 0,
        isHot: Number(s.atraso) >= 5,
      }))
    };
  }, [rawResponse]);

  if (isLoading) return <Layout><LoadingStats /></Layout>;

  // Caso os dados realmente não venham ou a estrutura falhe
  if (!processedData) {
    return (
      <Layout>
        <div className="container py-20 flex flex-col items-center text-center">
          <SearchX className="h-16 w-16 text-muted-foreground mb-4 opacity-20" />
          <h2 className="text-xl font-bold">Dados não localizados</h2>
          <p className="text-muted-foreground max-w-xs mx-auto">
            A API respondeu, mas a lista de estatísticas está vazia ou em formato inesperado.
          </p>
        </div>
      </Layout>
    );
  }

  const { sortedByScore, frequenciaData, atrasoData, top10Ids } = processedData;
  const ciclo = rawResponse?.ciclo || { faltam: [], total_faltam: 0 };
  const analise = rawResponse?.analise || { soma_media: 0, pares_media: 0, impares_media: 0, primos_media: 0 };

  return (
    <Layout>
      <section className="gradient-hero text-primary-foreground py-12 md:py-16">
        <div className="container">
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-4 italic tracking-tighter">Análise Técnica</h1>
          <p className="text-white/80 text-lg">Estatísticas atualizadas para 2025.</p>
        </div>
      </section>

      <div className="container py-8 md:py-12 space-y-8">
        {/* Renderize aqui seus Gráficos e Tabelas usando as variáveis acima */}
        {/* ... (mesma estrutura de Cards do exemplo anterior) */}
      </div>
    </Layout>
  );
}
