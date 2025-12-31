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
import { BarChart3, TrendingUp, Clock, Zap, Target, Award } from "lucide-react";

export default function Estatisticas() {
  const { data: estatisticas, isLoading } = useQuery({
    queryKey: ["estatisticasScore"],
    queryFn: () => api.getEstatisticasScore(),
    staleTime: 1000 * 60 * 5, // 5 minutos de cache
  });

  // Processamento de dados memoizado para performance
  const processedData = useMemo(() => {
    if (!estatisticas?.estatisticas) return { stats: [], sortedByScore: [], frequenciaData: [], atrasoData: [] };

    const stats = estatisticas.estatisticas;
    const sorted = [...stats].sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0));
    const top10Ids = new Set(sorted.slice(0, 10).map(s => s.numero));

    const baseData = [...stats].sort((a, b) => a.numero - b.numero);

    const freq = baseData.map((s) => ({
      numero: s.numero.toString().padStart(2, "0"),
      frequencia: Number(s.frequencia) || 0,
      isTop: top10Ids.has(s.numero),
    }));

    const atr = baseData.map((s) => ({
      numero: s.numero.toString().padStart(2, "0"),
      atraso: Number(s.atraso) || 0,
      isHot: Number(s.atraso) >= 5,
    }));

    return { stats, sortedByScore: sorted, frequenciaData: freq, atrasoData: atr, top10Ids };
  }, [estatisticas]);

  const chartConfig = {
    frequencia: { label: "Frequência", color: "hsl(var(--primary))" },
    atraso: { label: "Atraso", color: "hsl(var(--lottery-blue))" },
  };

  if (isLoading) {
    return (
      <Layout>
        <section className="gradient-hero text-primary-foreground py-12 md:py-16">
          <div className="container">
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">Estatísticas</h1>
            <p className="text-white/80">Carregando análise técnica atualizada...</p>
          </div>
        </section>
        <div className="container py-8">
          <LoadingStats />
        </div>
      </Layout>
    );
  }

  const { sortedByScore, frequenciaData, atrasoData, top10Ids } = processedData;
  const ciclo = estatisticas?.ciclo || { faltam: [], total_faltam: 0 };
  const analise = estatisticas?.analise || { soma_media: 0, pares_media: 0, impares_media: 0, primos_media: 0 };

  return (
    <Layout>
      {/* Header Estilizado */}
      <section className="gradient-hero text-primary-foreground py-12 md:py-16 relative overflow-hidden">
        <div className="container relative z-10">
          <div className="max-w-2xl">
            <Badge className="mb-4 bg-white/20 border-none text-white backdrop-blur-sm">Dados Oficiais 2025</Badge>
            <h1 className="font-display text-3xl md:text-5xl font-bold mb-4 italic tracking-tighter">
              Estatísticas Inteligentes
            </h1>
            <p className="text-white/80 text-lg">
              Análise completa baseada em frequência, atraso e score estatístico dos últimos concursos.
            </p>
          </div>
        </div>
      </section>

      <div className="container py-8 md:py-12 space-y-8">
        
        {/* Painel de Médias Rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Soma Média", val: analise.soma_media, icon: TrendingUp },
            { label: "Pares Média", val: analise.pares_media, icon: BarChart3 },
            { label: "Ímpares Média", val: analise.impares_media, icon: Target },
            { label: "Primos Média", val: analise.primos_media, icon: Zap },
          ].map((item, i) => (
            <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2 uppercase font-bold tracking-wider">
                  <item.icon className="h-4 w-4 text-primary" /> {item.label}
                </div>
                <div className="font-display text-3xl font-black">
                  {Number(item.val || 0).toFixed(1)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Ciclo Atual */}
        {ciclo.faltam?.length > 0 && (
          <Card className="border-none shadow-lg border-l-4 border-l-amber-500 bg-amber-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-900 font-bold">
                <Clock className="h-5 w-5 text-amber-600" />
                Fechamento de Ciclo
                <Badge className="bg-amber-600 ml-auto">{ciclo.total_faltam} restantes</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-amber-800/80 mb-4 font-medium">
                Dezenas que ainda não saíram no ciclo atual. Tendência de alta para os próximos sorteios.
              </p>
              <div className="flex flex-wrap gap-3">
                {ciclo.faltam.map((num: number) => (
                  <LotteryBall key={num} number={num} highlighted size="lg" />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Grade de Gráficos (Frequência e Atraso) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Gráfico de Frequência */}
          <Card className="border-none shadow-md overflow-hidden">
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" /> Frequência Histórica
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ChartContainer config={chartConfig} className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={frequenciaData}>
                    <XAxis dataKey="numero" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="frequencia" radius={[4, 4, 0, 0]}>
                      {frequenciaData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.isTop ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.2)"} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Gráfico de Atraso */}
          <Card className="border-none shadow-md overflow-hidden">
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" /> Atraso (Concursos sem sair)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ChartContainer config={chartConfig} className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={atrasoData}>
                    <XAxis dataKey="numero" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <ChartTooltip content={<ChartTooltipContent />} />
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
        </div>

        {/* Tabela de Ranking Score */}
        <Card className="border-none shadow-md overflow-hidden">
          <CardHeader className="bg-muted/30 border-b">
            <CardTitle className="flex items-center gap-2 text-md font-bold">
              <Award className="h-5 w-5 text-amber-500" /> Ranking por Score Estatístico
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-24 text-center">Bola</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead className="text-center">Atraso</TableHead>
                  <TableHead className="text-right pr-8">Frequência</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedByScore.map((s, idx) => (
                  <TableRow key={s.numero} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="text-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mx-auto ${
                        top10Ids.has(s.numero) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}>
                        {s.numero.toString().padStart(2, "0")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{Number(s.score || 0).toFixed(0)}</span>
                        {idx < 5 && <Badge className="bg-emerald-500 hover:bg-emerald-600 text-[9px] h-4">TOP</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-center tabular-nums text-muted-foreground">{s.atraso}</TableCell>
                    <TableCell className="text-right pr-8 font-medium">{s.frequencia}</TableCell>
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
