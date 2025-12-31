import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { ConcursoCard } from "@/components/ConcursoCard";
import { LoadingCard } from "@/components/LoadingStates";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

export default function Resultados() {
  const { toast } = useToast();
  const [buscaNumero, setBuscaNumero] = useState("");
  const [concursoBuscado, setConcursoBuscado] = useState<number | null>(null);

  // Últimos 10 concursos
  const { data: ultimosData = {}, isLoading: loadingUltimos } = useQuery({
    queryKey: ["ultimos-concursos"],
    queryFn: async () => {
      const resp = await api.get("/ultimos/10");
      return resp.data; // {status, quantidade, concursos: [...]}
    },
    staleTime: 1000 * 60 * 30, // 30 minutos de cache
    refetchOnWindowFocus: false,
  });

  const ultimosConcursos = ultimosData.concursos || [];

  // Concurso específico pela busca
  const { data: concursoEspecifico, isLoading: loadingEspecifico } = useQuery({
    queryKey: ["concurso-especifico", concursoBuscado],
    queryFn: async () => {
      const resp = await api.get(`/concurso/${concursoBuscado}`);
      return resp.data.concurso;
    },
    enabled: !!concursoBuscado,
    staleTime: 1000 * 60 * 60, // 1 hora de cache
  });

  const handleBusca = () => {
    const num = parseInt(buscaNumero.trim());
    if (!isNaN(num) && num > 0) {
      setConcursoBuscado(num);
    } else {
      toast({
        title: "Número inválido",
        description: "Digite um número de concurso válido.",
        variant: "destructive",
      });
    }
  };

  const handleLimparBusca = () => {
    setConcursoBuscado(null);
    setBuscaNumero("");
  };

  // Decide o que exibir
  const concursosExibidos = concursoEspecifico ? [concursoEspecifico] : ultimosConcursos;

  // Monta o array de dezenas a partir de bola1 até bola15
  const montarDezenas = (concurso: any) => [
    Number(concurso.bola1),
    Number(concurso.bola2),
    Number(concurso.bola3),
    Number(concurso.bola4),
    Number(concurso.bola5),
    Number(concurso.bola6),
    Number(concurso.bola7),
    Number(concurso.bola8),
    Number(concurso.bola9),
    Number(concurso.bola10),
    Number(concurso.bola11),
    Number(concurso.bola12),
    Number(concurso.bola13),
    Number(concurso.bola14),
    Number(concurso.bola15),
  ].sort((a, b) => a - b);

  return (
    <Layout>
      <div className="container py-10 max-w-5xl">
        <h1 className="text-3xl font-bold mb-8 text-center">Resultados da Lotofácil</h1>

        {/* Área de busca */}
        <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto mb-12">
          <Input
            type="number"
            placeholder="Digite o número do concurso (ex: 3575)"
            value={buscaNumero}
            onChange={(e) => setBuscaNumero(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleBusca()}
          />
          <Button onClick={handleBusca}>Buscar Concurso</Button>
          {concursoBuscado && (
            <Button variant="outline" onClick={handleLimparBusca}>
              Ver últimos 10
            </Button>
          )}
        </div>

        {/* Loading ou lista */}
        {loadingUltimos || loadingEspecifico ? (
          <div className="grid gap-8">
            {Array.from({ length: 5 }).map((_, i) => (
              <LoadingCard key={i} />
            ))}
          </div>
        ) : concursosExibidos.length > 0 ? (
          <div className="grid gap-8">
            {concursosExibidos.map((concurso: any) => (
              <ConcursoCard
                key={concurso.concurso}
                concurso={concurso.concurso}
                data={concurso.data}
                dezenas={montarDezenas(concurso)}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-10 text-center">
              <p className="text-muted-foreground text-lg">
                Nenhum concurso encontrado.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
