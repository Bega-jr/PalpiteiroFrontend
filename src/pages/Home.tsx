import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { ConcursoCard } from "@/components/ConcursoCard";
import { LoadingCard } from "@/components/LoadingStates";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getUltimoConcurso } from "@/lib/api";
import {
  Clover,
  BarChart3,
  Trophy,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Target,
  Shield,
  MapPin,
  Info
} from "lucide-react";

export default function Home() {
  const { data: c, isLoading } = useQuery({
    queryKey: ["ultimoConcurso"],
    queryFn: getUltimoConcurso,
    staleTime: 1000 * 60 * 5,
  });

  // Função para tratar dezenas vindas do CSV ou API JSON
  const extrairDezenas = (dados: any) => {
    if (dados?.dezenas && Array.isArray(dados.dezenas)) return dados.dezenas;
    const dezenas = [];
    for (let i = 1; i <= 15; i++) {
      if (dados[`bola${i}`] !== undefined) dezenas.push(Number(dados[`bola${i}`]));
    }
    return dezenas.sort((a, b) => a - b);
  };

  const formatarMoeda = (valor: any) => {
    return Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Cálculos Estatísticos em tempo real
  const dezenas = c ? extrairDezenas(c) : [];
  const pares = dezenas.filter(n => n % 2 === 0).length;
  const impares = dezenas.length - pares;
  const somaTotal = dezenas.reduce((a, b) => a + b, 0);
  const estaAcumulado = c?.acumulado === "True" || c?.acumulado === true || Number(c?.ganhadores_15) === 0;

  return (
    <Layout>
      {/* Hero Section */}
      <section className="gradient-hero text-primary-foreground py-16 md:py-24">
        <div className="container text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm border border-white/10 animate-fade-in">
            <Sparkles className="h-4 w-4 text-yellow-300" />
            Análise Estatística Lotofácil 2025
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight">
            Aumente suas <span className="text-primary">Chances</span>
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Resultados oficiais sincronizados com algoritmos de paridade, soma e frequência.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Button asChild size="lg" className="gradient-accent shadow-glow hover:scale-105 transition-all">
              <Link to="/palpites">Gerar Palpites Agora</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Resultados e Análises */}
      <section className="py-12 container">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display text-2xl font-bold">Painel do Último Sorteio</h2>
          <Button asChild variant="ghost" className="hover:gap-2 transition-all">
            <Link to="/resultados">Ver Todos <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>

        {isLoading ? <LoadingCard /> : c ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
            
            <ConcursoCard 
              concurso={c.concurso || c.numero} 
              data={c.data || c.data_concurso} 
              dezenas={dezenas} 
            />

            {/* Grid de Análise e Próximo Jogo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-none shadow-md bg-slate-900 text-white">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                      <BarChart3 className="h-3 w-3" /> Análise Técnica
                    </h3>
                    {estaAcumulado && (
                      <span className="text-[9px] bg-yellow-500 text-black px-2 py-1 rounded font-black">ACUMULOU</span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center md:text-left">
                    <div>
                      <p className="text-3xl font-bold">{pares}P <span className="text-slate-500">/</span> {impares}Í</p>
                      <p className="text-[10px] text-slate-400 uppercase mt-1">Pares e Ímpares</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold">{somaTotal}</p>
                      <p className="text-[10px] text-slate-400 uppercase mt-1">Soma Total</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md bg-primary text-primary-foreground">
                <CardContent className="p-6 flex flex-col justify-between h-full">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-2">Próximo Concurso Estimado</h3>
                  <div className="flex justify-between items-end">
                    <p className="text-3xl font-black">{formatarMoeda(c.estimativa_proximo)}</p>
                    <Button asChild variant="secondary" size="sm" className="font-bold">
                      <Link to="/palpites">Jogar agora</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabela de Ganhadores */}
            <Card className="border-none shadow-md bg-white overflow-hidden">
              <div className="bg-muted/30 px-6 py-4 border-b flex justify-between items-center">
                <h3 className="font-display font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-lottery-gold" /> Rateio Detalhado
                </h3>
              </div>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-gray-50/50">
                      <tr>
                        <th className="px-6 py-4">Acertos</th>
                        <th className="px-6 py-4 text-center">Ganhadores</th>
                        <th className="px-6 py-4 text-right">Prêmio</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {[
                        { label: "15 Acertos", ganhadores: c.ganhadores_15, valor: c.valor_15, highlight: true },
                        { label: "14 Acertos", ganhadores: c.ganhadores_14, valor: c.valor_14 },
                        { label: "13 Acertos", ganhadores: c.ganhadores_13, valor: c.valor_13 },
                        { label: "12 Acertos", ganhadores: c.ganhadores_12, valor: c.valor_12 },
                        { label: "11 Acertos", ganhadores: c.ganhadores_11, valor: c.valor_11 },
                      ].map((f, i) => (
                        <tr key={i} className={f.highlight ? 'bg-primary/5' : ''}>
                          <td className="px-6 py-4 font-bold">{f.label}</td>
                          <td className="px-6 py-4 text-center">{Number(f.ganhadores || 0).toLocaleString('pt-BR')}</td>
                          <td className={`px-6 py-4 text-right font-bold ${f.highlight ? 'text-primary' : ''}`}>{formatarMoeda(f.valor)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* CIDADES GANHADORAS - Nova Seção */}
            {c.listaMunicipioUFGanhadores && c.listaMunicipioUFGanhadores.length > 0 && (
              <Card className="border-none shadow-md bg-white">
                <div className="bg-muted/30 px-6 py-3 border-b flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-red-500" />
                  <h3 className="font-display font-bold text-sm uppercase tracking-wider">Cidades Premiadas (15 Acertos)</h3>
                </div>
                <CardContent className="p-4">
                  <div className="flex flex-wrap gap-2">
                    {c.listaMunicipioUFGanhadores.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 bg-gray-50 border px-3 py-2 rounded-lg text-xs">
                        <span className="font-bold text-primary">{item.uf}</span>
                        <span className="font-medium text-gray-700">{item.municipio}</span>
                        <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold">{item.ganhadores} aposta</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
                Arrecadação Total: {formatarMoeda(c.arrecadacao)}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 border-2 border-dashed rounded-3xl text-muted-foreground">
            Serviço indisponível no momento.
          </div>
        )}
      </section>
    </Layout>
  );
}

