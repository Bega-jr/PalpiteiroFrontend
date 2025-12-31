import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { ConcursoCard } from "@/components/ConcursoCard";
import { LoadingCard } from "@/components/LoadingStates";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getUltimoConcurso } from "@/lib/api";
import {
  Clover, BarChart3, Trophy, ArrowRight, Sparkles, TrendingUp, Target, Shield, MapPin, RefreshCw
} from "lucide-react";

export default function Home() {
  const queryClient = useQueryClient();
  const { data: c, isLoading, isFetching } = useQuery({
    queryKey: ["ultimoConcurso"],
    queryFn: getUltimoConcurso,
    staleTime: 1000 * 60 * 30, // 30 minutos
  });

  const forceRefresh = () => {
    localStorage.removeItem("palpiteiro_concurso_cache");
    localStorage.removeItem("palpiteiro_cache_time");
    queryClient.invalidateQueries({ queryKey: ["ultimoConcurso"] });
  };

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

  const dezenas = c ? extrairDezenas(c) : [];
  const pares = dezenas.filter(n => n % 2 === 0).length;
  const impares = dezenas.length - pares;
  const somaTotal = dezenas.reduce((a, b) => a + b, 0);
  const estaAcumulado = c?.acumulado === "True" || c?.acumulado === true || Number(c?.ganhadores_15) === 0;

  return (
    <Layout>
      {/* 1. HERO SECTION */}
      <section className="gradient-hero text-primary-foreground py-16 md:py-24 text-center">
        <div className="container space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm border border-white/10 animate-fade-in">
            <Sparkles className="h-4 w-4 text-yellow-300" />
            Dados Oficiais de Hoje: 31/12/2025
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold">Lotofácil <span className="text-primary">Estatística</span></h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
            Analise o comportamento das dezenas e gere palpites otimizados com base no histórico real.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg" className="gradient-accent shadow-glow transition-all active:scale-95">
              <Link to="/palpites">Gerar Palpites</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 2. DASHBOARD DE RESULTADOS */}
      <section className="py-12 container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display text-2xl font-bold">Último Sorteio</h2>
            <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Sincronizado com a base oficial</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={forceRefresh} variant="outline" size="sm" className="h-9 gap-2" disabled={isFetching}>
              <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
              {isFetching ? 'Atualizando...' : 'Atualizar'}
            </Button>
            <Button asChild variant="ghost" size="sm" className="h-9"><Link to="/resultados">Ver Todos</Link></Button>
          </div>
        </div>

        {isLoading ? <LoadingCard /> : c ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6">
            
            <ConcursoCard concurso={c.concurso || c.numero} data={c.data || c.data_concurso} dezenas={dezenas} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-none shadow-md bg-slate-950 text-white">
                <CardContent className="p-6">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                    <BarChart3 className="h-3 w-3" /> Inteligência de Jogo
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-3xl font-bold">{pares}P / {impares}Í</p>
                      <p className="text-[10px] text-slate-500 uppercase mt-1">Equilíbrio Par/Ímpar</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold">{somaTotal}</p>
                      <p className="text-[10px] text-slate-500 uppercase mt-1">Soma das Dezenas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md bg-primary text-primary-foreground">
                <CardContent className="p-6">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-2">Próximo Sorteio Estimado</h3>
                  <div className="flex justify-between items-end">
                    <p className="text-3xl font-black">{formatarMoeda(c.estimativa_proximo)}</p>
                    <Button asChild variant="secondary" size="sm" className="font-bold uppercase text-[10px] tracking-tighter shadow-sm"><Link to="/palpites">Jogar agora</Link></Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Premiação Detalhada */}
            <Card className="border-none shadow-md bg-white overflow-hidden">
              <div className="bg-muted/30 px-6 py-4 border-b flex justify-between items-center">
                <h3 className="font-display font-bold text-sm uppercase tracking-wider flex items-center gap-2"><Trophy className="h-4 w-4 text-lottery-gold" /> Ganhadores e Rateio</h3>
              </div>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-gray-50/50 font-bold">
                      <tr>
                        <th className="px-6 py-4">Acertos</th>
                        <th className="px-6 py-4 text-center">Ganhadores</th>
                        <th className="px-6 py-4 text-right">Prêmio</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {[
                        { label: "15 Acertos", g: c.ganhadores_15, v: c.valor_15, h: true },
                        { label: "14 Acertos", g: c.ganhadores_14, v: c.valor_14, h: false },
                        { label: "13 Acertos", g: c.ganhadores_13, v: c.valor_13, h: false },
                        { label: "12 Acertos", g: c.ganhadores_12, v: c.valor_12, h: false },
                        { label: "11 Acertos", g: c.ganhadores_11, v: c.valor_11, h: false },
                      ].map((f, i) => (
                        <tr key={i} className={`hover:bg-gray-50/50 ${f.h ? 'bg-primary/5' : ''}`}>
                          <td className={`px-6 py-4 font-bold ${f.h ? 'text-primary' : ''}`}>{f.label}</td>
                          <td className="px-6 py-4 text-center">{Number(f.g || 0).toLocaleString('pt-BR')}</td>
                          <td className={`px-6 py-4 text-right font-bold ${f.h ? 'text-primary' : 'text-gray-700'}`}>{formatarMoeda(f.v)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Cidades Premiadas (Dinâmico da API da Caixa) */}
            {c.listaMunicipioUFGanhadores && c.listaMunicipioUFGanhadores.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 px-2">
                  <MapPin className="h-3 w-3 text-red-500" /> Onde saíram as apostas de 15 acertos:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {c.listaMunicipioUFGanhadores.map((item: any, idx: number) => (
                    <div key={idx} className="bg-white border rounded-full px-4 py-1.5 text-xs shadow-sm flex items-center gap-2 hover:border-primary transition-all">
                      <span className="font-black text-primary">{item.uf}</span>
                      <span className="text-gray-700 font-medium">{item.municipio}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <p className="text-[10px] text-center text-muted-foreground italic">Arrecadação total deste concurso: {formatarMoeda(c.arrecadacao)}</p>
          </div>
        ) : (
          <div className="text-center py-20 border rounded-3xl bg-muted/10">Dados indisponíveis.</div>
        )}
      </section>
    </Layout>
  );
}

