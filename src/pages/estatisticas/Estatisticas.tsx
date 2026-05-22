import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout/Layout";
import { LotteryBall } from "@/components/palpites/LotteryBall";
import { LoadingStats } from "@/components/feedback/LoadingStates";

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
  Zap,
  Sigma,
  Calendar,
  Repeat,
  Hash,
  AlertCircle,
  Flame,
  Snowflake,
  Clock,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

/* =====================
   TIPOS (BACKEND REAL)
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

type Listas = {
  numeros_quentes: number[];
  numeros_frios: number[];
  atrasados_ranking: number[];
};

type EstatisticasResponse = {
  estatisticas: NumeroStat[];
  analise: Analise;
  ciclo: Ciclo;
  listas: Listas;
  meta: {
    fonte: string;
    total_numeros: number;
  };
};

export default function Estatisticas() {
  /* =====================
     QUERY
  ===================== */
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
     MEMOS
  ===================== */
  const stats = data?.estatisticas ?? [];

  const sortedByScore = useMemo(
    () => [...stats].sort((a, b) => b.score - a.score),
    [stats]
  );

  const top10 = useMemo(() => sortedByScore.slice(0, 10), [sortedByScore]);

  const frequenciaData = useMemo(() => {
    return [...stats]
      .sort((a, b) => a.numero - b.numero)
      .map((s) => ({
        numero: String(s.numero).padStart(2, "0"),
        frequencia: s.frequencia,
        isTop: top10.some((t) => t.numero === s.numero),
      }));
  }, [stats, top10]);

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
              Não foi possível carregar as estatísticas.
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  /* =====================
     RENDER
  ===================== */
  return (
    <Layout>
      {/* HEADER */}
      <section className="gradient-hero text-primary-foreground py-12">
        <div className="container text-white">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Estatísticas da Lotofácil
          </h1>
          <p className="text-white/80">
            Referência: {data.analise.data_referencia}
          </p>
        </div>
      </section>

      <div className="container py-10 space-y-8">

        {/* RESUMO */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sigma className="h-5 w-5" />
              Resumo Estatístico
            </CardTitle>
          </CardHeader>

          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Resumo label="Soma média" value={data.analise.soma_media} />
            <Resumo
              label="Pares / Ímpares"
              value={`${data.analise.pares_media} / ${data.analise.impares_media}`}
            />
            <Resumo label="Primos" value={data.analise.primos_media} />
            <Resumo
              label="Fonte"
              value={data.meta.fonte}
              icon={<Calendar className="h-4 w-4" />}
            />
          </CardContent>
        </Card>

        {/* LISTAS */}
        <Card>
          <CardHeader>
            <CardTitle>Destaques Estatísticos</CardTitle>
          </CardHeader>

          <CardContent className="grid md:grid-cols-3 gap-6">
            <Lista
              titulo="Quentes"
              icon={<Flame className="h-4 w-4" />}
              numeros={data.listas.numeros_quentes}
            />
            <Lista
              titulo="Frios"
              icon={<Snowflake className="h-4 w-4" />}
              numeros={data.listas.numeros_frios}
            />
            <Lista
              titulo="Mais Atrasados"
              icon={<Clock className="h-4 w-4" />}
              numeros={data.listas.atrasados_ranking}
            />
          </CardContent>
        </Card>

        {/* CICLO */}
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
              Total faltando: <strong>{data.ciclo.total_faltam}</strong>
            </p>
          </CardContent>
        </Card>

        {/* GRÁFICO */}
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

        {/* TABELA */}
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
                {sortedByScore.map((n, i) => (
                  <TableRow key={n.numero} className={i < 10 ? "bg-primary/5" : ""}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>
                      <LotteryBall number={n.numero} size="sm" active={i < 10} />
                    </TableCell>
                    <TableCell>{n.frequencia}</TableCell>
                    <TableCell>
                      <Badge variant={n.atraso >= 5 ? "destructive" : "secondary"}>
                        {n.atraso}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">
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
   COMPONENTES AUX
===================== */
function Resumo({
  label,
  value,
  icon,
}: {
  label: string;
  value: number | string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border p-4 text-center">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold flex justify-center gap-1 items-center">
        {icon}
        {value}
      </p>
    </div>
  );
}

function Lista({
  titulo,
  numeros,
  icon,
}: {
  titulo: string;
  numeros: number[];
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="font-semibold mb-2 flex items-center gap-1">
        {icon}
        {titulo}
      </h3>
      <div className="flex flex-wrap gap-2">
        {numeros.map((n) => (
          <LotteryBall key={n} number={n} />
        ))}
      </div>
    </div>
  );
}
