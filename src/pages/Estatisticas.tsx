import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { LotteryBall } from "@/components/LotteryBall";
import { LoadingStats } from "@/components/LoadingStates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  Tooltip,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart3, TrendingUp, Clock, Zap, Target, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Estatisticas() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["estatisticasBase"],
    queryFn: () => api.getEstatisticasScore(),
    staleTime: 1000 * 60 * 10,
  });

  const stats = useMemo(() => {
    if (!data) return [];
    if (data.estatisticas && Array.isArray(data.estatisticas)) return data.estatisticas;
    if (Array.isArray(data)) return data;
    if (data.dados && Array.isArray(data.dados)) return data.dados; // fallback extra
    return [];
  }, [data]);

  const analise = data?.analise || null;
  const ciclo = data?.ciclo || { faltam: [], total_faltam: 0 };

  const sortedByScore = useMemo(
    () => [...stats].sort((a: any, b: any) => (b.score || 0) - (a.score || 0)),
    [stats]
  );

  const top10 = sortedByScore.slice(0, 10);

  const frequenciaData = useMemo(
    () =>
      stats
        .map((s: any) => ({
          numero: String(s.numero).padStart(2, "0"),
          frequencia: s.frequencia || 0,
          isTop: top10.some((t: any) => t.numero === s.numero),
        }))
        .sort((a, b) => Number(a.numero) - Number(b.numero)),
    [stats, top10]
  );

  const atrasoData = useMemo(
    () =>
      stats
        .map((s: any) => ({
          numero: String(s.numero).padStart(2, "0"),
          atraso: s.atraso || 0,
          isHot: (s.atraso || 0) >= 8, // mais quente a partir de 8 concursos
          isWarm: (s.atraso || 0) >= 5 && (s.atraso || 0) < 8,
        }))
        .sort((a, b) => Number(a.numero) - Number(b.numero)),
    [stats]
  );

  const chartConfig = {
    frequencia: { label: "Frequência", color: "hsl(var(--primary))" },
    atraso: { label: "Atraso (concursos)", color: "hsl(var(--lottery-blue))" },
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-12">
          <LoadingStats />
        </div>
      </Layout>
    );
  }

  if (isError || stats.length === 0) {
    return (
      <Layout>
        <section className="gradient-hero text-primary-foreground py-12 md:py-16">
          <div className="container text-center">
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Estatísticas da Lotofácil
            </h1>
          </div>
        </section>
        <div className="container py-12">
          <Alert variant="destructive" className="max-w-2xl mx-auto">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle>Indisponível no momento</AlertTitle>
            <AlertDescription>
              Não foi possível carregar as estatísticas. Tente novamente mais tarde ou verifique se o backend está atualizado.
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="gradient-hero text-primary-foreground py-12 md:py-16">
        <div className="container text-center md:text-left">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Estatísticas da Lotofácil
          </h1>
          <p className="text-white/80 max-w-2xl mx-auto md:mx-0">
            Análise completa baseada em frequência, atraso e score inteligente.
            {analise?.data_referencia && (
              <> Última atualização: {new Date(analise.data_referencia).toLocaleDateString("pt-BR")}</>
            )}
          </p>
        </div>
      </section>

      <div className="container py-8 md:py-12 space-y-10">
        {/* Médias Gerais */}
        {analise && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-8 w-8 mx-auto text-primary mb-2 opacity-70" />
                <p className="text-sm text-muted-foreground uppercase">Soma Média</p>
                <p className="text-3xl font-bold">{(analise.soma_media || 0).toFixed(1)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <BarChart3 className="h-8 w-8 mx-auto text-blue-500 mb-2 opacity-70" />
                <p className="text-sm text-muted-foreground uppercase">Pares</p>
                <p className="text-3xl font-bold">{(analise.pares_media || 0).toFixed(1)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Target className="h-8 w-8 mx-auto text-green-500 mb-2 opacity-70" />
                <p className="text-sm text-muted-foreground uppercase">Ímpares</p>
                <p className="text-3xl font-bold">{(analise.impares_media || 0).toFixed(1)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Zap className="h-8 w-8 mx-auto text-yellow-500 mb-2 opacity-70" />
                <p className="text-sm text-muted-foreground uppercase">Primos</p>
                <p className="text-3xl font-bold">{(analise.primos_media || 0).toFixed(1)}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Ciclo Atual */}
        {ciclo.faltam.length > 0 ? (
          <Card className="border-lottery-gold/30 bg-lottery-gold/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Clock className="h-6 w-6 text-lottery-gold" />
                Ciclo Atual — Faltam {ciclo.total_faltam} números
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap justify-center gap-3 pb-6">
              {ciclo.faltam.map((num: number) => (
                <LotteryBall key={num} number={num} highlighted size="lg" />
              ))}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <Clock className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p>Nenhum número em atraso significativo no ciclo atual.</p>
            </CardContent>
          </Card>
        )}

        {/* Gráfico de Frequência */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Frequência Histórica dos Números
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-72 md:h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={frequenciaData}>
                  <XAxis
                    dataKey="numero"
                    tick={{ fontSize: 11 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    interval={0}
                  />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="frequencia" radius={[6, 6, 0, 0]}>
                    {frequenciaData.map((entry, index) => (
                      <Cell
                        key={`cell-freq-${index}`}
                        fill={entry.isTop ? "hsl(var(--primary))" : "hsl(var(--chart-2))"}
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
              <Clock className="h-5 w-5" />
              Atraso Atual (quantos concursos não sai)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-72 md:h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={atrasoData}>
                  <XAxis
                    dataKey="numero"
                    tick={{ fontSize: 11 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    interval={0}
                  />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="atraso" radius={[6, 6, 0, 0]}>
                    {atrasoData.map((entry, index) => (
                      <Cell
                        key={`cell-atraso-${index}`}
                        fill={
                          entry.isHot
                            ? "hsl(var(--destructive))"
                            : entry.isWarm
                            ? "hsl(var(--warning))"
                            : "hsl(var(--chart-3))"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Ranking por Score */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-500" />
              Ranking por Score (mais recomendados)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16 text-center">#</TableHead>
                    <TableHead className="text-center">Número</TableHead>
                    <TableHead className="text-right">Frequência</TableHead>
                    <TableHead className="text-right">Atraso</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedByScore.map((stat: any, index: number) => (
                    <TableRow key={stat.numero} className={index < 10 ? "bg-primary/5" : ""}>
                      <TableCell className="text-center font-bold">{index + 1}</TableCell>
                      <TableCell className="text-center">
                        <LotteryBall number={stat.numero} size="sm" active={index < 10} />
                      </TableCell>
                      <TableCell className="text-right">{stat.frequencia || 0}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={stat.atraso >= 8 ? "destructive" : stat.atraso >= 5 ? "default" : "secondary"}>
                          {stat.atraso || 0}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-primary">
                        {(stat.score || 0).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
