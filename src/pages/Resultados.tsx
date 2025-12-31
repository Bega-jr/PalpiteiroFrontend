import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { ConcursoCard } from "@/components/ConcursoCard";
import { LoadingCard } from "@/components/LoadingStates";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { api } from "@/lib/api";

export default function Resultados() {
  const [buscaNumero, setBuscaNumero] = useState("");
  const [concursoBuscado, setConcursoBuscado] = useState<number | null>(null);

  // Últimos 10 concursos (fixo, como você pediu)
  const { data: ultimosConcursos = [], isLoading: loadingUltimos } = useQuery({
    queryKey: ["ultimos-concursos"],
    queryFn: async () => {
      const resp = await api.get("/ultimos/10");  // Fixo em 10 — mude se quiser
      return resp.data;  // Array de concursos
    },
    staleTime: 1000 * 60 * 30,  // Cache de 30 min
    refetchOnWindowFocus: false,
  });

  // Concurso específico pela busca
  const { data: concursoEspecifico, isLoading: loadingEspecifico } = useQuery({
    queryKey: ["concurso-especifico", concursoBuscado],
    queryFn: async () => {
      const resp = await api.get(`/concurso/${concursoBuscado}`);
      return resp.data.concurso;  // Objeto único do concurso
    },
    enabled: !!concursoBuscado,  // Só chama se houver número
    staleTime: 1000 * 60 * 60,  // Cache de 1 hora
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

  // Decide o que exibir: concurso buscado ou lista de últimos
  const concursosExibidos = concursoEspecifico ? [concursoEspecifico] : ultimosConcursos;

  // Função para montar array de dezenas (o backend usa bola1 a bola15)
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
          <Button onClick={handleBusca}>
            Buscar Concurso
          </Button>
          {concursoBuscado && (
            <Button
              variant="outline"
              onClick={() => {
                setConcursoBuscado(null);
                setBuscaNumero("");
              }}
            >
              Ver últimos 10
            </Button>
          )}
        </div>

        {/* Loading ou lista */}
        {(loadingUltimos || loadingEspecifico) ? (
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
                Nenhum concurso encontrado para o número informado.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
