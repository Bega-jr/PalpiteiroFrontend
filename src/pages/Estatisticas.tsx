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
import { BarChart3, TrendingUp, Clock, Zap, Target } from "lucide-react";

/* =========================
   Tipagem real da API
========================= */
interface EstatisticaBase {
  numero: number;
  frequencia: number;
  atraso: number;
  score: number;
}

export default function Estatisticas() {
  const { data: resposta, isLoading } = useQuery({
    queryKey: ["estatisticasBase"],
    queryFn: async () => {
      const { data } = await api.get(
        "https://palpiteiro-backend.vercel.app/estatisticas/base"
      );
      return data;
    },
  });

  if (isLoading) {
    return (
      <Layout>
        <section className="gradient-hero text-primary-foreground py-12 md:py-16">
          <div className="container">
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Estatísticas
            </h1>
            <p className="text-white/80">
              Análise completa de frequência e atraso da Lotofácil.
            </p>
          </div>
        </section>
        <div className="container py-8">
          <LoadingStats />
        </div>
      </Layout>
    );
  }

  /* =========================
     Normalização dos dados
  ========================= */
  const rawStats = resposta?.dados || [];

  // Criação de score dinâmico (fallback inteligente)
  const stats: EstatisticaBase[] = rawStats.map((s: any) => ({
    ...s,
    score: s.frequencia / (s.atraso + 1),
  }));

  // Ranking por score
  const sortedByScore = [...stats].sort((a, b) => b.score - a.score);
  const top10 = sortedByScore.slice(0, 10);

  // Dados para gráfico de frequência
  const frequenciaData = [...stats]
    .sort((a, b) => a.numero - b.numero)
    .map((s) => ({
      numero: s.numero.toString().padStart(2, "0"),
      frequencia: s.frequencia,
      isTop: top10.some((t) => t.numero === s.numero),
    }));

  // Dados para gráfico de atraso
  const atrasoData = [...stats]
    .sort((a, b) => a.numero - b.numero)
    .map((s) => ({
      numero: s.numero.toString().padStart(2, "0"),
      atraso: s.atraso,
      isHot: s.atraso >= 5,
    }));

  const chartConfig = {
    frequencia: {
      label: "Frequência",
      color: "hsl(var(--primary))",
    },
    atraso: {
      label: "Atraso",
      color: "hsl(var(--lottery-blue))",
    },
  };

  return (
    <Layout>
      {/* Header */}
      <section className="gradient-hero text-primary-foreground py-12 md:py-16">
        <div className="container">
          <div className="max-w-2xl">
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Estatísticas da Lotofácil
            </h1>
            <p className="text-white/80">
              Frequência, atraso e ranking inteligente baseado nos últimos
              sorteios.
            </p>
          </div>
        </div>
      </section>

      <div className="container py-8 md:py-12 space-y-8">
        {/* Resumo */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                <TrendingUp className="h-4 w-4" />
                Soma Média
              </div>
              <div className="font-display text-2xl font-bold">195.2</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                <BarChart3 className="h-4 w-4" />
                Pares Média
              </div>
              <div className="font-display text-2xl font-bold">7.2</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                <Target className="h-4 w-4" />
                Ímpares Média
              </div>
              <div className="font-display text-2xl font-bold">7.8</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                <Zap className="h-4 w-4" />
                Primos Média
              </div>
              <div className="font-display text-2xl font-bold">5.1</div>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de Frequência */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Frequência dos Números
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={frequenciaData}>
                  <XAxis dataKey="numero" tick={{ fontSize: 10 }} interval={0} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="frequencia" radius={[4, 4, 0, 0]}>
                    {frequenciaData.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={
                          entry.isTop
                            ? "hsl(var(--primary))"
                            : "hsl(var(--muted-foreground) / 0.3)"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Atraso */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-lottery-blue" />
              Atraso dos Números
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={atrasoData}>
                  <XAxis dataKey="numero" tick={{ fontSize: 10 }} interval={0} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="atraso" radius={[4, 4, 0, 0]}>
                    {atrasoData.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={
                          entry.isHot
                            ? "hsl(var(--lottery-gold))"
                            : "hsl(var(--lottery-blue))"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Tabela de Ranking */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-lottery-purple" />
              Ranking por Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Número</TableHead>
                  <TableHead className="text-right">Frequência</TableHead>
                  <TableHead className="text-right">Atraso</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedByScore.map((stat, index) => (
                  <TableRow key={stat.numero}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <LotteryBall number={stat.numero} size="sm" />
                    </TableCell>
                    <TableCell className="text-right">
                      {stat.frequencia}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={stat.atraso >= 5 ? "destructive" : "secondary"}
                      >
                        {stat.atraso}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {stat.score.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

