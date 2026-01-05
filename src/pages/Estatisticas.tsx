import { useMemo } from "react";
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
import { api } from "@/lib/api";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
} from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import { TrendingUp, Clock, Zap, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

/* =========================
   Tipagem
========================= */
type EstatisticaNumero = {
  numero: number;
  frequencia: number;
  atraso: number;
  score: number;
};

type EstatisticasResponse = {
  estatisticas: EstatisticaNumero[];
  analise: {
    soma_media: number;
    pares_media: number;
    impares_media: number;
    primos_media: number;
    data_referencia: string;
  };
  ciclo: {
    faltam: number[];
    total_faltam: number;
  };
  meta: {
    data_referencia: string;
    total_numeros: number;
    fonte: string;
  };
};

export default function Estatisticas() {
  /* =========================
     React Query
  ========================= */
  const { data, isLoading, isError } = useQuery<EstatisticasResponse>({
    queryKey: ["estatisticas"],
    queryFn: async () => {
      const res = await api.get("/estatisticas/");
      return res.data;
    },
    staleTime: 1000 * 60 * 10,
    retry: 2,
  });

  /* =========================
     Dados principais
  ========================= */
  const stats = useMemo<EstatisticaNumero[]>(() => {
    return data?.estatisticas ?? [];
  }, [data]);

  const sortedByScore = useMemo(
    () => [...stats].sort((a, b) => b.score - a.score),
    [stats]
  );

  const top10 = sortedByScore.slice(0, 10);

  /* =========================
     Gráfico Frequência
  ========================= */
  const frequenciaData = useMemo(
    () =>
      stats
        .map((s) => ({
          numero: String(s.numero).padStart(2, "0"),
          frequencia: s.frequencia,
          isTop: top10.some((t) => t.numero === s.numero),
        }))
        .sort((a, b) => Number(a.numero) - Number(b.numero)),
    [stats, top10]
  );

  /* =========================
     Gráfico Atraso
  ========================= */
  const atrasoData = useMemo(
    () =>
      stats
        .map((s) => ({
          numero: String(s.numero).padStart(2, "0"),
          atraso: s.atraso,
          isHot: s.atraso >= 5,
        }))
        .sort((a, b) => Number(a.numero) - Number(b.numero)),
    [stats]
  );

  /* =========================
     Estados
  ========================= */
  if (isLoading) {
    return (
      <Layout>
        <div className="container py-12">
          <LoadingStats />
        </div>
      </Layout>
    );
  }

  if (isError || stats.length === 0) {
    return (
      <Layout>
        <section className="gradient-hero text-primary-foreground py-12">
          <div className="container text-center">
            <h1 className="text-3xl font-bold">
              Estatísticas da Lotofácil
            </h1>
          </div>
        </section>

        <div className="container py-12">
          <Alert variant="destructive" className="max-w-2xl mx-auto">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle>Indisponível</AlertTitle>
            <AlertDescription>
              Não foi possível carregar as estatísticas.  
              Verifique se o processamento diário foi executado.
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  /* =========================
     Render
  ========================= */
  return (
    <Layout>
      <section className="gradient-hero text-primary-foreground py-12 md:py-16">
        <div className="container">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Estatísticas da Lotofácil
          </h1>
          <p className="text-white/80">
            Base de referência: {data?.meta.data_referencia}
          </p>
        </div>
      </section>

      <div className="container py-8 space-y-10">
        {/* Frequência */}
        <Card>
          <CardHeader>
            <CardTitle className="flex gap-2 items-center">
              <TrendingUp className="h-5 w-5" />
              Frequência dos Números
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ frequencia: { label: "Frequência" } }} className="h-[350px]">
              <ResponsiveContainer>
                <BarChart data={frequenciaData}>
                  <XAxis dataKey="numero" interval={0} angle={-45} height={60} />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="frequencia" radius={[6, 6, 0, 0]}>
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
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Atraso */}
        <Card>
          <CardHeader>
            <CardTitle className="flex gap-2 items-center">
              <Clock className="h-5 w-5" />
              Atraso Atual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ atraso: { label: "Atraso" } }} className="h-[350px]">
              <ResponsiveContainer>
                <BarChart data={atrasoData}>
                  <XAxis dataKey="numero" interval={0} angle={-45} height={60} />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="atraso" radius={[6, 6, 0, 0]}>
                    {atrasoData.map((e, i) => (
                      <Cell
                        key={i}
                        fill={
                          e.isHot
                            ? "hsl(var(--destructive))"
                            : "hsl(var(--muted-foreground)/0.3)"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Ranking */}
        <Card>
          <CardHeader>
            <CardTitle className="flex gap-2 items-center">
              <Zap className="h-5 w-5 text-purple-500" />
              Ranking por Score
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center w-16">#</TableHead>
                  <TableHead className="text-center">Número</TableHead>
                  <TableHead className="text-right">Freq.</TableHead>
                  <TableHead className="text-right">Atraso</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {sortedByScore.map((s, i) => (
                  <TableRow key={s.numero} className={i < 10 ? "bg-primary/5" : ""}>
                    <TableCell className="text-center font-bold">
                      {i + 1}
                    </TableCell>
                    <TableCell className="text-center">
                      <LotteryBall number={s.numero} size="sm" active={i < 10} />
                    </TableCell>
                    <TableCell className="text-right">{s.frequencia}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={s.atraso >= 5 ? "destructive" : "secondary"}>
                        {s.atraso}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-primary">
                      {s.score.toFixed(2)}
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
