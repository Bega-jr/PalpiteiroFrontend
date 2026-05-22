import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { PalpiteCard } from "@/components/palpites/PalpiteCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { 
  History, Lock, LogIn, TrendingUp, 
  DollarSign, Target, Trophy, ChartBar 
} from "lucide-react";

interface Palpite {
  id: string;
  created_at: string;
  numeros: number[];
  score_medio: number;
  metricas: Record<string, unknown>;
  acertos: number;
}

export default function Historico() {
  const { toast } = useToast();

  const { data: session, isLoading: isLoadingSession } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const user = session?.user;

  const { data: palpites = [], isLoading: isLoadingPalpites } = useQuery({
    queryKey: ["palpites-usuario", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("historico_jogos")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) {
        toast({ title: "Erro", description: "Não foi possível carregar os dados.", variant: "destructive" });
        throw error;
      }

      return (data || []).map(item => ({
        ...item,
        score_medio: Number(item.score_medio) || 0,
        acertos: Number(item.acertos) || 0,
        metricas: item.metricas || {}
      })) as Palpite[];
    },
    enabled: !!user,
  });

  // Cálculos Seguros
  const totalJogos = palpites.length;
  const totalAcertos = palpites.reduce((acc, p) => acc + p.acertos, 0);
  const mediaAcertos = totalJogos > 0 ? (totalAcertos / totalJogos).toFixed(1) : "0.0";

  if (isLoadingSession) {
    return <Layout><div className="container py-20 text-center animate-pulse italic">Carregando perfil...</div></Layout>;
  }

  // VIEW: NÃO AUTENTICADO (Design do Código 2)
  if (!user) {
    return (
      <Layout>
        <section className="bg-primary text-primary-foreground py-12 md:py-16">
          <div className="container">
            <div className="max-w-2xl">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">Meu Histórico</h1>
              <p className="text-white/80">Acompanhe seus palpites salvos, conferência automática e estatísticas.</p>
            </div>
          </div>
        </section>

        <div className="container py-12 md:py-20 text-center">
          <Card className="max-w-lg mx-auto shadow-lg">
            <CardHeader>
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="h-8 w-8 text-muted-foreground" />
              </div>
              <CardTitle className="text-2xl font-bold">Acesso Restrito</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">Faça login para acessar seu histórico de palpites e conferir resultados.</p>
              <div className="grid grid-cols-2 gap-4 text-sm font-medium">
                <div className="p-4 bg-muted rounded-lg flex flex-col items-center gap-2">
                  <History className="h-5 w-5 text-primary" /> Salvar Palpites
                </div>
                <div className="p-4 bg-muted rounded-lg flex flex-col items-center gap-2">
                  <Target className="h-5 w-5 text-primary" /> Conferência
                </div>
              </div>
              <Button asChild className="w-full" size="lg">
                <Link to="/auth"><LogIn className="mr-2 h-5 w-5" /> Fazer Login</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // VIEW: AUTENTICADO (Design Premium + Lógica Real)
  return (
    <Layout>
      <section className="bg-primary text-primary-foreground py-12 md:py-16">
        <div className="container">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white">Meu Histórico</h1>
            <p className="text-white/80">Gestão de palpites salvos e análise de desempenho.</p>
          </div>
        </div>
      </section>

      <div className="container py-8 md:py-12 space-y-8">
        {/* Resumo Financeiro/Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-none shadow-sm bg-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2 font-medium uppercase tracking-wider">
                <History className="h-4 w-4 text-primary" /> Total de Jogos
              </div>
              <div className="text-3xl font-bold">{totalJogos}</div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2 font-medium uppercase tracking-wider">
                <Trophy className="h-4 w-4 text-primary" /> Acertos Totais
              </div>
              <div className="text-3xl font-bold text-green-600">{totalAcertos}</div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2 font-medium uppercase tracking-wider">
                <ChartBar className="h-4 w-4 text-primary" /> Média Acertos
              </div>
              <div className="text-3xl font-bold">{mediaAcertos}</div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2 font-medium uppercase tracking-wider">
                <TrendingUp className="h-4 w-4 text-primary" /> ROI Estimado
              </div>
              <div className="text-3xl font-bold text-blue-600">--</div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Jogos */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Seus Palpites Salvos</h2>
            <Button size="sm" asChild variant="outline" className="hidden sm:flex">
              <Link to="/palpites">Novo Palpite</Link>
            </Button>
          </div>

          {isLoadingPalpites ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
            </div>
          ) : palpites.length === 0 ? (
            <Card className="border-dashed py-20">
              <CardContent className="text-center">
                <History className="h-12 w-12 mx-auto mb-4 opacity-20 text-primary" />
                <p className="text-xl font-medium text-muted-foreground">Nenhum palpite salvo.</p>
                <Button asChild className="mt-4" variant="secondary">
                  <Link to="/palpites">Gerar Agora</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {palpites.map((palpite) => (
                <Card key={palpite.id} className="overflow-hidden shadow-md hover:shadow-lg transition-all border-none">
                  <div className="bg-muted/50 px-6 py-3 border-b flex justify-between items-center">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                      {new Date(palpite.created_at).toLocaleDateString('pt-BR', { 
                        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                      })}
                    </span>
                    <span className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded font-bold uppercase">
                      Salvo em 2025
                    </span>
                  </div>
                  <CardContent className="p-6 md:p-8">
                    <PalpiteCard
                      numeros={palpite.numeros}
                      scoreMedio={palpite.score_medio}
                      metricas={palpite.metricas}
                      showSaveButton={false}
                    />
                    {palpite.acertos > 0 && (
                      <div className="mt-6 flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
                        <div className="bg-green-600 text-white p-2 rounded-full">
                          <Trophy className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs text-green-700 font-bold uppercase tracking-wider">Resultado da Conferência</p>
                          <p className="text-green-800 font-bold">{palpite.acertos} números acertados!</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

