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
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { TrendingUp, Clock, Zap, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Estatisticas() {
  const { data: response, isLoading, isError } = useQuery({
    queryKey: ["estatisticas"],
    queryFn: () => api.getEstatisticasScore(), // Usa o endpoint com score
    staleTime: 1000 * 60 * 10,
    retry: 2,
  });

  // Extrai a lista de números (suporta wrapped ou array direto)
  const stats = useMemo(() => {
    if (!response) return [];
    if (response.dados && Array.isArray(response.dados)) return response.dados;
    if (Array.isArray(response)) return response;
    return [];
  }, [response]);

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
          isHot: (s.atraso || 0) >= 5,
        }))
        .sort((a, b) => Number(a.numero) - Number(b.numero)),
    [stats]
  );

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
            <AlertTitle>Indisponível</AlertTitle>
            <AlertDescription>
              Não foi possível carregar as estatísticas. Verifique se o CSV foi atualizado e as estatísticas foram recalculadas no Supabase.
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
            Análise baseada em frequência, atraso e score calculado dos números.
          </p>
        </div>
      </section>

      <div className="container py-8 md:py-12 space-y-10">
        {/* Gráfico de Frequência - Responsivo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Frequência dos Números
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ frequencia: { label: "Frequência" } }} className="h-[300px] md:h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={frequenciaData}>
                  <XAxis dataKey="numero" angle={-45} textAnchor="end" height={60} tick={{ fontSize: 11 }} interval={0} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="frequencia" radius={[6, 6, 0, 0]}>
                    {frequenciaData.map((entry, index) => (
                      <Cell
                        key={`freq-${index}`}
                        fill={entry.isTop ? "hsl(var(--primary))" : "hsl(var(--muted-foreground)/0.3)"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Atraso - Responsivo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Atraso Atual (concursos sem sair)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ atraso: { label: "Atraso" } }} className="h-[300px] md:h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={atrasoData}>
                  <XAxis dataKey="numero" angle={-45} textAnchor="end" height={60} tick={{ fontSize: 11 }} interval={0} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="atraso" radius={[6, 6, 0, 0]}>
                    {atrasoData.map((entry, index) => (
                      <Cell
                        key={`atraso-${index}`}
                        fill={entry.isHot ? "hsl(var(--destructive))" : "hsl(var(--muted-foreground)/0.3)"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Tabela Ranking por Score */}
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
                    <TableHead className="w-20 text-center">#</TableHead>
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
                        <Badge variant={stat.atraso >= 5 ? "destructive" : "secondary"}>
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
