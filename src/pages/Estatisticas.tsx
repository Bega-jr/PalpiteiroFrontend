import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { LotteryBall } from "@/components/LotteryBall";
import { LoadingStats } from "@/components/LoadingStates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from "recharts";
import { BarChart3, Clock, Target, Zap } from "lucide-react";

// 1. Importação do cliente Supabase da sua pasta
import { supabase } from "@/lib/supabase"; 

export default function Estatisticas() {
  // 2. Busca de dados usando TanStack Query + Supabase
  const { data, isLoading, error } = useQuery({
    queryKey: ["estatisticas-lotto"],
    queryFn: async () => {
      // Exemplo de busca em uma tabela 'estatisticas' no Supabase
      const { data, error } = await supabase
        .from('estatisticas_gerais') 
        .select('*')
        .single(); // Ajuste conforme sua estrutura de tabelas

      if (error) throw new Error(error.message);
      return data; // Deve retornar o objeto com { analise, estatisticas, ciclo }
    },
  });

  if (isLoading) return <LoadingStats />;
  if (error || !data) return <div className="p-10 text-center">Erro ao conectar com Supabase.</div>;

  return (
    <Layout>
      <section className="gradient-hero text-primary-foreground py-12 px-6 mb-8 rounded-xl">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Zap className="h-8 w-8 text-yellow-400" /> Painel de Estatísticas 2026
        </h1>
        <p className="opacity-90">Dados atualizados via Supabase em tempo real.</p>
      </section>

      <div className="container mx-auto space-y-8 pb-10">
        
        {/* CARDS DE RESUMO */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard title="Soma Média" value={data.analise.soma_media} icon={<Target />} />
          <StatCard title="Pares" value={data.analise.pares_media} icon={<BarChart3 />} />
          <StatCard title="Ímpares" value={data.analise.impares_media} icon={<BarChart3 />} />
          <StatCard title="Primos" value={data.analise.primos_media} icon={<Zap />} />
        </div>

        {/* CICLO ATUAL COM BALLS */}
        <Card className="border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Clock className="h-5 w-5" /> Ciclo Atual: Números Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {data.ciclo?.faltam?.length > 0 ? (
                data.ciclo.faltam.map((n: number) => (
                  <LotteryBall key={n} number={n} size="md" gradient />
                ))
              ) : (
                <Badge className="bg-green-500">Ciclo Completo! 🎯</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* GRÁFICO DE FREQUÊNCIA (Recharts) */}
        <Card className="h-[400px] p-6">
          <CardTitle className="mb-6">Frequência por Número</CardTitle>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.estatisticas}>
              <XAxis dataKey="numero" />
              <YAxis />
              <Tooltip cursor={{fill: 'transparent'}} />
              <Bar dataKey="frequencia" radius={[4, 4, 0, 0]}>
                {data.estatisticas.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.score > 7 ? "#ef4444" : "#3b82f6"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* TABELA DETALHADA */}
        <Card>
          <CardHeader><CardTitle>Ranking de Scores</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead w-20>Bola</TableHead>
                  <TableHead>Frequência</TableHead>
                  <TableHead>Atraso</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.estatisticas.map((n: any) => (
                  <TableRow key={n.numero}>
                    <TableCell><LotteryBall number={n.numero} size="sm" /></TableCell>
                    <TableCell>{n.frequencia}</TableCell>
                    <TableCell className="text-muted-foreground">{n.atraso} concursos</TableCell>
                    <TableCell className="text-right font-mono font-bold text-primary">
                      {n.score.toFixed(3)}
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

// Componente auxiliar de Card para limpeza do código
function StatCard({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) {
  return (
    <Card className="hover:border-primary transition-colors cursor-default">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="h-4 w-4 text-primary">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
