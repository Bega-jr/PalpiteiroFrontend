import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { PalpiteCard } from "@/components/PalpiteCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton"; // Se tiver Shadcn instalado
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

// 1. Definição de Interface para os dados
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
  const navigate = useNavigate();

  // 2. Query de Sessão (considerar mover para um contexto global no futuro)
  const { data: sessionData, isLoading: isLoadingSession } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const user = sessionData?.user;

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
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      return data as Palpite[];
    },
    enabled: !!user, // Só executa se o user existir
  });

  // 3. Redirecionamento correto sem refresh de página
  useEffect(() => {
    if (!isLoadingSession && !user) {
      navigate("/auth");
    }
  }, [user, isLoadingSession, navigate]);

  if (isLoadingSession || !user) return null;

  return (
    <Layout>
      <div className="container py-10">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Meu Histórico</h1>
        </header>

        {isLoadingPalpites ? (
          // 4. Skeleton Loading para melhor UX
          <div className="grid gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[200px] w-full rounded-lg" />
            ))}
          </div>
        ) : palpites.length === 0 ? (
          <Card>
            <CardContent className="p-10 text-center">
              <p className="text-muted-foreground text-lg mb-4">
                Você ainda não salvou nenhum palpite.
              </p>
              <Button asChild>
                <Link to="/palpites">Gerar Palpites Agora</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {palpites.map((palpite) => (
              <div key={palpite.id} className="border rounded-lg p-6 bg-card hover:shadow-md transition-shadow">
                <p className="text-xs text-muted-foreground mb-4">
                  {new Date(palpite.created_at).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <PalpiteCard
                  numeros={palpite.numeros}
                  scoreMedio={palpite.score_medio}
                  metricas={palpite.metricas}
                  showSaveButton={false}
                />
                {typeof palpite.acertos === 'number' && (
                  <div className="mt-4 p-2 bg-primary/10 rounded text-center">
                    <span className="font-bold text-primary">
                      {palpite.acertos} Acertos Detectados
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
