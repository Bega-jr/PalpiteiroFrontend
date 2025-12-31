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
    queryFn: async () => {
      const response = await api.get("/estatisticas/base");
      return response.data;
    },
  });

  // >>> DEBUG: VERIFIQUE ISTO NO CONSOLE DO NAVEGADOR (F12) <<<
  console.log("DEBUG Estatísticas (Objeto Completo):", estatisticas);

  // 1. Configuração do Gráfico (Essencial para o ChartContainer)
  const chartConfig = {
    frequencia: { label: "Frequência", color: "hsl(var(--primary))" },
    atraso: { label: "Atraso", color: "#f59e0b" },
  };

  if (isLoading) {
    return (
      <Layout>
        <section className="bg-primary text-primary-foreground py-12 md:py-16">
          <div className="container px-4 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Estatísticas</h1>
            <p className="opacity-80">Carregando análise técnica...</p>
          </div>
        </section>
        <div className="container py-12 px-4">
          <LoadingStats />
        </div>
      </Layout>
    );
  }

  // Fallbacks e Limpeza de Dados (Proteção contra toFixed em null/undefined)
  const stats = estatisticas?.estatisticas || [];
  const ciclo = estatisticas?.ciclo || { faltam: [], total_faltam: 0 };
  const analise = estatisticas?.analise || { 
    soma_media: 0, 
    pares_media: 0, 
    impares_media: 0, 
    primos_media: 0 
  };

  const sortedByScore = [...stats].sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0));
  const top10Ids = new Set(sortedByScore.slice(0, 10).map(s => s.numero));

  const chartData = [...stats]
    .sort((a, b) => a.numero - b.numero)
    .map((s) => ({
      numero: s.numero.toString().padStart(2, "0"),
      frequencia: Number(s.frequencia) || 0,
      atraso: Number(s.atraso) || 0,
      isTop: top10Ids.has(s.numero),
    }));

  return (
    <Layout>
      {/* Header Premium */}
      <section className="bg-primary text-primary-foreground py-12 md:py-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
        <div className="container px-4 relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tighter italic">Estatísticas Reais</h1>
            <p className="text-white/80 text-lg">Análise avançada de frequência e probabilidade atualizada para 2025.</p>
          </div>
        </div>
      </section>

      <div className="container py-8 md:py-12 px-4 space-y-8">
        
        {/* Painel de Médias Rápidas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Soma Média", val: analise.soma_media, icon: TrendingUp },
            { label: "Pares Média", val: analise.pares_media, icon: BarChart3 },
            { label: "Ímpares Média", val: analise.impares_media, icon: Target },
            { label: "Primos Média", val: analise.primos_media, icon: Zap },
          ].map((item, i) => (
            <Card key={i} className="border-none shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-muted-foreground text-[10px] mb-2 uppercase font-black tracking-widest">
                  <item.icon className="h-3 w-3 text-primary" /> {item.label}
                </div>
                <div className="text-2xl font-black">
                  {/* Garantia de que o valor é numérico antes de formatar */}
                  {Number(item.val || 0).toFixed(1)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Ciclo de Dezenas */}
        {ciclo.faltam?.length > 0 && (
          <Card className="border-none shadow-lg bg-amber-50 border-l-4 border-l-amber-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-900">
                <Clock className="h-5 w-5" />
                Faltam para fechar o Ciclo
                <Badge className="bg-amber-600 ml-auto">{ciclo.total_faltam} restantes</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3 pb-6">
              {ciclo.faltam.map((num: number) => (
                <LotteryBall key={num} number={num} highlighted size="lg" />
              ))}
            </CardContent>
          </Card>
        )}

        {/* Gráfico de Frequência - CORREÇÃO DO ERRO useChart */}
        <Card className="border-none shadow-md overflow-hidden">
          <CardHeader className="bg-muted/30 border-b">
            <CardTitle className="flex items-center gap-2 text-md">
              <TrendingUp className="h-5 w-5 text-primary" /> Frequência dos Números
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8">
            {/* O ChartContainer DEVE envolver todo o gráfico para o Tooltip funcionar */}
            <ChartContainer config={chartConfig} className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="numero" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} hide />
                  <ChartTooltip 
                    cursor={{ fill: 'transparent' }} 
                    content={<ChartTooltipContent />} 
                  />
                  <Bar dataKey="frequencia" radius={}>
                    {chartData.map((entry, index) => (
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

        {/* Ranking Score */}
        <Card className="border-none shadow-md">
          <CardHeader className="bg-muted/30 border-b">
            <CardTitle className="flex items-center gap-2 text-md font-bold">
              <Award className="h-5 w-5 text-amber-500" /> Ranking Inteligente (Top Score)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24 text-center">Dezena</TableHead>
                  <TableHead>Score Estatístico</TableHead>
                  <TableHead className="text-center">Atraso</TableHead>
                  <TableHead className="text-right">Frequência</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedByScore.map((s) => (
                  <TableRow key={s.numero} className="hover:bg-muted/20">
                    <TableCell className="text-center">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs mx-auto">
                        {s.numero.toString().padStart(2, "0")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 font-bold">
                        {/* Garantia de que o score é numérico */}
                        {Number(s.score || 0).toFixed(0)}
                        {top10Ids.has(s.numero) && <Badge variant="secondary" className="text-[9px] h-4">QUENTE</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      {s.atraso} {s.atraso === 1 ? 'jogo' : 'jogos'}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {s.frequencia}x
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

