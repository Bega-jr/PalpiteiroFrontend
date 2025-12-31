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
import { getEstatisticasScore } from "@/lib/api";
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
    staleTime: 1000 * 60 * 10,
  });

  // Processamento corrigido para a chave "dados"
  const processed = useMemo(() => {
    // AJUSTE AQUI: O seu console mostrou que a lista vem em "dados"
    const statsList = data?.dados || []; 
    
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
          <div className="container px-4 text-center">
            <h1 className="text-3xl font-bold mb-2">Estatísticas Reais</h1>
            <p className="opacity-70 italic font-display">Carregando análise técnica 2025...</p>
          </div>
        </section>
        <div className="container py-12 px-4"><LoadingStats /></div>
      </Layout>
    );
  }

  // Seprocessed for null, significa que statsList veio vazio
  if (isError || !processed) {
    return (
      <Layout>
        <div className="container py-20 flex flex-col items-center justify-center text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-2xl font-bold">Dados não processados</h2>
          <p className="text-muted-foreground mb-6">Recebemos a resposta do servidor, mas a lista de dezenas está vazia.</p>
          <button onClick={() => refetch()} className="px-6 py-2 bg-primary text-primary-foreground rounded-full font-bold">
            Tentar Novamente
          </button>
        </div>
      </Layout>
    );
  }

  const { sortedByScore, frequenciaData, atrasoData, top10Ids } = processed;
  
  // Ajuste nos fallbacks conforme a estrutura do seu backend
  const ciclo = data?.ciclo || { faltam: [], total_faltam: 0 };
  const analise = data?.analise || { soma_media: 0, pares_media: 0, impares_media: 0, primos_media: 0 };

  return (
    <Layout>
      {/* Header */}
      <section className="bg-primary text-primary-foreground py-12 md:py-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
        <div className="container px-4 relative z-10">
          <div className="max-w-2xl">
            <Badge className="mb-4 bg-white/20 border-none font-bold">ANÁLISE DE SCORE 2025</Badge>
            <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tighter italic uppercase">Estatísticas Reais</h1>
            <p className="text-white/80 text-lg">Ranking técnico baseado em inteligência estatística.</p>
          </div>
        </div>
      </section>

      <div className="container py-8 md:py-12 px-4 space-y-8">
        
        {/* Painel de Médias */}
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
                <div className="text-2xl font-black tabular-nums">{Number(item.val || 0).toFixed(1)}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Gráficos em Grade */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border-none shadow-md overflow-hidden">
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="text-xs uppercase font-black flex items-center gap-2 tracking-widest">
                <TrendingUp className="h-4 w-4 text-primary" /> Frequência de Sorteio
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8">
              <ChartContainer config={chartConfig} className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={frequenciaData}>
                    <XAxis dataKey="numero" tick={{ fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="frequencia" radius={[4, 4, 0, 0]}>
                      {frequenciaData.map((entry, index) => (
                        <Cell key={index} fill={entry.isTop ? "hsl(var(--primary))" : "hsl(var(--primary)/0.15)"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md overflow-hidden">
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="text-xs uppercase font-black flex items-center gap-2 tracking-widest">
                <Clock className="h-4 w-4 text-blue-500" /> Atraso (Concursos Fora)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8">
              <ChartContainer config={chartConfig} className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={atrasoData}>
                    <XAxis dataKey="numero" tick={{ fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="atraso" radius={[4, 4, 0, 0]}>
                      {atrasoData.map((entry, index) => (
                        <Cell key={index} fill={entry.isHot ? "#ef4444" : "#3b82f615"} />
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
            <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-tight">
              <Award className="h-4 w-4 text-amber-500" /> Ranking Inteligente (Top Score)
            </CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/10">
                  <TableHead className="w-24 text-center font-bold">Bola</TableHead>
                  <TableHead className="font-bold">Score Técnico</TableHead>
                  <TableHead className="text-center font-bold">Atraso</TableHead>
                  <TableHead className="text-right pr-8 font-bold">Frequência</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedByScore.map((s, idx) => (
                  <TableRow key={s.numero} className="hover:bg-primary/5 transition-colors group">
                    <TableCell className="text-center">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm mx-auto transition-transform group-hover:scale-110 ${
                        top10Ids.has(s.numero) ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground"
                      }`}>
                        {s.numero.toString().padStart(2, "0")}
                      </div>
                    </TableCell>
                    <TableCell className="font-black text-lg">
                      {Number(s.score || 0).toFixed(0)}
                      {idx < 5 && <Badge className="ml-2 bg-emerald-500/10 text-emerald-600 border-emerald-200 text-[9px] h-4">TOP</Badge>}
                    </TableCell>
                    <TableCell className="text-center tabular-nums font-medium">{s.atraso}</TableCell>
                    <TableCell className="text-right pr-8 font-bold tabular-nums text-muted-foreground">{s.frequencia}</TableCell>
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

