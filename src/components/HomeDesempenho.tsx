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


return (
<Card>
<CardHeader>
<CardTitle>Desempenho do Gerador em 2026</CardTitle>
</CardHeader>
<CardContent className="flex gap-4 flex-wrap">
{Object.entries(resumo).map(([pontos, qtd]) => (
<div key={pontos} className="text-sm">
<strong>{qtd}</strong>x {pontos} pontos
</div>
))}
</CardContent>
</Card>
);
}
