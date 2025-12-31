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
  score_medio: number; // Forçaremos ser número
  metricas: any;
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
        toast({ title: "Erro", description: "Falha ao carregar dados.", variant: "destructive" });
        throw error;
      }

      // LIMPEZA DE DADOS: Garante que nada venha como null para o componente
      return (data || []).map(item => ({
        ...item,
        score_medio: Number(item.score_medio) || 0,
        acertos: Number(item.acertos) || 0,
        metricas: item.metricas || {}
      })) as Palpite[];
    },
    enabled: !!user,
  });

  // Cálculos com segurança absoluta contra null/undefined
  const totalJogos = palpites?.length || 0;
  const totalAcertos = palpites?.reduce((acc, p) => acc + (p.acertos || 0), 0) || 0;
  
  // Média calculada com fallback manual para evitar toFixed em null
  let mediaFormatada = "0.0";
  if (totalJogos > 0) {
    const calculo = totalAcertos / totalJogos;
    mediaFormatada = typeof calculo === 'number' && !isNaN(calculo) 
      ? calculo.toFixed(1) 
      : "0.0";
  }

  if (isLoadingSession) {
    return <Layout><div className="container py-20 text-center text-muted-foreground animate-pulse">Carregando...</div></Layout>;
  }

  if (!user) {
    return (
      <Layout>
        <section className="bg-primary text-primary-foreground py-12 px-4 text-center">
          <h1 className="text-3xl font-bold mb-2">Acesso Restrito</h1>
          <p className="opacity-80">Faça login para salvar e conferir seus palpites.</p>
        </section>
        <div className="container py-12 flex justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 text-center space-y-4">
              <Lock className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">Você precisa estar logado para ver o histórico.</p>
              <Button asChild className="w-full">
                <Link to="/auth"><LogIn className="mr-2 h-4 w-4" /> Entrar Agora</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="bg-primary text-primary-foreground py-10">
        <div className="container px-4">
          <h1 className="text-3xl font-bold mb-4">Seu Painel 2025</h1>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm border border-white/20">
              <p className="text-xs uppercase tracking-wider opacity-70">Jogos Salvos</p>
              <p className="text-2xl font-black">{totalJogos}</p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm border border-white/20">
              <p className="text-xs uppercase tracking-wider opacity-70">Acertos Totais</p>
              <p className="text-2xl font-black">{totalAcertos}</p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm border border-white/20">
              <p className="text-xs uppercase tracking-wider opacity-70">Média de Acertos</p>
              <p className="text-2xl font-black">{mediaFormatada}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container py-8 px-4 space-y-6">
        {isLoadingPalpites ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-40 w-full" />)}
          </div>
        ) : palpites.length === 0 ? (
          <Card className="border-dashed py-20 text-center">
            <History className="h-12 w-12 mx-auto mb-4 opacity-10" />
            <p className="text-muted-foreground mb-4">Nenhum jogo salvo ainda.</p>
            <Button asChild variant="outline"><Link to="/palpites">Gerar Palpites</Link></Button>
          </Card>
        ) : (
          <div className="grid gap-6">
            {palpites.map((palpite) => (
              <Card key={palpite.id} className="overflow-hidden border-l-4 border-l-primary">
                <CardHeader className="bg-muted/30 py-3 flex flex-row justify-between items-center space-y-0 text-[10px] font-mono text-muted-foreground uppercase tracking-tighter">
                   <span>Data: {new Date(palpite.created_at).toLocaleString('pt-BR')}</span>
                   <span className="bg-primary/20 text-primary px-2 py-0.5 rounded">ID: {palpite.id.slice(0,8)}</span>
                </CardHeader>
                <CardContent className="p-6">
                  <PalpiteCard
                    numeros={palpite.numeros}
                    scoreMedio={palpite.score_medio ?? 0}
                    metricas={palpite.metricas ?? {}}
                    showSaveButton={false}
                  />
                  {palpite.acertos > 0 && (
                    <div className="mt-4 flex items-center gap-2 text-green-600 font-bold text-sm">
                      <Trophy className="h-4 w-4" />
                      <span>{palpite.acertos} ACERTOS IDENTIFICADOS</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

