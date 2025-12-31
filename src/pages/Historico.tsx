import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { PalpiteCard } from "@/components/PalpiteCard";
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

// Tipagem para os dados do Supabase
interface Palpite {
  id: string;
  created_at: string;
  numeros: number[];
  score_medio?: number;
  metricas?: any;
  acertos?: number;
}

export default function Historico() {
  const { toast } = useToast();

  // 1. Busca de Sessão
  const { data: session, isLoading: isLoadingSession } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const user = session?.user;

  // 2. Busca de Palpites Reais
  const { data: palpites = [], isLoading: isLoadingPalpites } = useQuery({
    queryKey: ["palpites-usuario", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("historico_jogos")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) {
        toast({
          title: "Erro ao carregar",
          description: "Não foi possível sincronizar seus palpites.",
          variant: "destructive",
        });
        throw error;
      }
      return data as Palpite[];
    },
    enabled: !!user,
  });

  // 3. Cálculos de Estatísticas (Derivados dos dados reais)
  const stats = {
    total: palpites.length,
    totalAcertos: palpites.reduce((acc, p) => acc + (p.acertos || 0), 0),
    mediaAcertos: palpites.length > 0 
      ? (palpites.reduce((acc, p) => acc + (p.acertos || 0), 0) / palpites.length).toFixed(1)
      : 0
  };

  // ESTADO: Carregando Sessão
  if (isLoadingSession) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <Skeleton className="h-12 w-48 mx-auto mb-4" />
          <p>Verificando autenticação...</p>
        </div>
      </Layout>
    );
  }

  // ESTADO: Não Autenticado (Visual do Código 2)
  if (!user) {
    return (
      <Layout>
        <section className="bg-primary text-primary-foreground py-12 md:py-16">
          <div className="container">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Meu Histórico</h1>
            <p className="opacity-90">Acompanhe seus palpites salvos e evolução.</p>
          </div>
        </section>

        <div className="container py-12">
          <Card className="max-w-lg mx-auto">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="h-8 w-8 text-muted-foreground" />
              </div>
              <CardTitle className="text-2xl font-bold">Acesso Restrito</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <p className="text-muted-foreground">
                Faça login para salvar seus palpites e visualizar estatísticas de desempenho.
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 border rounded-lg flex flex-col items-center">
                  <History className="h-5 w-5 text-primary mb-2" />
                  <span>Histórico</span>
                </div>
                <div className="p-3 border rounded-lg flex flex-col items-center">
                  <Target className="h-5 w-5 text-primary mb-2" />
                  <span>Conferência</span>
                </div>
              </div>
              <Button asChild className="w-full">
                <Link to="/auth"><LogIn className="mr-2 h-4 w-4" /> Entrar agora</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // ESTADO: Autenticado e Com Dados
  return (
    <Layout>
      <section className="bg-primary text-primary-foreground py-12">
        <div className="container">
          <h1 className="text-3xl font-bold mb-2">Seu Painel de Palpites</h1>
          <p className="opacity-80 text-sm">Gerencie e analise seu histórico de jogos salvos.</p>
        </div>
      </section>

      <div className="container py-8 space-y-8">
        {/* Resumo Estatístico Real */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                <History className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Salvo</p>
                <p className="text-2xl font-bold">{stats.total} jogos</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full text-green-600">
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Acertos</p>
                <p className="text-2xl font-bold">{stats.totalAcertos}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="hidden md:block">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-full text-purple-600">
                <ChartBar className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Média p/ Jogo</p>
                <p className="text-2xl font-bold">{stats.mediaAcertos}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Palpites */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Últimos Jogos
            </h2>
            {palpites.length > 0 && (
               <Button variant="outline" size="sm" asChild>
                  <Link to="/palpites">Gerar Novo</Link>
               </Button>
            )}
          </div>

          {isLoadingPalpites ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 w-full" />)}
            </div>
          ) : palpites.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-16 text-center">
                <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-20" />
                <p className="text-muted-foreground mb-6">Nenhum palpite encontrado na sua conta.</p>
                <Button asChild>
                  <Link to="/palpites">Começar a Gerar</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {palpites.map((palpite) => (
                <Card key={palpite.id} className="overflow-hidden hover:border-primary transition-colors">
                  <CardContent className="p-0">
                    <div className="bg-muted/30 p-3 border-b flex justify-between items-center">
                      <span className="text-xs font-medium text-muted-foreground">
                        {new Date(palpite.created_at).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                      {palpite.acertos !== undefined && (
                        <span className="bg-primary/10 text-primary text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">
                          Conferido
                        </span>
                      )}
                    </div>
                    <div className="p-6">
                      <PalpiteCard
                        numeros={palpite.numeros}
                        scoreMedio={palpite.score_medio}
                        metricas={palpite.metricas}
                        showSaveButton={false}
                      />
                      {palpite.acertos !== undefined && (
                        <div className="mt-4 flex items-center gap-2 text-primary font-bold">
                          <Trophy className="h-4 w-4" />
                          <span>{palpite.acertos} números acertados</span>
                        </div>
                      )}
                    </div>
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
