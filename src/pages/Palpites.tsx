import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { PalpiteCard } from "@/components/PalpiteCard";
import { LoadingCard } from "@/components/LoadingStates";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clover, RefreshCw, Star, Info, AlertCircle, Zap } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { getPalpiteFixo, getPalpitesEstatisticos } from "@/lib/api";
import { supabase } from "@/lib/supabase";

export default function Palpites() {
  const { toast } = useToast();
  const [refreshKey, setRefreshKey] = useState(0);

  // Palpite Fixo
  const {
    data: palpiteFixoData,
    isLoading: loadingFixo,
    error: errorFixo,
  } = useQuery({
    queryKey: ["palpite-fixo", refreshKey],
    queryFn: getPalpiteFixo,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 15,
  });

  const numerosFixo = palpiteFixoData?.numeros || [];

  // Palpites Estatísticos (Endpoint: /palpites/estatisticos)
  const {
    data: palpitesData,
    isLoading: loadingEstatisticos,
    error: errorEstatisticos,
  } = useQuery({
    queryKey: ["palpites-estatisticos", refreshKey],
    queryFn: getPalpitesEstatisticos,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 15,
  });

  // Extração segura do array de palpites
  const palpites = palpitesData?.palpites || []; 
  const isLoading = loadingFixo || loadingEstatisticos;
  const error = errorFixo || errorEstatisticos;

  const handleRefresh = async () => {
    setRefreshKey((prev) => prev + 1);
    toast({
      title: "Gerando novos palpites...",
      description: "O algoritmo está processando novas combinações.",
    });
    // O useQuery refaz o fetch automaticamente quando o refreshKey muda.
  };

  // Função de salvar palpite (fixo ou estatístico)
  const handleSavePalpite = async (numeros: number[], tipo: "fixo" | "estatistico" = "estatistico") => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      toast({
        title: "Login necessário",
        description: "Faça login para salvar seus palpites.",
        variant: "destructive",
      });
      // Mantive o window.location.href conforme seu código funcional anterior
      window.location.href = "/auth"; 
      return;
    }

    const { error } = await supabase.from("historico_jogos").insert({ // Ajustei para historico_jogos (padrão anterior)
      user_id: session.user.id,
      tipo,
      numeros: numeros.sort((a, b) => a - b),
      created_at: new Date().toISOString(),
      // Você pode precisar adicionar campos como 'score_medio' e 'metricas' aqui, se o Supabase exigir.
    });

    if (error) {
      toast({
        title: "Erro ao salvar",
        description: error.message || "Tente novamente.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Palpite salvo!",
        description: "Adicionado ao seu histórico com sucesso.",
      });
    }
  };

  return (
    <Layout>
      {/* Header Premium */}
      <section className="bg-primary text-primary-foreground py-12 md:py-16">
        <div className="container max-w-3xl">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Palpites Inteligentes</h1>
          <p className="text-white/80 text-lg leading-relaxed">
            Algoritmo estatístico avançado que analisa frequência, atraso e ciclos de cada número.
          </p>
        </div>
      </section>

      <div className="container py-8 md:py-12 space-y-8">
        
        {/* Barra de Ações e Info */}
        <div className="flex items-center justify-between p-4 bg-muted rounded-xl shadow-sm">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Info className="h-4 w-4" />
            <p className="hidden sm:inline">Clique em "Gerar Novos" para processar novas combinações.</p>
          </div>
          <Button onClick={handleRefresh} disabled={isLoading} variant="secondary" className="shadow-md">
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Gerar Novos
          </Button>
        </div>

        {/* Handling de Erro Global */}
        {error && (
            <Card className="border-destructive shadow-lg">
                <CardContent className="p-6 text-center text-destructive flex items-center justify-center gap-3">
                    <AlertCircle className="h-5 w-5" />
                    <p>Erro ao comunicar com a API: {error.message}. Tente novamente mais tarde.</p>
                </CardContent>
            </Card>
        )}

        {/* Palpite Fixo */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <Star className="h-6 w-6 text-yellow-500" />
            <h2 className="text-2xl font-bold">Palpite Fixo do Dia</h2>
            <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-500">Premium</Badge>
          </div>

          {loadingFixo ? (
            <LoadingCard />
          ) : numerosFixo.length === 15 ? (
            <PalpiteCard
              numeros={numerosFixo}
              scoreMedio={undefined} // Ajuste conforme a prop de PalpiteCard
              highlight
              showSaveButton
              onSave={() => handleSavePalpite(numerosFixo, "fixo")}
            />
          ) : (
            <Card className="border-dashed py-8">
              <CardContent className="text-center text-muted-foreground">
                <Zap className="h-10 w-10 mx-auto mb-3 opacity-20" />
                <p>Palpite fixo indisponível no momento ou já salvo para hoje.</p>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Palpites Estatísticos (Array de 6 palpites) */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Clover className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Combinações Estatísticas</h2>
            <Badge variant="secondary" className="ml-auto">{palpites.length} palpites gerados</Badge>
          </div>

          {loadingEstatisticos ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <LoadingCard key={i} />
              ))}
            </div>
          ) : palpites.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {palpites.map((palpite: any, index: number) => (
                <PalpiteCard
                  key={index}
                  // Passe scoreMedio e metricas, mesmo que venham como undefined inicialmente
                  numeros={palpite.numeros || []}
                  scoreMedio={palpite.score_medio ?? undefined} 
                  metricas={palpite.metricas ?? undefined} 
                  showSaveButton
                  onSave={() => handleSavePalpite(palpite.numeros, "estatistico")}
                />
              ))}
            </div>
          ) : (
             <Card className="border-dashed py-8">
              <CardContent className="text-center text-muted-foreground">
                <Clover className="h-10 w-10 mx-auto mb-3 opacity-20" />
                <p>Nenhum palpite gerado. Clique em "Gerar Novos" para processar.</p>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </Layout>
  );
}
