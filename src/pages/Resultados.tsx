import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { ConcursoCard } from "@/components/ConcursoCard";
import { LoadingCard } from "@/components/LoadingStates";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { api } from "@/lib/api";

export default function Resultados() {
  const [busca, setBusca] = useState("");
  const [concursoBuscado, setConcursoBuscado] = useState<number | null>(null);

  const { data: ultimosConcursos = [], isLoading } = useQuery({
    queryKey: ["ultimos-concursos"],
    queryFn: async () => {
      const resp = await api.get("/ultimos/30");
      return resp.data; // array de concursos
    },
    staleTime: 1000 * 60 * 30, // 30 min cache
  });

  const { data: concursoEspecifico, isLoading: loadingEspecifico } = useQuery({
    queryKey: ["concurso", concursoBuscado],
    queryFn: async () => {
      const resp = await api.get(`/concurso/${concursoBuscado}`);
      return resp.data.concurso;
    },
    enabled: !!concursoBuscado,
  });

  const handleBusca = () => {
    const num = parseInt(busca);
    if (num > 0) setConcursoBuscado(num);
  };

  const concursosExibidos = concursoEspecifico ? [concursoEspecifico] : ultimosConcursos;

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
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Resultados da Lotofácil</h1>

        <div className="flex gap-2 mb-8 max-w-md">
          <Input
            placeholder="Digite o número do concurso"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleBusca()}
          />
          <Button onClick={handleBusca}>Buscar</Button>
        </div>

        {isLoading || loadingEspecifico ? (
          <div className="space-y-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <LoadingCard key={i} />
            ))}
          </div>
        ) : concursosExibidos.length > 0 ? (
          <div className="space-y-8">
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
          <p className="text-center text-muted-foreground">
            Nenhum concurso encontrado.
          </p>
        )}
      </div>
    </Layout>
  );
}
