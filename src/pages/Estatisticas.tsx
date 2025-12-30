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

export default function Estatisticas() {
  const { data: estatisticas, isLoading } = useQuery({
    queryKey: ["estatisticasScore"],
    queryFn: () => api.getEstatisticasScore(),
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
              Análise completa de frequência, atraso e score de cada número.
            </p>
          </div>
        </section>
        <div className="container py-8">
          <LoadingStats />
        </div>
      </Layout>
    );
  }

  const stats = estatisticas?.estatisticas || [];
  const ciclo = estatisticas?.ciclo;
  const analise = estatisticas?.analise;

  // Ordenar por score decrescente
  const sortedByScore = [...stats].sort((a, b) => b.score - a.score);
  const top10 = sortedByScore.slice(0, 10);

  // Dados para o gráfico de frequência
  const frequenciaData = [...stats]
    .sort((a, b) => a.numero - b.numero)
    .map((s) => ({
      numero: s.numero.toString().padStart(2, "0"),
      frequencia: s.frequencia,
      isTop: top10.some((t) => t.numero === s.numero),
    }));

  // Dados para o gráfico de atraso
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
              Análise completa de frequência, atraso e score de cada número.
              Dados atualizados com base nos últimos sorteios.
            </p>
          </div>
        </div>
      </section>

      <div className="container py-8 md:py-12 space-y-8">
        {/* Resumo */}
        {analise && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                  <TrendingUp className="h-4 w-4" />
                  Soma Média
                </div>
                <div className="font-display text-2xl font-bold">
                  {analise.soma_media.toFixed(1)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                  <BarChart3 className="h-4 w-4" />
                  Pares Média
                </div>
                <div className="font-display text-2xl font-bold">
                  {analise.pares_media.toFixed(1)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                  <Target className="h-4 w-4" />
                  Ímpares Média
                </div>
                <div className="font-display text-2xl font-bold">
                  {analise.impares_media.toFixed(1)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                  <Zap className="h-4 w-4" />
                  Primos Média
                </div>
                <div className="font-display text-2xl font-bold">
                  {analise.primos_media.toFixed(1)}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Ciclo Atual */}
        {ciclo && ciclo.faltam.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-lottery-gold" />
                Números Faltando no Ciclo
                <Badge variant="secondary">{ciclo.total_faltam} números</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Estes números não foram sorteados recentemente e podem ter maior
                probabilidade de sair nos próximos concursos.
              </p>
              <div className="flex flex-wrap gap-2">
                {ciclo.faltam.map((num) => (
                  <LotteryBall key={num} number={num} highlighted size="lg" />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

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
                  <XAxis
                    dataKey="numero"
                    tick={{ fontSize: 10 }}
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="frequencia" radius={[4, 4, 0, 0]}>
                    {frequenciaData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
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
              <span className="text-sm font-normal text-muted-foreground">
                (concursos sem sair)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={atrasoData}>
                  <XAxis
                    dataKey="numero"
                    tick={{ fontSize: 10 }}
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="atraso" radius={[4, 4, 0, 0]}>
                    {atrasoData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
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

        {/* Tabela de Score */}
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
                  <TableHead className="w-16">#</TableHead>
                  <TableHead>Número</TableHead>
                  <TableHead className="text-right">Frequência</TableHead>
                  <TableHead className="text-right">Atraso</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedByScore.map((stat, index) => (
                  <TableRow key={stat.numero}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>
                      <LotteryBall
                        number={stat.numero}
                        size="sm"
                        active={index < 15}
                      />
                    </TableCell>
                    <TableCell className="text-right">{stat.frequencia}</TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={stat.atraso >= 5 ? "destructive" : "secondary"}
                      >
                        {stat.atraso}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold">
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
