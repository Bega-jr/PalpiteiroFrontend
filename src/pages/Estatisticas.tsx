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
  const { data: estatisticas, isLoading, error } = useQuery({
    queryKey: ["estatisticasScore"],
    queryFn: async () => {
      // Endpoint atualizado conforme sua instrução
      const response = await api.get("/estatisticas/base");
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <Layout>
        <section className="gradient-hero text-primary-foreground py-12 md:py-16">
          <div className="container px-4">
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-4 animate-pulse">
              Estatísticas
            </h1>
            <p className="text-white/80">Sincronizando dados oficiais 2025...</p>
          </div>
        </section>
        <div className="container py-12 px-4">
          <LoadingStats />
        </div>
      </Layout>
    );
  }

  // Fallbacks de segurança para evitar erros de renderização
  const stats = estatisticas?.estatisticas || [];
  const ciclo = estatisticas?.ciclo || { faltam: [], total_faltam: 0 };
  const analise = estatisticas?.analise;

  // Ordenar por score decrescente
  const sortedByScore = [...stats].sort((a, b) => (b.score || 0) - (a.score || 0));
  const top10 = sortedByScore.slice(0, 10);

  // Gráfico de Frequência
  const frequenciaData = [...stats]
    .sort((a, b) => a.numero - b.numero)
    .map((s) => ({
      numero: s.numero.toString().padStart(2, "0"),
      frequencia: s.frequencia,
      isTop: top10.some((t) => t.numero === s.numero),
    }));

  // Gráfico de Atraso
  const atrasoData = [...stats]
    .sort((a, b) => a.numero - b.numero)
    .map((s) => ({
      numero: s.numero.toString().padStart(2, "0"),
      atraso: s.atraso,
      isHot: s.atraso >= 4,
    }));

  const chartConfig = {
    frequencia: { label: "Frequência", color: "hsl(var(--primary))" },
    atraso: { label: "Atraso", color: "#f59e0b" },
  };

  return (
    <Layout>
      {/* Hero Header */}
      <section className="gradient-hero text-primary-foreground py-12 md:py-16">
        <div className="container px-4">
          <div className="max-w-2xl">
            <h1 className="font-display text-3xl md:text-5xl font-bold mb-4 tracking-tight">
              Análise Inteligente
            </h1>
            <p className="text-white/90 text-lg">
              Dados extraídos dos últimos sorteios para identificar tendências,
              atrasos e o score real de cada dezena.
            </p>
          </div>
        </div>
      </section>

      <div className="container py-8 md:py-12 px-4 space-y-8">
        
        {/* Painel de Médias (Analise) com Proteção contra Erro toFixed */}
        {analise && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Soma Média", val: analise.soma_media, icon: TrendingUp },
              { label: "Pares Média", val: analise.pares_media, icon: BarChart3 },
              { label: "Ímpares Média", val: analise.impares_media, icon: Target },
              { label: "Primos Média", val: analise.primos_media, icon: Zap },
            ].map((item, i) => (
              <Card key={i} className="border-none shadow-sm bg-card hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2 uppercase font-bold tracking-tighter">
                    <item.icon className="h-4 w-4 text-primary" />
                    {item.label}
                  </div>
                  <div className="text-2xl font-black">
                    {/* Proteção para garantir que o valor seja numérico antes de formatar */}
                    {Number(item.val || 0).toFixed(1)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Ciclo Atual */}
        {ciclo?.faltam?.length > 0 && (
          <Card className="border-l-4 border-l-amber-500 overflow-hidden">
            <CardHeader className="bg-amber-50/50">
              <CardTitle className="flex items-center gap-2 text-amber-900">
                <Clock className="h-5 w-5" />
                Ciclo: Números Pendentes
                <Badge className="bg-amber-600 ml-2">{ciclo.total_faltam} restantes</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-sm text-amber-800/80 mb-6">
                Estes números ainda não foram sorteados no ciclo atual. 
                Historicamente, as dezenas que faltam tendem a aparecer para fechar o ciclo.
              </p>
              <div className="flex flex-wrap gap-3">
                {ciclo.faltam.map((num) => (
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
              <BarChart3 className="h-5 w-5 text-primary" />
              Frequência de Saída
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={frequenciaData}>
                  <XAxis dataKey="numero" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} hide />
                  <ChartTooltip cursor={{fill: 'transparent'}} content={<ChartTooltipContent />} />
                  <Bar dataKey="frequencia" radius={[4, 4, 0, 0]}>
                    {frequenciaData.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={entry.isTop ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.2)"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Estatísticas Detalhadas */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Ranking de Score e Atraso
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-24 text-center">Dezena</TableHead>
                  <TableHead>Score Inteligente</TableHead>
                  <TableHead>Atraso (Concursos)</TableHead>
                  <TableHead className="text-right">Frequência Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedByScore.map((s) => (
                  <TableRow key={s.numero} className="hover:bg-muted/30">
                    <TableCell className="text-center font-bold">
                      <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center mx-auto text-xs">
                        {s.numero.toString().padStart(2, "0")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{Number(s.score || 0).toFixed(0)}</span>
                        {top10.some(t => t.numero === s.numero) && (
                          <Badge variant="secondary" className="text-[9px] h-4">TOP 10</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={s.atraso >= 4 ? "text-amber-600 font-bold" : ""}>
                        {s.atraso} concursos
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
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
