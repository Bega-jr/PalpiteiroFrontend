import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { History, Lock, LogIn, TrendingUp, DollarSign, Target, Trophy } from "lucide-react";

export default function Historico() {
  // TODO: Implementar autenticação real
  const isAuthenticated = false;

  if (!isAuthenticated) {
    return (
      <Layout>
        <section className="gradient-hero text-primary-foreground py-12 md:py-16">
          <div className="container">
            <div className="max-w-2xl">
              <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Meu Histórico
              </h1>
              <p className="text-white/80">
                Acompanhe seus palpites salvos, conferência automática e resumo
                financeiro.
              </p>
            </div>
          </div>
        </section>

        <div className="container py-12 md:py-20">
          <Card className="max-w-lg mx-auto">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="h-8 w-8 text-muted-foreground" />
              </div>
              <CardTitle className="font-display text-2xl">
                Acesso Restrito
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Faça login para acessar seu histórico de palpites, acompanhar
                resultados e ver seu resumo financeiro.
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-4 bg-muted rounded-lg">
                  <History className="h-5 w-5 text-primary mx-auto mb-2" />
                  <p className="font-medium">Salvar Palpites</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <Target className="h-5 w-5 text-primary mx-auto mb-2" />
                  <p className="font-medium">Conferência Automática</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <DollarSign className="h-5 w-5 text-primary mx-auto mb-2" />
                  <p className="font-medium">Resumo Financeiro</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <TrendingUp className="h-5 w-5 text-primary mx-auto mb-2" />
                  <p className="font-medium">ROI e Estatísticas</p>
                </div>
              </div>
              <Button asChild className="w-full">
                <Link to="/auth">
                  <LogIn className="mr-2 h-4 w-4" />
                  Fazer Login
                </Link>
              </Button>
              <p className="text-xs text-muted-foreground">
                Ainda não tem conta?{" "}
                <Link to="/auth?mode=signup" className="text-primary hover:underline">
                  Cadastre-se grátis
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // TODO: Implementar view autenticada
  return (
    <Layout>
      <section className="gradient-hero text-primary-foreground py-12 md:py-16">
        <div className="container">
          <div className="max-w-2xl">
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Meu Histórico
            </h1>
            <p className="text-white/80">
              Acompanhe seus palpites salvos e resultados.
            </p>
          </div>
        </div>
      </section>

      <div className="container py-8 md:py-12 space-y-8">
        {/* Resumo */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                <History className="h-4 w-4" />
                Total de Jogos
              </div>
              <div className="font-display text-2xl font-bold">0</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                <DollarSign className="h-4 w-4" />
                Total Apostado
              </div>
              <div className="font-display text-2xl font-bold">R$ 0,00</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                <Trophy className="h-4 w-4" />
                Prêmios
              </div>
              <div className="font-display text-2xl font-bold">R$ 0,00</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                <TrendingUp className="h-4 w-4" />
                ROI
              </div>
              <div className="font-display text-2xl font-bold">0%</div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Jogos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Jogos Salvos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Você ainda não salvou nenhum palpite.</p>
              <Button asChild variant="link" className="mt-2">
                <Link to="/palpites">Gerar Palpites</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
