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
   TIPOS
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
  const { data: estatisticas, isLoading, isError } = useQuery<EstatisticasResponse>({
    queryKey: ["estatisticasScore"],
    queryFn: getEstatisticasScore,
  });

  if (isLoading) {
    return (
      <Layout>
        <section className="gradient-hero text-primary-foreground py-12 md:py-16">
          <div className="container">
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-4 text-white">Carregando Estatísticas...</h1>
            <LoadingStats />
          </div>
        </section>
      </Layout>
    );
  }

  if (isError || !estatisticas) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h2 className="text-2xl font-bold text-destructive">Erro ao carregar dados</h2>
          <p className="text-muted-foreground">O backend não respondeu conforme o esperado.</p>
        </div>
      </Layout>
    );
  }

  const stats = estatisticas.estatisticas || [];
  const ciclo = estatisticas.ciclo;
  const analise = estatisticas.analise;

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
      <section className="gradient-hero text-primary-foreground py-12 md:py-16">
        <div className="container text-white">
          <div className="max-w-2xl">
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
              Análise Estatística
            </h1>
            <p className="text-white/80">
              Referência: {analise?.data_referencia} | Total: {estatisticas.meta.total_numeros} dezenas
            </p>
          </div>
        </div>
      </section>

      <div className="container py-8 md:py-12 space-y-8">
        
        {/* BLOCO 1: CARDS DE RESUMO */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatMiniCard title="Soma Média" value={analise.soma_media} icon={<Target />} />
          <StatMiniCard title="Pares" value={analise.pares_media} icon={<Hash />} />
          <StatMiniCard title="Ímpares" value={analise.impares_media} icon={<Hash />} />
          <StatMiniCard title="Primos" value={analise.primos_media} icon={<Zap />} />
        </div>

        {/* BLOCO 2: CICLO ATUAL */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" /> Ciclo Atual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3 mb-4">
              {ciclo?.faltam?.length ? (
                ciclo.faltam.map((num) => (
                  <LotteryBall key={num} number={num} variant="outline" />
                ))
              ) : (
                <Badge className="bg-green-500">🎯 Ciclo Completo!</Badge>
              )}
            </div>
            <p className="text-xs font-medium text-muted-foreground uppercase">
              TOTAL PENDENTE: {ciclo?.total_faltam}
            </p>
          </CardContent>
        </Card>

        {/* BLOCO 3: GRÁFICO */}
        <Card>
          <CardHeader><CardTitle>Frequência por Dezena</CardTitle></CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={frequenciaData}>
                <XAxis dataKey="numero" />
                <YAxis />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="frequencia">
                  {frequenciaData.map((entry, index) => (
                    <Cell key={index} fill={entry.isTop ? "hsl(var(--primary))" : "#cbd5e1"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* BLOCO 4: TABELA */}
        <Card>
          <CardHeader><CardTitle>Estatísticas Detalhadas</CardTitle></CardHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dezena</TableHead>
                <TableHead>Frequência</TableHead>
                <TableHead>Atraso</TableHead>
                <TableHead className="text-right">Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedByScore.map((n) => (
                <TableRow key={n.numero}>
                  <TableCell><LotteryBall number={n.numero} size="sm" /></TableCell>
                  <TableCell>{n.frequencia}x</TableCell>
                  <TableCell>
                    <Badge variant={n.atraso > 4 ? "destructive" : "secondary"}>
                      {n.atraso}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold">
                    {n.score.toFixed(4)}
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

// Componente auxiliar para os cards pequenos
function StatMiniCard({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2 uppercase font-semibold">
          {icon} {title}
        </div>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
