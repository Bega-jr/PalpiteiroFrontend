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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  Tooltip,
} from "recharts";
import { BarChart3, TrendingUp, Clock, Zap, Target } from "lucide-react";
import { api } from "@/lib/api";

export default function Estatisticas() {
  // 1. Hook para buscar os dados conforme seu endpoint Python
  const { data, isLoading, error } = useQuery({
    queryKey: ["estatisticasScore"],
    queryFn: () => api.getEstatisticasScore(),
  });

  if (isLoading) return <LoadingStats />;
  if (error || !data) return <div className="p-10 text-center text-red-500">Erro ao carregar dados do servidor.</div>;

  // Desestruturando conforme o dicionário retornado pelo Python
  const { estatisticas, analise, ciclo, meta } = data;

  return (
    <Layout>
      {/* HEADER DINÂMICO */}
      <section className="gradient-hero text-primary-foreground py-12 px-6 mb-8 rounded-xl shadow-lg">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
                <BarChart3 className="h-10 w-10" /> Painel de Análise
              </h1>
              <p className="text-primary-foreground/80 mt-2">
                Referência: <span className="font-semibold">{analise.data_referencia}</span> | Fonte: {meta.fonte}
              </p>
            </div>
            <Badge variant="secondary" className="text-lg py-1 px-4">
              {meta.total_numeros} Números Analisados
            </Badge>
          </div>
        </div>
      </section>

      <div className="container mx-auto space-y-8 pb-16">
        
        {/* BLOCO 1: CARDS DE MÉDIAS (Análise Geral) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Soma Média" value={analise.soma_media} icon={<Target />} color="text-blue-500" />
          <StatCard title="Média Pares" value={analise.pares_media} icon={<TrendingUp />} color="text-green-500" />
          <StatCard title="Média Ímpares" value={analise.impares_media} icon={<TrendingUp />} color="text-orange-500" />
          <StatCard title="Média Primos" value={analise.primos_media} icon={<Zap />} color="text-yellow-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* BLOCO 2: CICLO ATUAL (2/3 da largura em telas grandes) */}
          <Card className="lg:col-span-1 shadow-md border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Clock className="h-5 w-5" /> Números Pendentes (Ciclo)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {ciclo.faltam.length > 0 ? (
                  ciclo.faltam.map((num: number) => (
                    <LotteryBall key={num} number={num} size="md" variant="highlight" />
                  ))
                ) : (
                  <p className="text-muted-foreground italic">Nenhum número pendente no ciclo atual.</p>
                )}
              </div>
              <div className="mt-6 pt-4 border-t text-sm flex justify-between">
                <span className="text-muted-foreground">Total pendente:</span>
                <span className="font-bold text-primary">{ciclo.total_faltam}</span>
              </div>
            </CardContent>
          </Card>

          {/* BLOCO 3: GRÁFICO DE SCORES (1/3 da largura) */}
          <Card className="lg:col-span-2 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" /> Frequência vs Score
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={estatisticas.slice(0, 15)}>
                  <XAxis dataKey="numero" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                  <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                    {estatisticas.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={index < 5 ? "hsl(var(--primary))" : "#94a3b8"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* BLOCO 4: TABELA DE RANKING COMPLETA */}
        <Card className="shadow-lg border-none">
          <CardHeader className="bg-muted/50 rounded-t-xl">
            <CardTitle>Ranking de Performance por Score</CardTitle>
          </CardHeader>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-24 text-center">Bola</TableHead>
                <TableHead>Frequência</TableHead>
                <TableHead>Atraso</TableHead>
                <TableHead className="text-right">Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {estatisticas.map((n: any) => (
                <TableRow key={n.numero} className="group transition-colors">
                  <TableCell className="text-center">
                    <LotteryBall number={n.numero} size="sm" />
                  </TableCell>
                  <TableCell className="font-medium">{n.frequencia}</TableCell>
                  <TableCell>
                    <Badge variant={n.atraso > 4 ? "destructive" : "secondary"}>
                      {n.atraso} concursos
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold text-primary">
                    {n.score.toFixed(6)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </Layout>
  );
}

// Subcomponente para os cards de estatísticas (limpeza de código)
function StatCard({ title, value, icon, color }: { title: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={color}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
