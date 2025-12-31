import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { ConcursoCard } from "@/components/ConcursoCard";
import { LoadingCard } from "@/components/LoadingStates";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getUltimoConcurso } from "@/lib/api";
import {
  Clover, BarChart3, Trophy, ArrowRight, Sparkles, TrendingUp, Target, Shield, MapPin, RefreshCw, Info
} from "lucide-react";

export default function Home() {
  const queryClient = useQueryClient();
  const { data: c, isLoading, isFetching } = useQuery({
    queryKey: ["ultimoConcurso"],
    queryFn: getUltimoConcurso,
    staleTime: 1000 * 60 * 30,
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
      <section className="gradient-hero text-primary-foreground py-16 md:py-24 text-center">
        <div className="container space-y-6 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm border border-white/10">
            <Sparkles className="h-4 w-4 text-yellow-300" />
            Estatísticas Lotofácil Atualizadas 2025
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold">Aumente suas <span className="text-primary">Chances</span></h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">Análise de paridade, soma e detalhamento geográfico dos últimos sorteios.</p>
          <Button asChild size="lg" className="gradient-accent shadow-glow transition-all active:scale-95">
            <Link to="/palpites">Gerar Palpites</Link>
          </Button>
        </div>
      </section>

      <section className="py-12 container">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display text-2xl font-bold tracking-tight text-gray-900">Resultado Oficial</h2>
          <Button onClick={forceRefresh} variant="outline" size="sm" className="gap-2 h-9" disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            {isFetching ? 'Buscando...' : 'Atualizar'}
          </Button>
        </div>

        {isLoading ? <LoadingCard /> : c ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
            
            <ConcursoCard concurso={c.concurso || c.numero} data={c.data || c.data_concurso} dezenas={dezenas} />

            {/* Dashboard Estatístico */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-none shadow-md bg-slate-950 text-white">
                <CardContent className="p-6">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                    <BarChart3 className="h-3 w-3" /> Inteligência Estatística
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-3xl font-bold leading-none">{pares}P <span className="text-slate-600">/</span> {impares}Í</p>
                      <p className="text-[10px] text-slate-500 uppercase mt-2 font-medium">Equilíbrio Par/Ímpar</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold leading-none">{somaTotal}</p>
                      <p className="text-[10px] text-slate-500 uppercase mt-2 font-medium">Soma das Dezenas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md bg-primary text-primary-foreground">
                <CardContent className="p-6">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-2">Próximo Prêmio Estimado</h3>
                  <div className="flex justify-between items-end">
                    <p className="text-3xl font-black">{formatarMoeda(c.estimativa_proximo)}</p>
                    {estaAcumulado && <span className="text-[9px] bg-white/20 px-2 py-1 rounded font-bold mb-1">ACUMULOU</span>}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* CIDADES GANHADORAS - Ajustado para ser mais flexível no mapeamento */}
            {(c?.listaMunicipioUFGanhadores || c?.municipios || c?.ganhadores_por_cidade) && (
              <Card className="border-none shadow-sm bg-white overflow-hidden mt-6">
                <div className="bg-red-50 px-6 py-3 border-b border-red-100 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-red-500" />
                  <h3 className="font-display font-bold text-xs uppercase tracking-wider text-red-700">
                    Onde saíram os prêmios (15 acertos)
                  </h3>
                </div>
                <CardContent className="p-4">
                  <div className="flex flex-wrap gap-2">
                    {/* Tentamos mapear listaMunicipioUFGanhadores ou qualquer outro nome que o Python possa ter enviado */}
                    {(c.listaMunicipioUFGanhadores || c.municipios || []).map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 bg-gray-50 border border-gray-100 px-3 py-2 rounded-xl text-sm hover:border-red-200 transition-colors">
                        <span className="font-black text-red-600">{item.uf || item.siglaUF}</span>
                        <span className="text-gray-400">|</span>
                        <span className="font-semibold text-gray-700">{item.municipio || item.nomeMunicipio}</span>
                        <span className="bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                          {item.ganhadores || item.quantidadeGanhadores || 1} {item.ganhadores > 1 ? 'apostas' : 'aposta'}
                        </span>
                      </div>
                    ))}
                    
                    {/* Se houver ganhadores mas a lista de cidades estiver vazia, é Canal Eletrônico */}
                    {(Number(c.ganhadores_15) > 0 && (!c.listaMunicipioUFGanhadores || c.listaMunicipioUFGanhadores.length === 0)) && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground italic p-2">
                        <Info className="h-4 w-4" />
                        Apostas premiadas realizadas pelo Canal Eletrônico.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}


            {/* Tabela de Rateio */}
            <Card className="border-none shadow-md bg-white overflow-hidden">
              <div className="bg-muted/30 px-6 py-4 border-b flex justify-between items-center">
                <h3 className="font-display font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-lottery-gold" /> Rateio e Premiação
                </h3>
              </div>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-gray-50/50 font-bold">
                    <tr>
                      <th className="px-6 py-4">Acertos</th>
                      <th className="px-6 py-4 text-center">Ganhadores</th>
                      <th className="px-6 py-4 text-right">Prêmio Individual</th>
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
                        <td className={`px-6 py-4 font-bold ${f.h ? 'text-primary' : 'text-gray-900'}`}>{f.label}</td>
                        <td className="px-6 py-4 text-center">{Number(f.g || 0).toLocaleString('pt-BR')}</td>
                        <td className={`px-6 py-4 text-right font-bold ${f.h ? 'text-primary' : 'text-gray-700'}`}>{formatarMoeda(f.v)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
            
            <div className="flex items-center justify-center gap-2 text-muted-foreground opacity-70">
              <Info className="h-3 w-3" />
              <p className="text-[10px] uppercase font-medium">Arrecadação Total: {formatarMoeda(c.arrecadacao)}</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 border rounded-3xl bg-muted/10">Não foi possível carregar os dados oficiais.</div>
        )}
      </section>
    </Layout>
  );
}

