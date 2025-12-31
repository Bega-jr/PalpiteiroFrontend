import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { LoadingStats } from "@/components/LoadingStates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

interface EstatisticaBase {
  numero: number;
  frequencia: number;
  atraso: number;
  score: number;
}

export default function Estatisticas() {
  const { data: stats, isLoading, error } = useQuery<EstatisticaBase[]>({
    queryKey: ["estatisticasBase"],
    queryFn: async () => {
      // Ajustado para usar a chamada correta da sua instância de API
      const response = await api.get("/estatisticas"); 
      return response.data;
    },
    staleTime: 1000 * 60 * 10,
  });

  // 1. Estados de Erro e Carregamento
  if (isLoading) {
    return (
      <Layout>
        <div className="bg-primary text-primary-foreground py-12 md:py-16">
          <div className="container px-4">
            <h1 className="text-3xl md:text-4xl font-bold">Estatísticas</h1>
          </div>
        </div>
        <div className="container py-12 px-4 italic text-muted-foreground animate-pulse text-center">
          <LoadingStats />
        </div>
      </Layout>
    );
  }

  if (error || !stats || !Array.isArray(stats)) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <p className="text-destructive font-bold">Erro ao carregar estatísticas. Tente novamente mais tarde.</p>
        </div>
      </Layout>
    );
  }

  // 2. Processamento de Dados para Gráficos
  const sortedByScore = [...stats].sort((a, b) => b.score - a.score);
  const top10Ids = new Set(sortedByScore.slice(0, 10).map(s => s.numero));

  const chartData = [...stats]
    .sort((a, b) => a.numero - b.numero)
    .map(s => ({
      ...s,
      numeroDisplay: s.numero.toString().padStart(2, "0"),
      isTop: top10Ids.has(s.numero),
      isHot: s.atraso >= 4
    }));

  const chartConfig = {
    frequencia: { label: "Frequência", color: "hsl(var(--primary))" },
    atraso: { label: "Atraso", color: "#f59e0b" },
  };

  return (
    <Layout>
      {/* Header Estilizado */}
      <section className="bg-primary text-primary-foreground py-12 md:py-16">
        <div className="container px-4">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">Estatísticas de Elite</h1>
            <p className="text-white/80 text-lg leading-relaxed">
              Análise técnica profunda baseada em frequência, atraso e score inteligente para a Lotofácil.
            </p>
          </div>
        </div>
      </section>

      <div className="container py-8 md:py-12 px-4 space-y-8">
        {/* Painel de Médias Rápidas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Soma Média", val: "195.2", icon: TrendingUp },
            { label: "Pares (Méd)", val: "7.2", icon: BarChart3 },
            { label: "Ímpares (Méd)", val: "7.8", icon: Target },
            { label: "Primos (Méd)", val: "5.1", icon: Zap },
          ].map((item, i) => (
            <Card key={i} className="border-none shadow-sm">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <item.icon className="h-5 w-5 text-primary mb-2 opacity-60" />
                <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">{item.label}</span>
                <span className="text-2xl font-black">{item.val}</span>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Gráfico de Frequência */}
        <Card className="border-none shadow-md overflow-hidden">
          <CardHeader className="bg-muted/30 border-b">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5 text-primary" />
              Frequência de Saída
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="numeroDisplay" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <ChartTooltip 
                    cursor={{fill: 'transparent'}}
                    content={<ChartTooltipContent />} 
                  />
                  <Bar dataKey="frequencia" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.isTop ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.2)"} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-center text-xs text-muted-foreground mt-4 italic">
              * Barras escuras representam os 10 números com maior score estatístico.
            </p>
          </CardContent>
        </Card>

        {/* Tabela de Ranking e Atraso */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg leading-none">
                <Award className="h-5 w-5 text-amber-500" />
                Ranking de Score (Top 10)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20 text-center">Nº</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead className="text-right">Frequência</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedByScore.slice(0, 10).map((s) => (
                    <TableRow key={s.numero}>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-xs">
                          {s.numero.toString().padStart(2, "0")}
                        </span>
                      </TableCell>
                      <TableCell className="font-bold">{s.score}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{s.frequencia}x</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg leading-none">
                <Clock className="h-5 w-5 text-blue-500" />
                Atrasos Críticos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-3">
                {[...stats]
                  .sort((a, b) => b.atraso - a.atraso)
                  .map((s) => (
                    <div 
                      key={s.numero} 
                      className={`flex flex-col items-center p-3 rounded-xl border transition-colors ${
                        s.attraso >= 4 ? "bg-amber-50 border-amber-200" : "bg-muted/20 border-transparent"
                      }`}
                    >
                      <span className="text-lg font-black leading-none mb-1">{s.numero.toString().padStart(2, "0")}</span>
                      <span className={`text-[10px] font-bold ${s.atraso >= 4 ? "text-amber-700" : "text-muted-foreground"}`}>
                        {s.atraso} {s.atraso === 1 ? 'concurso' : 'concursos'}
                      </span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
