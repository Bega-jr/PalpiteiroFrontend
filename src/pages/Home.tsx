import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { ConcursoCard } from "@/components/ConcursoCard";
import { LoadingCard } from "@/components/LoadingStates";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";
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

const FEATURES = [
  {
    icon: Sparkles,
    title: "Palpites Inteligentes",
    description: "Algoritmo estatístico avançado que analisa padrões históricos para gerar palpites otimizados.",
  },
  {
    icon: BarChart3,
    title: "Análise Completa",
    description: "Frequência, atraso, score e ciclos de cada número. Dados atualizados em tempo real.",
  },
  {
    icon: Target,
    title: "Filtros Profissionais",
    description: "Controle de soma, pares/ímpares, primos, moldura e similaridade entre palpites.",
  },
  {
    icon: Shield,
    title: "Histórico Seguro",
    description: "Salve seus palpites e acompanhe resultados. Conferência automática de acertos.",
  },
];

const QUICK_LINKS = [
  {
    href: "/palpites",
    icon: Clover,
    title: "Gerar Palpites",
    description: "7 palpites estatísticos diversificados",
    color: "bg-primary",
  },
  {
    href: "/estatisticas",
    icon: TrendingUp,
    title: "Ver Estatísticas",
    description: "Frequência, atraso e score dos números",
    color: "bg-lottery-blue",
  },
  {
    href: "/resultados",
    icon: Trophy,
    title: "Resultados",
    description: "Últimos sorteios da Lotofácil",
    color: "bg-lottery-gold",
  },
  {
    href: "/historico",
    icon: History,
    title: "Meu Histórico",
    description: "Acompanhe seus jogos salvos",
    color: "bg-lottery-purple",
  },
];

export default function Home() {
  const { data: ultimoConcurso, isLoading } = useQuery({
    queryKey: ["ultimoConcurso"],
    queryFn: () => api.getUltimoConcurso(),
    staleTime: 1000 * 60 * 10, // Mantém os dados frescos por 10 minutos
  });

  return (
    <Layout>
      {/* Hero Section - Visual Gradient */}
      <section className="gradient-hero text-primary-foreground py-20 md:py-32 relative overflow-hidden">
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm border border-white/10 animate-fade-in">
              <Sparkles className="h-4 w-4 text-yellow-300" />
              <span>Palpites baseados em estatísticas reais 2025</span>
            </div>
            
            <h1 className="font-display text-4xl md:text-6xl font-bold leading-tight tracking-tighter">
              Aumente suas chances na <span className="text-primary">Lotofácil</span>
            </h1>
            
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
              Algoritmo inteligente que analisa milhares de sorteios para gerar
              palpites otimizados com filtros profissionais e estatísticas em tempo real.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button asChild size="lg" className="gradient-accent text-primary-foreground shadow-glow hover:scale-105 transition-transform">
                <Link to="/palpites">
                  <Clover className="mr-2 h-5 w-5" /> Gerar Palpites Agora
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm">
                <Link to="/estatisticas">
                  <BarChart3 className="mr-2 h-5 w-5" /> Ver Estatísticas
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Último Resultado */}
      <section className="py-12 md:py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight">Último Resultado</h2>
              <p className="text-sm text-muted-foreground">Dados oficiais sincronizados</p>
            </div>
            <Button asChild variant="ghost" className="hover:gap-2 transition-all">
              <Link to="/resultados">
                Ver todos <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {isLoading ? (
            <LoadingCard />
          ) : ultimoConcurso ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <ConcursoCard
                concurso={ultimoConcurso.concurso}
                data={ultimoConcurso.data}
                dezenas={ultimoConcurso.dezenas}
              />
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="p-12 text-center text-muted-foreground">
                Não foi possível carregar os dados. Verifique sua conexão.
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Quick Links - Com as cores temáticas (Gold, Blue, Purple) */}
      <section className="py-12 md:py-16 bg-muted/50">
        <div className="container">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="group block p-6 bg-card rounded-xl border hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-12 h-12 ${link.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-md`}>
                  <link.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-display font-semibold mb-1 group-hover:text-primary transition-colors">
                  {link.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {link.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features - Com Animação de Slide */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
              Por que usar o Palpiteiro?
            </h2>
            <p className="text-muted-foreground text-lg">
              Tecnologia e matemática aplicadas para transformar sua forma de jogar.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FEATURES.map((feature, i) => (
              <Card
                key={i}
                className="p-6 hover:shadow-lg transition-all duration-300 animate-slide-up opacity-0"
                style={{ 
                  animationDelay: `${i * 0.15}s`, 
                  animationFillMode: "forwards" 
                }}
              >
                <div className="flex gap-5">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-lg mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-12 md:py-20 bg-secondary text-secondary-foreground">
        <div className="container text-center space-y-6">
          <h2 className="font-display text-3xl font-bold">
            Pronto para otimizar seus jogos?
          </h2>
          <p className="text-secondary-foreground/80 max-w-xl mx-auto mb-8">
            Junte-se a milhares de apostadores que utilizam dados reais para 
            tomar decisões mais inteligentes na Lotofácil.
          </p>
          <Button asChild size="lg" className="gradient-accent text-primary-foreground px-8">
            <Link to="/palpites">Começar Agora</Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
}
