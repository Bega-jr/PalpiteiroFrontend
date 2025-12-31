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

export default function Estatisticas() {
  const { data, isLoading } = useQuery({
    queryKey: ["estatisticasBase"],
    queryFn: getEstatisticasScore,
    staleTime: 1000 * 60 * 10,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-12">
          <LoadingStats />
        </div>
      </Layout>
    );
  }

  const stats = Object.keys(data.frequencia_numeros).map((num) => ({
    numero: Number(num),
    frequencia: data.frequencia_numeros[num],
    atraso: data.atraso[num],
    score: data.frequencia_numeros[num] - data.atraso[num],
  }));

  const sortedByScore = [...stats].sort((a, b) => b.score - a.score);

  return (
    <Layout>
      <div className="container py-12 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Ranking por Score</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Número</TableHead>
                  <TableHead className="text-right">Frequência</TableHead>
                  <TableHead className="text-right">Atraso</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedByScore.map((s, i) => (
                  <TableRow key={s.numero}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>
                      <LotteryBall number={s.numero} size="sm" />
                    </TableCell>
                    <TableCell className="text-right">
                      {s.frequencia}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={s.atraso >= 5 ? "destructive" : "secondary"}>
                        {s.atraso}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">
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
