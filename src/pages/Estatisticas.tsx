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
import { getEstatisticasScore } from "@/lib/api";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Estatisticas() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["estatisticasBase"],
    queryFn: getEstatisticasScore,
    staleTime: 1000 * 60 * 10,
  });

  // Processamento inteligente dos dados
  const stats = useMemo(() => {
    if (!data) return [];

    // Caso A: API retorna Array [ {numero: 1, frequencia: 10, atraso: 2}, ... ]
    if (Array.isArray(data)) {
      return data.map((item: any) => ({
        numero: Number(item.numero),
        frequencia: item.frequencia || 0,
        atraso: item.atraso || 0,
        score: (item.frequencia || 0) - (item.atraso || 0),
      }));
    }

    // Caso B: API retorna Objeto { frequencia_numeros: { "1": 10 }, atraso: { "1": 2 } }
    if (data.frequencia_numeros) {
      return Object.keys(data.frequencia_numeros).map((num) => {
        const freq = data.frequencia_numeros[num] || 0;
        const atr = data.atraso?.[num] || 0;
        return {
          numero: Number(num),
          frequencia: freq,
          atraso: atr,
          score: freq - atr,
        };
      });
    }

    return [];
  }, [data]);

  const sortedByScore = useMemo(() => 
    [...stats].sort((a, b) => b.score - a.score), 
  [stats]);

  if (isLoading) {
    return <Layout><div className="container py-12"><LoadingStats /></div></Layout>;
  }

  if (isError || stats.length === 0) {
    return (
      <Layout>
        <div className="container py-12">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Atenção</AlertTitle>
            <AlertDescription>
              Não foi possível processar as estatísticas. Verifique se o banco de dados Supabase está populado.
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-12 space-y-8">
        <h1 className="text-3xl font-bold">Estatísticas por Score</h1>
        <Card>
          <CardHeader>
            <CardTitle>Ranking de Probabilidade</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pos.</TableHead>
                  <TableHead>Número</TableHead>
                  <TableHead className="text-right">Frequência</TableHead>
                  <TableHead className="text-right">Atraso</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedByScore.map((s, i) => (
                  <TableRow key={s.numero}>
                    <TableCell>{i + 1}º</TableCell>
                    <TableCell><LotteryBall number={s.numero} size="sm" /></TableCell>
                    <TableCell className="text-right">{s.frequencia}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={s.atraso >= 5 ? "destructive" : "secondary"}>
                        {s.atraso}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold">
                      {s.score}
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
