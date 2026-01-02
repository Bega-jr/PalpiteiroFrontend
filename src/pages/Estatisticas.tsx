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
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["estatisticasBase"],
    queryFn: getEstatisticasScore,
    staleTime: 1000 * 60 * 10, // 10 minutos
    retry: 1, // Tenta novamente uma vez se falhar
  });

  // 1. Estado de Carregamento
  if (isLoading) {
    return (
      <Layout>
        <div className="container py-12">
          <LoadingStats />
        </div>
      </Layout>
    );
  }

  // 2. Tratamento de Erro ou Dados Inexistentes (Previne o crash Object.keys)
  if (isError || !data || !data.frequencia_numeros) {
    return (
      <Layout>
        <div className="container py-12">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro ao carregar dados</AlertTitle>
            <AlertDescription>
              Não foi possível recuperar as estatísticas do Supabase. 
              Verifique a conexão ou se os dados foram processados.
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  // 3. Transformação segura de dados
  // Usamos o operador ?. e fallback para objeto vazio {} para garantir que Object.keys nunca receba null
  const stats = Object.keys(data.frequencia_numeros || {}).map((num) => {
    const frequencia = data.frequencia_numeros[num] || 0;
    const atraso = data.atraso?.[num] ?? 0; // Fallback se o número não existir no objeto de atraso
    
    return {
      numero: Number(num),
      frequencia,
      atraso,
      score: frequencia - atraso,
    };
  });

  // 4. Ordenação por Score (do maior para o menor)
  const sortedByScore = [...stats].sort((a, b) => b.score - a.score);

  return (
    <Layout>
      <div className="container py-12 space-y-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Estatísticas Avançadas</h1>
          <p className="text-muted-foreground">
            Dados pré-calculados baseados na frequência histórica e atraso atual.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Ranking por Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Pos.</TableHead>
                    <TableHead>Número</TableHead>
                    <TableHead className="text-right">Frequência</TableHead>
                    <TableHead className="text-right">Atraso</TableHead>
                    <TableHead className="text-right font-bold text-primary">Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedByScore.length > 0 ? (
                    sortedByScore.map((s, i) => (
                      <TableRow key={s.numero}>
                        <TableCell className="font-medium text-muted-foreground">
                          {i + 1}º
                        </TableCell>
                        <TableCell>
                          <LotteryBall number={s.numero} size="sm" />
                        </TableCell>
                        <TableCell className="text-right">
                          {s.frequencia}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge 
                            variant={s.atraso >= 10 ? "destructive" : s.atraso >= 5 ? "warning" : "secondary"}
                          >
                            {s.atraso}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold">
                          {s.score > 0 ? `+${s.score}` : s.score}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10">
                        Nenhum dado encontrado para os filtros atuais.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
