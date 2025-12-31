import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { ConcursoCard } from "@/components/ConcursoCard";
import { LoadingCard } from "@/components/LoadingStates";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getUltimoConcurso } from "@/lib/api";
import { Trophy, TrendingUp, Target, Sparkles, Clover, BarChart3, ArrowRight } from "lucide-react";

export default function Home() {
  const { data: c, isLoading } = useQuery({
    queryKey: ["ultimoConcurso"],
    queryFn: getUltimoConcurso,
  });

  // Função para extrair dezenas das colunas bola1...bola15 do CSV
  const extrairDezenas = (dados: any) => {
    if (dados?.dezenas) return dados.dezenas;
    const dezenas = [];
    for (let i = 1; i <= 15; i++) {
      if (dados[`bola${i}`]) dezenas.push(dados[`bola${i}`]);
    }
    return dezenas;
  };

  return (
    <Layout>
      <section className="gradient-hero text-primary-foreground py-16 md:py-24 text-center">
        <div className="container space-y-6">
          <h1 className="font-display text-4xl md:text-6xl font-bold">Lotofácil <span className="text-primary">Inteligente</span></h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">Estatísticas reais e palpites otimizados baseados no histórico oficial.</p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg" className="gradient-accent shadow-glow"><Link to="/palpites">Gerar Palpites</Link></Button>
          </div>
        </div>
      </section>

      <section className="py-12 container">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display text-2xl font-bold">Último Resultado</h2>
          <Button asChild variant="ghost"><Link to="/resultados">Ver todos <ArrowRight className="ml-2 h-4" /></Link></Button>
        </div>

        {isLoading ? <LoadingCard /> : c ? (
          <div className="space-y-6">
            <ConcursoCard 
              concurso={c.concurso || c.numero} 
              data={c.data || c.data_concurso} 
              dezenas={extrairDezenas(c)} 
            />

            {/* Informações Relevantes do CSV */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-2 text-primary font-bold uppercase text-xs tracking-wider">
                    <Trophy className="h-4 w-4" /> Prêmio 15 Acertos
                  </div>
                  <div className="text-2xl font-bold">R$ {Number(c.valor_15 || 0).toLocaleString('pt-BR')}</div>
                  <p className="text-sm text-muted-foreground">{c.ganhadores_15 || 0} ganhadores oficiais</p>
                </CardContent>
              </Card>

              <Card className="bg-amber-50 border-amber-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-2 text-amber-600 font-bold uppercase text-xs tracking-wider">
                    <TrendingUp className="h-4 w-4" /> Próximo Estimado
                  </div>
                  <div className="text-2xl font-bold text-amber-700">R$ {Number(c.estimativa_proximo || 0).toLocaleString('pt-BR')}</div>
                  <p className="text-sm text-amber-600/80">{c.acumulado === "True" || c.acumulado === true ? "ACUMULOU!" : "Sorteio Regular"}</p>
                </CardContent>
              </Card>

              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-2 text-blue-600 font-bold uppercase text-xs tracking-wider">
                    <Target className="h-4 w-4" /> Arrecadação
                  </div>
                  <div className="text-2xl font-bold text-blue-700">R$ {Number(c.arrecadacao || 0).toLocaleString('pt-BR')}</div>
                  <p className="text-sm text-blue-600/80">Total investido no concurso</p>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="text-center p-12 border rounded-xl">Erro ao carregar dados do backend.</div>
        )}
      </section>
    </Layout>
  );
}
