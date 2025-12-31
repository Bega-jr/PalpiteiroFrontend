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
import { getEstatisticasScore } from "@/lib/api"; // Importação da função específica
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { BarChart3, TrendingUp, Clock, Zap, Target, Award, AlertCircle } from "lucide-react";

export default function Estatisticas() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["estatisticasScore"],
    queryFn: getEstatisticasScore,
    staleTime: 1000 * 60 * 10, // Cache de 10 minutos
  });

  // Processamento inteligente dos dados
  const processed = useMemo(() => {
    const statsList = data?.estatisticas || [];
    if (!Array.isArray(statsList) || statsList.length === 0) return null;

    const sorted = [...statsList].sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0));
    const top10Ids = new Set(sorted.slice(0, 10).map(s => s.numero));
    const baseData = [...statsList].sort((a, b) => a.numero - b.numero);

    return {
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
  }, [data]);

  const chartConfig = {
    frequencia: { label: "Frequência", color: "hsl(var(--primary))" },
    atraso: { label: "Atraso", color: "#3b82f6" },
  };

  if (isLoading) {
    return (
      <Layout>
        <section className="bg-primary text-primary-foreground py-12">
          <div className="container px-4">
            <h1 className="text-3xl font-bold mb-2 tracking-tighter italic">Estatísticas Reais</h1>
            <p className="opacity-70">Processando análise de 2025...</p>
          </div>
        </section>
        <div className="container py-12 px-4"><LoadingStats /></div>
      </Layout>
    );
  }

  if (isError || !processed) {
    return (
      <Layout>
        <div className="container py-20 flex flex-col items-center justify-center text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-2xl font-bold">Dados indisponíveis</h2>
          <p className="text-muted-foreground mb-6">Não conseguimos carregar as estatísticas no momento.</p>
          <button onClick={() => refetch()} className="px-6 py-2 bg-primary text-primary-foreground rounded-full">
            Tentar Novamente
          </button>
        </div>
      </Layout>
    );
  }

  const { sortedByScore, frequenciaData, atrasoData, top10Ids } = processed;
  const ciclo = data?.ciclo || { faltam: [], total_faltam: 0 };
  const analise = data?.analise || { soma_media: 0, pares_media: 0, impares_media: 0, primos_media: 0 };

  return (
    <Layout>
      {/* Header Premium */}
      <section className="bg-primary text-primary-foreground py-12 md:py-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
        <div className="container px-4 relative z-10">
          <div className="max-w-2xl">
            <Badge className="mb-4 bg-white/20 border-none">Live Data 2025</Badge>
            <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tighter italic uppercase">Estatísticas Reais</h1>
            <p className="text-white/80 text-lg">Análise de probabilidade baseada nos últimos concursos.</p>
          </div>
        </div>
      </section>

      <div className="container py-8 md:py-12 px-4 space-y-8">
        {/* Cards de Médias */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Soma Média", val: analise.soma_media, icon: TrendingUp },
            { label: "Pares Média", val: analise.pares_media, icon: BarChart3 },
            { label: "Ímpares Média", val: analise.impares_media, icon: Target },
            { label: "Primos Média", val: analise.primos_media, icon: Zap },
          ].map((item, i) => (
            <Card key={i} className="border-none shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-muted-foreground text-[10px] mb-2 uppercase font-black">
                  <item.icon className="h-3 w-3 text-primary" /> {item.label}
                </div>
                <div className="text-2xl font-black">{Number(item.val || 0).toFixed(1)}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Alerta de Ciclo */}
        {ciclo.faltam?.length > 0 && (
          <Card className="border-none shadow-lg bg-amber-50 border-l-4 border-l-amber-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-amber-900 flex items-center gap-2 text-sm font-bold">
                <Clock className="h-4 w-4" /> FECHAMENTO DE CICLO
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {ciclo.faltam.map((num: number) => (
                  <LotteryBall key={num} number={num} highlighted size="lg" />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Gráficos de Frequência e Atraso */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border-none shadow-md">
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="text-xs uppercase font-black flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" /> Frequência
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ChartContainer config={chartConfig} className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={frequenciaData}>
                    <XAxis dataKey="numero" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="frequencia">
                      {frequenciaData.map((entry, index) => (
                        <Cell key={index} fill={entry.isTop ? "hsl(var(--primary))" : "hsl(var(--primary)/0.2)"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="text-xs uppercase font-black flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" /> Atraso (Concursos)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ChartContainer config={chartConfig} className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={atrasoData}>
                    <XAxis dataKey="numero" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="atraso">
                      {atrasoData.map((entry, index) => (
                        <Cell key={index} fill={entry.isHot ? "#ef4444" : "#3b82f622"} />
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
            <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase">
              <Award className="h-4 w-4 text-amber-500" /> Ranking Inteligente (Top Score)
            </CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24 text-center">Bola</TableHead>
                  <TableHead>Score Técnico</TableHead>
                  <TableHead className="text-center">Atraso</TableHead>
                  <TableHead className="text-right pr-6">Frequência</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedByScore.map((s, idx) => (
                  <TableRow key={s.numero} className="hover:bg-muted/20">
                    <TableCell className="text-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mx-auto ${
                        top10Ids.has(s.numero) ? "bg-primary text-primary-foreground shadow-md" : "bg-muted text-muted-foreground"
                      }`}>
                        {s.numero.toString().padStart(2, "0")}
                      </div>
                    </TableCell>
                    <TableCell className="font-black italic">
                      {Number(s.score || 0).toFixed(0)}
                      {idx < 5 && <Badge className="ml-2 bg-emerald-500 text-[9px] h-4 uppercase">Elite</Badge>}
                    </TableCell>
                    <TableCell className="text-center tabular-nums text-muted-foreground">{s.atraso}</TableCell>
                    <TableCell className="text-right pr-6 font-bold tabular-nums">{s.frequencia}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
