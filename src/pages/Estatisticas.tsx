import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { Layout } from "@/components/Layout";
import { LotteryBall } from "@/components/LotteryBall";
import { LoadingStats } from "@/components/LoadingStates";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Tooltip,
} from "recharts";

import {
  TrendingUp,
  Clock,
  Zap,
  Sigma,
  Calendar,
  Repeat,
  Hash,
  AlertCircle,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

/* =====================
   TIPOS (BACKEND-ALIGNED)
===================== */
type NumeroStat = {
  numero: number;
  frequencia: number;
  atraso: number;
  score: number;
};

type Analise = {
  soma_media: number;
  pares_media: number;
  impares_media: number;
  primos_media: number;
  data_referencia: string;
};

type Ciclo = {
  faltam: number[];
  total_faltam: number;
};

type EstatisticasResponse = {
  estatisticas: NumeroStat[];
  analise: Analise;
  ciclo: Ciclo;
  meta: {
    data_referencia: string;
    total_numeros: number;
    fonte: string;
  };
};

export default function Estatisticas() {
  const { data, isLoading, isError } = useQuery<EstatisticasResponse>({
    queryKey: ["estatisticas"],
    queryFn: async () => {
      const res = await api.get("/estatisticas");
      return res.data;
    },
    staleTime: 1000 * 60 * 10,
    retry: 2,
  });

  /* =====================
     ESTADOS
  ===================== */
  if (isLoading) {
    return (
      <Layout>
        <div className="container py-12">
          <LoadingStats />
        </div>
      </Layout>
    );
  }

  if (isError || !data) {
    return (
      <Layout>
        <div className="container py-12">
          <Alert variant="destructive" className="max-w-2xl mx-auto">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle>Erro ao carregar</AlertTitle>
            <AlertDescription>
              Não foi possível carregar as estatísticas. Verifique o backend ou
              a atualização dos dados no Supabase.
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  /* =====================
     DADOS PROCESSADOS
  ===================== */
  const stats = data.estatisticas;

  const sortedByScore = useMemo(
    () => [...stats].sort((a, b) => b.score - a.score),
    [stats]
  );

  const top10 = sortedByScore.slice(0, 10);

  const frequenciaData = useMemo(
    () =>
      [...stats]
        .sort((a, b) => a.numero - b.numero)
        .map((s) => ({
          numero: String(s.numero).padStart(2, "0"),
          frequencia: s.frequencia,
          isTop: top10.some((t) => t.numero === s.numero),
        })),
    [stats, top10]
  );

  /* =====================
     RENDER
  ===================== */
  return (
    <Layout>
      {/* HEADER */}
      <section className="gradient-hero text-primary-foreground py-12 md:py-16">
        <div className="container text-white">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            Estatísticas da Lotofácil
          </h1>
          <p className="text-white/80">
            Referência: {data.analise.data_referencia}
          </p>
        </div>
      </section>

      <div className="container py-8 md:py-12 space-y-8">

        {/* =====================
            RESUMO ESTATÍSTICO
        ===================== */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sigma className="h-5 w-5" />
              Resumo Estatístico
            </CardTitle>
          </CardHeader>

          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-xl border p-4 text-center">
              <p className="text-sm text-muted-foreground">Soma média</p>
              <p className="text-2xl font-bold">
                {data.analise.soma_media}
              </p>
            </div>

            <div className="rounded-xl border p-4 text-center">
              <p className="text-sm text-muted-foreground">Pares / Ímpares</p>
              <p className="text-2xl font-bold">
                {data.analise.pares_media} / {data.analise.impares_media}
              </p>
            </div>

            <div className="rounded-xl border p-4 text-center">
              <p className="text-sm text-muted-foreground">Primos</p>
              <p className="text-2xl font-bold">
                {data.analise.primos_media}
              </p>
            </div>

            <div className="rounded-xl border p-4 text-center">
              <p className="text-sm text-muted-foreground">Referência</p>
              <p className="text-sm font-semibold flex justify-center gap-1 items-center">
                <Calendar className="h-4 w-4" />
                {data.analise.data_referencia}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* =====================
            CICLO ATUAL
        ===================== */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Repeat className="h-5 w-5" />
              Ciclo Atual
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex flex-wrap gap-3 mb-4">
              {data.ciclo.faltam.length > 0 ? (
                data.ciclo.faltam.map((n) => (
                  <LotteryBall key={n} number={n} />
                ))
              ) : (
                <Badge variant="secondary">🎯 Ciclo completo</Badge>
              )}
            </div>

            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Hash className="h-4 w-4" />
              Total faltando:{" "}
              <strong>{data.ciclo.total_faltam}</strong>
            </p>
          </CardContent>
        </Card>

        {/* =====================
            GRÁFICO DE FREQUÊNCIA
        ===================== */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Frequência por Dezena
            </CardTitle>
          </CardHeader>

          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={frequenciaData}>
                <XAxis dataKey="numero" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="frequencia">
                  {frequenciaData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={
                        entry.isTop
                          ? "hsl(var(--primary))"
                          : "hsl(var(--muted-foreground)/0.3)"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* =====================
            TABELA DETALHADA
        ===================== */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Ranking por Score
            </CardTitle>
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Número</TableHead>
                  <TableHead>Frequência</TableHead>
                  <TableHead>Atraso</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {sortedByScore.map((n, idx) => (
                  <TableRow
                    key={n.numero}
                    className={idx < 10 ? "bg-primary/5" : ""}
                  >
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>
                      <LotteryBall
                        number={n.numero}
                        size="sm"
                        active={idx < 10}
                      />
                    </TableCell>
                    <TableCell>{n.frequencia}</TableCell>
                    <TableCell>
                      <Badge
                        variant={n.atraso >= 5 ? "destructive" : "secondary"}
                      >
                        {n.atraso}
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
