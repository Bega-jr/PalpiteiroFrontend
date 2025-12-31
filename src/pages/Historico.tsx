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
  Target, Trophy, ChartBar 
} from "lucide-react";

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

  // 2. Busca de Palpites
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
          description: "Não foi possível carregar seu histórico.",
          variant: "destructive",
        });
        throw error;
      }
      return (data || []) as Palpite[];
    },
    enabled: !!user,
  });

  // 3. Cálculos de Estatísticas com Proteção Anti-Erro (Fixed)
  const totalJogos = palpites?.length || 0;
  
  const totalAcertos = palpites?.reduce((acc, p) => {
    const valorAcertos = Number(p.acertos) || 0;
    return acc + valorAcertos;
  }, 0) || 0;

  // Garantia de que a média nunca tente ler de nulo
  const mediaAcertos = totalJogos > 0 
    ? (totalAcertos / totalJogos).toFixed(1) 
    : "0.0";

  // ESTADO: Carregando (Inicial)
  if (isLoadingSession) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <p className="animate-pulse">Verificando acesso...</p>
        </div>
      </Layout>
    );
  }

  // ESTADO: Não Autenticado
  if (!user) {
    return (
      <Layout>
        <section className="bg-primary text-primary-foreground py-12">
          <div className="container text-center md:text-left">
            <h1 className="text-3xl font-bold mb-2">Meu Histórico</h1>
            <p className="opacity-90 text-sm">Entre para ver seus jogos salvos.</p>
          </div>
        </section>

        <div className="container py-12">
          <Card className="max-w-lg mx-auto">
            <CardHeader className="text-center border-b mb-6 bg-muted/20">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Acesso Restrito</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <p className="text-muted-foreground">
                Conecte-se para salvar seus palpites e conferir seus acertos automaticamente.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <Target className="h-5 w-5 text-primary mx-auto mb-2" />
                  <span className="text-xs font-medium">Conferência</span>
                </div>
                <div className="p-4 border rounded-lg">
                  <TrendingUp className="h-5 w-5 text-primary mx-auto mb-2" />
                  <span className="text-xs font-medium">Estatísticas</span>
                </div>
              </div>
              <Button asChild className="w-full">
                <Link to="/auth"><LogIn className="mr-2 h-4 w-4" /> Entrar ou Criar Conta</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // ESTADO: Autenticado
  return (
    <Layout>
      <section className="bg-primary text-primary-foreground py-12">
        <div className="container">
          <h1 className="text-3xl font-bold mb-2">Seu Histórico</h1>
          <p className="opacity-80 text-sm italic">Última atualização em 2025</p>
        </div>
      </section>

      <div className="container py-8 space-y-8">
        {/* Painel de Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg"><History className="text-primary h-5 w-5" /></div>
              <div><p className="text-xs text-muted-foreground">Total Salvo</p><p className="text-xl font-bold">{totalJogos}</p></div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-2 bg-green-100 rounded-lg"><Trophy className="text-green-600 h-5 w-5" /></div>
              <div><p className="text-xs text-muted-foreground">Acertos Totais</p><p className="text-xl font-bold">{totalAcertos}</p></div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-2 bg-blue-100 rounded-lg"><ChartBar className="text-blue-600 h-5 w-5" /></div>
              <div><p className="text-xs text-muted-foreground">Média p/ Jogo</p><p className="text-xl font-bold">{mediaAcertos}</p></div>
            </CardContent>
          </Card>
        </div>

        {/* Lista Principal */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold">Jogos Registrados</h2>
          
          {isLoadingPalpites ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
            </div>
          ) : palpites.length === 0 ? (
            <Card className="border-dashed py-16 text-center">
              <History className="h-10 w-10 mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground mb-4">Sua lista está vazia.</p>
              <Button asChild variant="outline">
                <Link to="/palpites">Gerar Meus Primeiros Números</Link>
              </Button>
            </Card>
          ) : (
            <div className="grid gap-4">
              {palpites.map((palpite) => (
                <Card key={palpite.id} className="hover:shadow-sm transition-shadow">
                  <div className="bg-muted/30 px-6 py-2 border-b flex justify-between items-center text-[10px] text-muted-foreground font-mono uppercase tracking-widest">
                    <span>ID: {palpite.id.split('-')[0]}</span>
                    <span>{new Date(palpite.created_at).toLocaleString('pt-BR')}</span>
                  </div>
                  <CardContent className="p-6">
                    <PalpiteCard
                      numeros={palpite.numeros}
                      scoreMedio={palpite.score_medio}
                      metricas={palpite.metricas}
                      showSaveButton={false}
                    />
                    {typeof palpite.acertos === 'number' && (
                      <div className="mt-4 pt-4 border-t flex items-center gap-2 text-primary font-bold">
                        <Trophy className="h-4 w-4" />
                        <span>{palpite.acertos} Acertos nesta combinação</span>
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
