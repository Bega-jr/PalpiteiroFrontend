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

const features = [
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

const quickLinks = [
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
    color: "bg-blue-600",
  },
  {
    href: "/resultados",
    icon: Trophy,
    title: "Resultados",
    description: "Últimos sorteios da Lotofácil",
    color: "bg-amber-500",
  },
  {
    href: "/historico",
    icon: History,
    title: "Meu Histórico",
    description: "Acompanhe seus jogos salvos",
    color: "bg-purple-600",
  },
];

export default function Home() {
  const { data: ultimoConcurso, isLoading } = useQuery({
    queryKey: ["ultimoConcurso"],
    queryFn: () => api.getUltimoConcurso(),
    staleTime: 1000 * 60 * 10, // Dados considerados frescos por 10 minutos
  });

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground py-20 md:py-32">
        {/* Efeito de brilho de fundo opcional */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_70%)] pointer-events-none" />
        
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 text-sm border border-white/20 animate-fade-in">
              <Sparkles className="h-4 w-4 text-yellow-300" />
              <span>Palpites baseados em estatísticas reais 2025</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight tracking-tighter">
              Aumente suas chances na <span className="text-yellow-400">Lotofácil</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
              Algoritmo inteligente que analisa milhares de sorteios para gerar
              palpites otimizados com filtros profissionais.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 shadow-xl transition-all hover:scale-105">
                <Link to="/palpites">
                  <Clover className="mr-2 h-5 w-5" />
                  Gerar Palpites Agora
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm">
                <Link to="/estatisticas">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Ver Estatísticas
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Último Resultado Section */}
      <section className="py-12 md:py-16 bg-background">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Último Resultado</h2>
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

      {/* Quick Links Grid */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className="group relative p-6 bg-card rounded-2xl border shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
                >
                  <div className={`w-12 h-12 ${link.color} rounded-xl flex items-center justify-center mb-5 shadow-lg group-hover:rotate-6 transition-transform`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                    {link.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {link.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Por que usar o Palpiteiro?
            </h2>
            <p className="text-muted-foreground text-lg">
              Tecnologia e matemática aplicadas para transformar sua forma de jogar.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={i}
                  className="p-8 border-none bg-muted/50 hover:bg-muted transition-colors duration-300 animate-in fade-in slide-in-from-bottom-6"
                  style={{ animationDelay: `${i * 150}ms`, animationFillMode: "forwards" }}
                >
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center flex-shrink-0 border border-primary/10 text-primary">
                      <Icon className="h-7 w-7" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container pb-20">
        <div className="bg-primary rounded-[2rem] p-8 md:p-16 text-center text-primary-foreground relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32" />
          <div className="relative z-10 max-w-2xl mx-auto space-y-8">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight italic">
              Pronto para sua próxima conquista?
            </h2>
            <p className="text-primary-foreground/70 text-lg">
              Junte-se a milhares de usuários que utilizam inteligência de dados.
            </p>
            <Button asChild size="lg" variant="secondary" className="px-10 h-14 text-lg font-bold rounded-full">
              <Link to="/palpites">Começar Gratuitamente</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
