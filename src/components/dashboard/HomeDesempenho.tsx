import { useQuery } from "@tanstack/react-query";
import { getDesempenhoGerador } from "@/services/home";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function HomeDesempenho() {
  const { data, isLoading } = useQuery({
    queryKey: ["desempenho-gerador"],
    queryFn: getDesempenhoGerador,
  });

  if (isLoading) return null;
  if (!data || data.status !== "ok") return null;

  const resumo = data.resumo;
  // Captura o novo campo unificado que adicionamos no back-end
  const totalPalpites = data.total_palpites_avaliados || 0; 

  return (
    <Card>
      <CardHeader>
        <CardTitle>Desempenho Histórico do Gerador</CardTitle>
        <p className="text-xs text-muted-foreground">
          Total de {totalPalpites} palpites avaliados
        </p>
      </CardHeader>
      <CardContent className="flex gap-4 flex-wrap">
        {Object.entries(resumo).map(([pontos, qtd]) => (
          <div key={pontos} className="text-sm bg-secondary px-3 py-1 rounded-md">
            <strong className="text-primary">{Number(qtd)}</strong>x {pontos} acertos
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
