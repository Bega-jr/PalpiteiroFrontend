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
    queryFn: getUltimoConcurso,
  });

  // Monta o array de dezenas a partir das bolas
  const dezenasArray = ultimoConcurso
    ? [
        Number(ultimoConcurso.bola1),
        Number(ultimoConcurso.bola2),
        Number(ultimoConcurso.bola3),
        Number(ultimoConcurso.bola4),
        Number(ultimoConcurso.bola5),
        Number(ultimoConcurso.bola6),
        Number(ultimoConcurso.bola7),
        Number(ultimoConcurso.bola8),
        Number(ultimoConcurso.bola9),
        Number(ultimoConcurso.bola10),
        Number(ultimoConcurso.bola11),
        Number(ultimoConcurso.bola12),
        Number(ultimoConcurso.bola13),
        Number(ultimoConcurso.bola14),
        Number(ultimoConcurso.bola15),
      ].sort((a, b) => a - b)
    : [];

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
              dezenas={dezenasArray}
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

      {/* Quick Links, Features e CTA permanecem iguais */}
      {/* (copia o resto do seu código original aqui – não mudou nada) */}
      {/* ... o resto do seu código Home.tsx original ... */}
    </Layout>
  );
}
