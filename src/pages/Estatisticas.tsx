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
  Tooltip,
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  Clock,
  Zap,
  Target,
  Hash,
} from "lucide-react";

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
  const { data, isLoading } = useQuery<EstatisticasResponse>({
    queryKey: ["estatisticasScore"],
    queryFn: getEstatisticasScore,
    staleTime: 1000 * 60 * 10,
    retry: 2,
  });

  if (isLoading) {
    return (
      <Layout>
        <section className="gradient-hero py-12 md:py-16">
          <div className="container">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Estatísticas
            </h1>
            <LoadingStats />
          </div>
        </section>
      </Layout>
    );
  }

  /* =====================
     BLINDAGEM TOTAL
  ===================== */
  const stats: NumeroStats[] = Array.isArray(data?.estatisticas)
    ? data!.estatisticas
    : [];

  const ciclo: Ciclo = data?.ciclo ?? { faltam: [], total_faltam: 0 };
  const analise = data?.analise;

  /* =====================
     DADOS DERIVADOS
  ===================== */
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
      {/* HEADER */}
      <section className="gradient-hero py-12 md:py-16">
        <div className="container text-white">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Análise Estatística
          </h1>
          <p className="text-white/80">
            Referência: {analise?.data_referencia}
          </p>
        </div>
      </section>

      <div className="container py-8 space-y-8">

        {/* BLOCO 1 — RESUMO */}
        {analise && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ResumoCard icon={<TrendingUp size={16} />} label="Soma Média" value={analise.soma_media} />
            <ResumoCard icon={<Hash size={16} />} label="Pares" value={analise.pares_media} />
            <ResumoCard icon={<Hash size={16} />} label="Ímpares" value={analise.impares_media} />
            <ResumoCard icon={<Zap size={16} />} label="Primos" value={analise.primos_media} />
          </div>
        )}

        {/* BLOCO 2 — CICLO */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock size={18} /> Ciclo Atual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {ciclo.faltam.length > 0 ? (
                ciclo.faltam.map((n) => (
                  <LotteryBall key={n} number={n} variant="outline" />
                ))
              ) : (
                <Badge variant="secondary">🎯 Ciclo Completo</Badge>
              )}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              TOTAL PENDENTE: {ciclo.total_faltam}
            </p>
          </CardContent>
        </Card>

        {/* BLOCO 3 — GRÁFICO */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 size={18} /> Frequência por Dezena
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {frequenciaData.length > 0 && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={frequenciaData}>
                  <XAxis dataKey="numero" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="frequencia">
                    {frequenciaData.map((e, i) => (
                      <Cell
                        key={i}
                        fill={
                          e.isTop
                            ? "hsl(var(--primary))"
                            : "hsl(var(--muted-foreground)/0.3)"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* BLOCO 4 — TABELA */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target size={18} /> Estatísticas Detalhadas
            </CardTitle>
          </CardHeader>
          <CardContent>
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
                    <TableCell>
                      <LotteryBall number={n.numero} size="sm" />
                    </TableCell>
                    <TableCell>{n.frequencia}x</TableCell>
                    <TableCell>
                      <Badge variant={n.atraso > 4 ? "destructive" : "secondary"}>
                        {n.atraso} concursos
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold">
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

/* =====================
   CARD AUXILIAR
===================== */
function ResumoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2 uppercase font-semibold">
          {icon} {label}
        </div>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
