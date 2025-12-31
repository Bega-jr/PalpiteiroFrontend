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
    description:
      "Algoritmo estatístico avançado que analisa padrões históricos para gerar palpites otimizados.",
  },
  {
    icon: BarChart3,
    title: "Análise Completa",
    description:
      "Frequência, atraso, score e ciclos de cada número. Dados atualizados em tempo real.",
  },
  {
    icon: Target,
    title: "Filtros Profissionais",
    description:
      "Controle de soma, pares/ímpares, primos, moldura e similaridade entre palpites.",
  },
  {
    icon: Shield,
    title: "Histórico Seguro",
    description:
      "Salve seus palpites e acompanhe resultados. Conferência automática de acertos.",
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
  queryFn: async () => {
    const response = await api.get("/ultimos/1");
    console.log("DEBUG Ultimo:", response.data);
    return response.data[0];  // Pega o primeiro (mais recente)
  },
});

  return (
    <Layout>
      {/* Hero Section */}
      <section className="gradient-hero text-primary-foreground py-20 md:py-32">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
              <Sparkles className="h-4 w-4" />
              Palpites baseados em estatísticas reais
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold leading-tight">
              Aumente suas chances na{" "}
              <span className="text-primary">Lotofácil</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
              Algoritmo inteligente que analisa milhares de sorteios para gerar
              palpites otimizados. Estatísticas completas, filtros profissionais
              e acompanhamento de resultados.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                asChild
                size="lg"
                className="gradient-accent text-primary-foreground shadow-glow"
              >
                <Link to="/palpites">
                  <Clover className="mr-2 h-5 w-5" />
                  Gerar Palpites Agora
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Link to="/estatisticas">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Ver Estatísticas
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Último Resultado */}
      <section className="py-12 md:py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-bold">Último Resultado</h2>
            <Button asChild variant="ghost">
              <Link to="/resultados">
                Ver todos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          {isLoading ? (
            <LoadingCard />
          ) : ultimoConcurso ? (
            <ConcursoCard
              concurso={ultimoConcurso.concurso}
              data={ultimoConcurso.data}
              dezenas={ultimoConcurso.dezenas}
            />
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                Não foi possível carregar o último resultado.
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-12 md:py-16 bg-muted/50">
        <div className="container">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className="group block p-6 bg-card rounded-xl border hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div
                    className={`w-12 h-12 ${link.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-display font-semibold mb-1">{link.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {link.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 md:py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold mb-4">
              Por que usar o Palpiteiro?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Combinamos análise estatística avançada com uma interface simples
              e intuitiva para otimizar suas apostas.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={i}
                  className="p-6 hover:shadow-lg transition-shadow animate-slide-up opacity-0"
                  style={{ animationDelay: `${i * 0.1}s`, animationFillMode: "forwards" }}
                >
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
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

      {/* CTA */}
      <section className="py-12 md:py-20 bg-secondary text-secondary-foreground">
        <div className="container text-center">
          <h2 className="font-display text-3xl font-bold mb-4">
            Pronto para começar?
          </h2>
          <p className="text-secondary-foreground/80 max-w-xl mx-auto mb-8">
            Gere seus primeiros palpites agora mesmo. É grátis, rápido e
            baseado em estatísticas reais.
          </p>
          <Button
            asChild
            size="lg"
            className="gradient-accent text-primary-foreground shadow-glow"
          >
            <Link to="/palpites">
              <Clover className="mr-2 h-5 w-5" />
              Gerar Palpites Grátis
            </Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
}
