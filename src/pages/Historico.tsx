import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { PalpiteCard } from "@/components/PalpiteCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export default function Historico() {
  const { toast } = useToast();

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => supabase.auth.getSession(),
  });

  const user = session?.data.session?.user;

  const { data: palpites = [], isLoading } = useQuery({
    queryKey: ["palpites-usuario", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("historico_jogos")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar os palpites.",
          variant: "destructive",
        });
        return [];
      }
      return data || [];
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (session && !user) {
      window.location.href = "/auth";
    }
  }, [session, user]);

  if (!user) {
    return null; // Redireciona
  }

  return (
    <Layout>
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-8">Meu Histórico de Palpites</h1>

        {isLoading ? (
          <p className="text-center">Carregando seus palpites...</p>
        ) : palpites.length === 0 ? (
          <Card>
            <CardContent className="p-10 text-center">
              <p className="text-muted-foreground text-lg mb-4">
                Você ainda não salvou nenhum palpite.
              </p>
              <Button asChild>
                <Link to="/palpites">Ir para Palpites</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {palpites.map((palpite: any) => (
              <div key={palpite.id} className="border rounded-lg p-6 bg-card">
                <p className="text-sm text-muted-foreground mb-4">
                  Salvo em: {new Date(palpite.created_at).toLocaleString("pt-BR")}
                </p>
                <PalpiteCard
                  numeros={palpite.numeros}
                  scoreMedio={palpite.score_medio || undefined}
                  metricas={palpite.metricas || {}}
                  showSaveButton={false}
                />
                {palpite.acertos !== undefined && (
                  <p className="mt-4 text-lg font-bold text-primary">
                    Acertos: {palpite.acertos} números
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
