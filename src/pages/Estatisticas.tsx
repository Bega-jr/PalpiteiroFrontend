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
// Importação corrigida para usar a função getEstatisticasScore nomeada
import { getEstatisticasScore } from "@/lib/api"; 
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  Tooltip
} from "recharts";
import { BarChart3, TrendingUp, Clock, Zap, Target, Hash } from "lucide-react";

/* =====================
   TIPOS CORRETOS (Adicionados aqui para completar o arquivo)
===================== */
type AnaliseGeral = {
  soma_media: number;
  pares_media: number;
  impares_media: number;
  primos_media: number;
  data_referencia: string;
};

type NumeroStats = {
  numero: number;
  frequencia: number;
  atraso: number;
  score: number;
};

type Ciclo = {
  faltam: number[];
  total_faltam: number;
};

type EstatisticasResponse = {
  estatisticas: NumeroStats[];
  analise: AnaliseGeral;
  ciclo: Ciclo;
  meta: {
    data_referencia: string;
    total_numeros: number;
    fonte: string;
  };
};


export default function Estatisticas() {
  // Tipagem adicionada ao useQuery para melhor segurança
  const { data: estatisticas, isLoading } = useQuery<EstatisticasResponse>({
    queryKey: ["estatisticasScore"],
    queryFn: getEstatisticasScore, // Uso direto da função importada
  });

  if (isLoading) {
    return (
      <Layout>
        <section className="gradient-hero text-primary-foreground py-12 md:py-16">
          <div className="container">
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-4 text-white">Estatísticas</h1>
            <LoadingStats />
          </div>
        </section>
      </Layout>
    );
  }

  const stats = estatisticas?.estatisticas || [];
  const ciclo = estatisticas?.ciclo;
  const analise = estatisticas?.analise;

  // Ordenações para os gráficos
  const sortedByScore = [...stats].sort((a, b) => b.score - a.score);
  const top10 = sortedByScore.slice(0, 10);

  const frequenciaData = [...stats]
    .sort((a, b) => a.numero - b.numero)
    .map((s) => ({
      numero: s.numero.toString().padStart(2, "0"),
      frequencia: s.frequencia,
      isTop: top10.some((t) => t.numero === s.numero),
    }));

  return (
    <Layout>
      {/* Header */}
      <section className="gradient-hero text-primary-foreground py-12 md:py-16">
        <div className="container text-white">
          <div className="max-w-2xl">
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
              Análise Estatística
            </h1>
            <p className="text-white/80">
              Referência: {analise?.data_referencia}
            </p>
          </div>
        </div>
      </section>

      <div className="container py-8 md:py-12 space-y-8">
        
        {/* BLOCO 1: CARDS DE RESUMO (Incluindo Primos) */}
        {analise && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2 uppercase font-semibold">
                  <TrendingUp className="h-4 w-4" /> Soma Média
                </div>
                <div className="text-2xl font-bold">{analise.soma_media}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2 uppercase font-semibold">
                  <Hash className="h-4 w-4" /> Pares
                </div>
                <div className="text-2xl font-bold">{analise.pares_media}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2 uppercase font-semibold">
                  <Hash className="h-4 w-4" /> Ímpares
                </div>
                <div className="text-2xl font-bold">{analise.impares_media}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2 uppercase font-semibold">
                  <Zap className="h-4 w-4" /> Primos
                </div>
                <div className="text-2xl font-bold">{analise.primos_media}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* BLOCO 2: CICLO ATUAL (Visual com Bolinhas) */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" /> Ciclo Atual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Números que ainda não foram sorteados neste ciclo:
            </p>
            <div className="flex flex-wrap gap-3">
              {ciclo?.faltam?.length ? (
                ciclo.faltam.map((num) => (
                  <LotteryBall key={num} number={num} variant="outline" />
                ))
              ) : (
                <Badge variant="secondary" className="text-lg py-1 px-4">🎯 Ciclo Completo!</Badge>
              )}
            </div>
            <div className="mt-4 text-xs font-medium text-muted-foreground">
              TOTAL PENDENTE: {ciclo?.total_faltam}
            </div>
          </CardContent>
        </Card>

        {/* BLOCO 3: GRÁFICO DE FREQUÊNCIA */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" /> Frequência por Dezena
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={frequenciaData}>
                <XAxis dataKey="numero" />
                <YAxis />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="frequencia">
                  {frequenciaData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.isTop ? "hsl(var(--primary))" : "hsl(var(--muted-foreground)/0.3)"} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* BLOCO 4: TABELA DETALHADA */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" /> Estatísticas Detalhadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Dezena</TableHead>
                  <TableHead>Frequência</TableHead>
                  <TableHead>Atraso Atual</TableHead>
                  <TableHead className="text-right">Score de Força</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedByScore.map((n) => (
                  <TableRow key={n.numero}>
                    <TableCell className="font-bold">
                      <LotteryBall number={n.numero} size="sm" />
                    </TableCell>
                    <TableCell>{n.frequencia}x</TableCell>
                    <TableCell>
                      <Badge variant={n.atraso > 4 ? "destructive" : "secondary"}>
                        {n.atraso} {n.atraso === 1 ? 'concurso' : 'concursos'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold text-primary">
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
