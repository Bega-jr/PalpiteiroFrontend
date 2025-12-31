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
import { getEstatisticasScore } from "@/lib/api";
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
    queryFn: () => getEstatisticasScore(),
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

  // Ajuste para ler da chave 'dados' conforme seu backend enviou no log
  const stats = estatisticas?.dados || [];
  const ciclo = estatisticas?.ciclo;
  const analise = estatisticas?.analise;

  // Ordenar por score decrescente
  const sortedByScore = [...stats].sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0));
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
              Dados atualizados para 2025 com base nos últimos sorteios.
            </p>
          </div>
        </div>
      </section>

      <div className="container py-8 md:py-12 space-y-8">
        {/* Resumo de Médias */}
        {analise && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-none shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Soma Média
                </div>
                <div className="font-display text-2xl font-bold">
                  {Number(analise.soma_media || 0).toFixed(1)}
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Pares Média
                </div>
                <div className="font-display text-2xl font-bold">
                  {Number(analise.pares_media || 0).toFixed(1)}
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                  <Target className="h-4 w-4 text-primary" />
                  Ímpares Média
                </div>
                <div className="font-display text-2xl font-bold">
                  {Number(analise.impares_media || 0).toFixed(1)}
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                  <Zap className="h-4 w-4 text-primary" />
                  Primos Média
                </div>
                <div className="font-display text-2xl font-bold">
                  {Number(analise.primos_media || 0).toFixed(1)}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Ciclo Atual */}
        {ciclo && ciclo.faltam && ciclo.faltam.length > 0 && (
          <Card className="border-l-4 border-l-amber-500 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-500" />
                Números Faltando no Ciclo
                <Badge variant="secondary" className="ml-2">{ciclo.total_faltam} números</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Dezenas que ainda não foram sorteadas no ciclo atual.
              </p>
              <div className="flex flex-wrap gap-2">
                {ciclo.faltam.map((num: number) => (
                  <LotteryBall key={num} number={num} highlighted size="lg" />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Gráfico de Frequência */}
        <Card className="shadow-sm">
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
                  <XAxis dataKey="numero" tick={{ fontSize: 10 }} interval={0} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} cursor={{fill: 'transparent'}} />
                  <Bar dataKey="frequencia" radius={[4, 4, 0, 0]}>
                    {frequenciaData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.isTop ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.3)"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Atraso */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Atraso dos Números
              <span className="text-sm font-normal text-muted-foreground ml-1">
                (concursos sem sair)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={atrasoData}>
                  <XAxis dataKey="numero" tick={{ fontSize: 10 }} interval={0} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} cursor={{fill: 'transparent'}} />
                  <Bar dataKey="atraso" radius={[4, 4, 0, 0]}>
                    {atrasoData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.isHot ? "#ef4444" : "#3b82f633"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Tabela de Ranking */}
        <Card className="shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/30">
            <CardTitle className="text-sm font-bold uppercase tracking-wider">Ranking por Score Inteligente</CardTitle>
          </CardHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24 text-center font-bold">Bola</TableHead>
                <TableHead className="font-bold">Score</TableHead>
                <TableHead className="text-center font-bold">Atraso</TableHead>
                <TableHead className="text-right pr-6 font-bold">Frequência</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedByScore.map((s) => (
                <TableRow key={s.numero} className="hover:bg-muted/50">
                  <TableCell className="text-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mx-auto ${
                      top10.some(t => t.numero === s.numero) ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground"
                    }`}>
                      {s.numero.toString().padStart(2, "0")}
                    </div>
                  </TableCell>
                  <TableCell className="font-bold font-display">{Number(s.score || 0).toFixed(0)}</TableCell>
                  <TableCell className="text-center tabular-nums">{s.atraso}</TableCell>
                  <TableCell className="text-right pr-6 font-medium tabular-nums">{s.frequencia}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </Layout>
  );
}
