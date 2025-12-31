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
  History,
  Trophy,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Target,
  Shield,
} from "lucide-react";

const features = [
  { icon: Sparkles, title: "Palpites Inteligentes", description: "Algoritmo estatístico avançado que analisa padrões históricos para gerar palpites otimizados." },
  { icon: BarChart3, title: "Análise Completa", description: "Frequência, atraso, score e ciclos de cada número. Dados atualizados em tempo real." },
  { icon: Target, title: "Filtros Profissionais", description: "Controle de soma, pares/ímpares, primos, moldura e similaridade entre palpites." },
  { icon: Shield, title: "Histórico Seguro", description: "Salve seus palpites e acompanhe resultados. Conferência automática de acertos." },
];

const quickLinks = [
  { href: "/palpites", icon: Clover, title: "Gerar Palpites", description: "7 palpites estatísticos diversificados", color: "bg-primary" },
  { href: "/estatisticas", icon: TrendingUp, title: "Ver Estatísticas", description: "Frequência, atraso e score dos números", color: "bg-lottery-blue" },
  { href: "/resultados", icon: Trophy, title: "Resultados", description: "Últimos sorteios da Lotofácil", color: "bg-lottery-gold" },
  { href: "/historico", icon: History, title: "Meu Histórico", description: "Acompanhe seus jogos salvos", color: "bg-lottery-purple" },
];

export default function Home() {
  const { data: c, isLoading } = useQuery({
    queryKey: ["ultimoConcurso"],
    queryFn: getUltimoConcurso,
    staleTime: 1000 * 60 * 5,
  });

  // Função auxiliar para garantir que as dezenas do CSV sejam exibidas
  const extrairDezenas = (dados: any) => {
    if (dados?.dezenas && dados.dezenas.length > 0) return dados.dezenas;
    const dezenas = [];
    for (let i = 1; i <= 15; i++) {
      if (dados[`bola${i}`] !== undefined) dezenas.push(Number(dados[`bola${i}`]));
    }
    return dezenas;
  };

  const formatarMoeda = (valor: any) => {
    return Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <Layout>
      {/* Hero Section com seu gradiente original */}
      <section className="gradient-hero text-primary-foreground py-20 md:py-32">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm border border-white/10 animate-fade-in">
              <Sparkles className="h-4 w-4 text-yellow-300" />
              Palpites baseados em estatísticas reais 2025
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold leading-tight">
              Aumente suas chances na <span className="text-primary">Lotofácil</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
              Algoritmo inteligente que analisa milhares de sorteios para gerar palpites otimizados.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button asChild size="lg" className="gradient-accent text-primary-foreground shadow-glow hover:scale-105 transition-all">
                <Link to="/palpites"><Clover className="mr-2 h-5 w-5" /> Gerar Palpites Agora</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Link to="/estatisticas"><BarChart3 className="mr-2 h-5 w-5" /> Ver Estatísticas</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Seção de Resultado e Dados Financeiros do CSV */}
      <section className="py-12 md:py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-2xl font-bold">Último Resultado</h2>
            <Button asChild variant="ghost" className="hover:gap-2 transition-all">
              <Link to="/resultados">Ver todos <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>

          {isLoading ? (
            <LoadingCard />
          ) : c ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <ConcursoCard 
                concurso={c.concurso || c.numero} 
                data={c.data || c.data_concurso} 
                dezenas={extrairDezenas(c)} 
              />

              {/* Grid Financeiro com Estilos de Cor Originais */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-none shadow-md bg-white">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-lottery-gold/10 flex items-center justify-center text-lottery-gold">
                      <Trophy className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Prêmio 15 Acertos</p>
                      <p className="text-xl font-bold text-gray-900">{formatarMoeda(c.valor_15)}</p>
                      <p className="text-xs text-muted-foreground">{c.ganhadores_15 || 0} ganhadores</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-md bg-white">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-lottery-blue/10 flex items-center justify-center text-lottery-blue">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Próximo Estimado</p>
                      <p className="text-xl font-bold text-lottery-blue">{formatarMoeda(c.estimativa_proximo)}</p>
                      {c.acumulado === "True" && <span className="text-[9px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">ACUMULOU</span>}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-md bg-white">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-lottery-purple/10 flex items-center justify-center text-lottery-purple">
                      <Target className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Arrecadação Total</p>
                      <p className="text-xl font-bold text-gray-900">{formatarMoeda(c.arrecadacao)}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <Card className="border-dashed"><CardContent className="p-12 text-center text-muted-foreground">Dados indisponíveis.</CardContent></Card>
          )}
        </div>
      </section>

      {/* Quick Links com Hover original */}
      <section className="py-12 md:py-16 bg-muted/50">
        <div className="container">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickLinks.map((link) => (
              <Link key={link.href} to={link.href} className="group block p-6 bg-card rounded-xl border hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className={`w-12 h-12 ${link.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md`}>
                  <link.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-display font-semibold mb-1 group-hover:text-primary transition-colors">{link.title}</h3>
                <p className="text-sm text-muted-foreground">{link.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features com animação slide-up */}
      <section className="py-12 md:py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold mb-4">Por que usar o Palpiteiro?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Tecnologia aplicada para transformar sua forma de jogar.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <Card key={i} className="p-6 hover:shadow-lg transition-all animate-slide-up opacity-0" style={{ animationDelay: `${i * 0.1}s`, animationFillMode: "forwards" }}>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <f.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold mb-2">{f.title}</h3>
                    <p className="text-sm text-muted-foreground">{f.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
