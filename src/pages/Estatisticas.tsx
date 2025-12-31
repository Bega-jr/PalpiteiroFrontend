import { useMemo, useEffect } from "react"; // Adicionado useEffect para debug
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
import { BarChart3, TrendingUp, Clock, Zap, Target, Award, AlertTriangle } from "lucide-react";

export default function Estatisticas() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["estatisticasScore"],
    queryFn: async () => {
      const response = await api.getEstatisticasScore();
      // SE a sua api usa Axios, os dados estão em response.data
      // SE a função getEstatisticasScore já retorna o .data, use apenas 'response'
      return response?.data || response; 
    },
  });

  // Log para debug - Veja no console do navegador se os dados estão chegando
  useEffect(() => {
    if (data) console.log("Dados recebidos da API:", data);
  }, [data]);

  const chartConfig = {
    frequencia: { label: "Frequência", color: "hsl(var(--primary))" },
    atraso: { label: "Atraso", color: "hsl(var(--lottery-blue))" },
  };

  // Processamento de dados
  const processedData = useMemo(() => {
    // Tentativa de encontrar a lista de estatísticas em diferentes estruturas possíveis
    const stats = data?.estatisticas || data || [];
    
    if (!Array.isArray(stats) || stats.length === 0) {
      return { stats: [], sortedByScore: [], frequenciaData: [], atrasoData: [], top10Ids: new Set() };
    }

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
  }, [data]);

  if (isLoading) {
    return (
      <Layout>
        <section className="gradient-hero text-primary-foreground py-12">
          <div className="container">
            <h1 className="text-3xl font-bold">Estatísticas</h1>
            <p className="opacity-80">Processando base de dados...</p>
          </div>
        </section>
        <div className="container py-8"><LoadingStats /></div>
      </Layout>
    );
  }

  const { sortedByScore, frequenciaData, atrasoData, top10Ids, stats } = processedData;
  const ciclo = data?.ciclo || { faltam: [], total_faltam: 0 };
  const analise = data?.analise || { soma_media: 0, pares_media: 0, impares_media: 0, primos_media: 0 };

  // Se após carregar não houver dados, mostra estado vazio
  if (!isLoading && stats.length === 0) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-amber-500 mb-4" />
          <h2 className="text-xl font-bold">Nenhum dado encontrado</h2>
          <p className="text-muted-foreground">A API retornou uma lista vazia.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header */}
      <section className="gradient-hero text-primary-foreground py-12 md:py-16">
        <div className="container">
          <Badge className="mb-4 bg-white/20 border-none text-white">2025 Live Data</Badge>
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-4 italic tracking-tighter">
            Estatísticas Inteligentes
          </h1>
          <p className="text-white/80 text-lg max-w-2xl">
            Análise baseada em frequência e probabilidade para seus jogos.
          </p>
        </div>
      </section>

      <div className="container py-8 md:py-12 space-y-8">
        {/* Painel de Médias */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Soma Média", val: analise.soma_media },
            { label: "Pares Média", val: analise.pares_media },
            { label: "Ímpares Média", val: analise.impares_media },
            { label: "Primos Média", val: analise.primos_media },
          ].map((item, i) => (
            <Card key={i} className="border-none shadow-sm">
              <CardContent className="p-6">
                <p className="text-xs text-muted-foreground uppercase font-bold mb-1">{item.label}</p>
                <p className="text-2xl font-black">{Number(item.val || 0).toFixed(1)}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Ciclo */}
        {ciclo.faltam?.length > 0 && (
          <Card className="border-none shadow-lg border-l-4 border-l-amber-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-600" /> Faltam no Ciclo
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {ciclo.faltam.map((n: number) => <LotteryBall key={n} number={n} highlighted size="lg" />)}
            </CardContent>
          </Card>
        )}

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border-none shadow-md overflow-hidden">
            <CardHeader className="bg-muted/20 border-b"><CardTitle className="text-sm">Frequência</CardTitle></CardHeader>
            <CardContent className="pt-6">
              <ChartContainer config={chartConfig} className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={frequenciaData}>
                    <XAxis dataKey="numero" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="frequencia">
                      {frequenciaData.map((e, i) => <Cell key={i} fill={e.isTop ? "hsl(var(--primary))" : "hsl(var(--primary)/0.2)"} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md overflow-hidden">
            <CardHeader className="bg-muted/20 border-b"><CardTitle className="text-sm">Atraso</CardTitle></CardHeader>
            <CardContent className="pt-6">
              <ChartContainer config={chartConfig} className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={atrasoData}>
                    <XAxis dataKey="numero" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="atraso">
                      {atrasoData.map((e, i) => <Cell key={i} fill={e.isHot ? "#ef4444" : "#3b82f633"} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Ranking */}
        <Card className="border-none shadow-md overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-24 text-center">Bola</TableHead>
                <TableHead>Score</TableHead>
                <TableHead className="text-center">Atraso</TableHead>
                <TableHead className="text-right pr-6">Frequência</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedByScore.map((s, idx) => (
                <TableRow key={s.numero}>
                  <TableCell className="text-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mx-auto ${top10Ids.has(s.numero) ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                      {s.numero.toString().padStart(2, "0")}
                    </div>
                  </TableCell>
                  <TableCell className="font-bold">{Number(s.score || 0).toFixed(0)}</TableCell>
                  <TableCell className="text-center">{s.atraso}</TableCell>
                  <TableCell className="text-right pr-6">{s.frequencia}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </Layout>
  );
}
