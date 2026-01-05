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
  CartesianGrid
} from "recharts";
import { BarChart3, TrendingUp, Clock, Zap, Target, Info } from "lucide-react";
import { api } from "@/lib/api";

export default function Estatisticas() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["estatisticasScore"],
    queryFn: () => api.getEstatisticasScore(),
    refetchOnWindowFocus: false
  });

  if (isLoading) return <LoadingStats />;
  
  if (error || !data) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Info className="h-12 w-12 text-destructive" />
          <h2 className="text-xl font-bold">Não foi possível carregar as estatísticas</h2>
          <p className="text-muted-foreground">Verifique a conexão com o banco de dados Supabase.</p>
        </div>
      </Layout>
    );
  }

  // Mapeamento direto dos dados do seu Python
  const { estatisticas, analise, ciclo, meta } = data;

  return (
    <Layout>
      <div className="container mx-auto p-4 md:p-8 space-y-8">
        
        {/* CABEÇALHO COM INFO DE ATUALIZAÇÃO */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b pb-6 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">Análise Inteligente</h1>
            <p className="text-muted-foreground mt-1">
              Última extração: <span className="font-medium text-primary">{analise.data_referencia}</span>
            </p>
          </div>
          <Badge variant="outline" className="text-xs uppercase tracking-widest px-3 py-1">
            Fonte: {meta.fonte}
          </Badge>
        </div>

        {/* 1. CARDS DE RESUMO (MÉDIAS) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Soma Média" value={analise.soma_media} icon={<Target />} color="bg-blue-500/10 text-blue-600" />
          <StatCard title="Média Pares" value={analise.pares_media} icon={<TrendingUp />} color="bg-green-500/10 text-green-600" />
          <StatCard title="Média Ímpares" value={analise.impares_media} icon={<TrendingUp />} color="bg-orange-500/10 text-orange-600" />
          <StatCard title="Média Primos" value={analise.primos_media} icon={<Zap />} color="bg-yellow-500/10 text-yellow-600" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* 2. CICLO / NÚMEROS PENDENTES */}
          <Card className="xl:col-span-1 shadow-sm border-2">
            <CardHeader className="bg-muted/30">
              <CardTitle className="flex items-center gap-2 text-base uppercase tracking-wider">
                <Clock className="h-5 w-5" /> Ciclo Atual (Faltantes)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-2 min-h-[100px]">
                {ciclo.faltam && ciclo.faltam.length > 0 ? (
                  ciclo.faltam.map((num: number) => (
                    <LotteryBall key={num} number={num} variant="highlight" size="md" />
                  ))
                ) : (
                  <div className="flex items-center justify-center w-full bg-green-50 rounded-lg border border-green-100 p-4">
                    <p className="text-green-700 font-medium">Ciclo finalizado! 🎯</p>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-6 text-center italic">
                {ciclo.total_faltam} números restantes para completar o ciclo.
              </p>
            </CardContent>
          </Card>

          {/* 3. GRÁFICO DE SCORE (O MELHOR VISUAL) */}
          <Card className="xl:col-span-2 shadow-sm border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base uppercase tracking-wider">
                <BarChart3 className="h-5 w-5" /> Tendência de Performance (Score)
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] w-full pr-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={estatisticas.slice(0, 15)}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="numero" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{ fill: '#f1f5f9' }} 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-3 border rounded-lg shadow-xl">
                            <p className="font-bold text-lg">Bola {payload[0].payload.numero}</p>
                            <p className="text-sm text-primary">Score: {payload[0].value?.toFixed(4)}</p>
                            <p className="text-xs text-muted-foreground">Atraso: {payload[0].payload.atraso}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                    {estatisticas.slice(0, 15).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={index < 3 ? "hsl(var(--primary))" : "#94a3b8"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* 4. TABELA DETALHADA (TODO O RESTO) */}
        <Card className="border-2 overflow-hidden shadow-md">
          <CardHeader className="border-b bg-muted/20">
            <CardTitle className="text-lg">Ranking Geral Detalhado</CardTitle>
          </CardHeader>
          <Table>
            <TableHeader className="bg-muted/10">
              <TableRow>
                <TableHead className="w-24 text-center">Nº</TableHead>
                <TableHead>Frequência Total</TableHead>
                <TableHead>Atraso Atual</TableHead>
                <TableHead className="text-right">Score de Força</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {estatisticas.map((n: any) => (
                <TableRow key={n.numero} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="text-center py-3">
                    <LotteryBall number={n.numero} size="sm" />
                  </TableCell>
                  <TableCell className="font-medium text-muted-foreground">{n.frequencia}x</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={n.atraso > 5 ? "text-destructive font-bold" : ""}>{n.atraso}</span>
                      {n.atraso > 8 && <Badge variant="destructive" className="h-4 px-1 text-[10px]">CRÍTICO</Badge>}
                    </div>
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

function StatCard({ title, value, icon, color }: { title: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <Card className="border-2 shadow-sm transition-all hover:scale-[1.02]">
      <CardContent className="p-4 flex items-center gap-4">
        <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-tighter">{title}</p>
          <p className="text-2xl font-black">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
