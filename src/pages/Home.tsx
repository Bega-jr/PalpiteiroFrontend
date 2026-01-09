import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { ConcursoCard } from "@/components/ConcursoCard";
import { LoadingCard } from "@/components/LoadingStates";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Importar Header e Title tbm
import { Badge } from "@/components/ui/badge";
import { getUltimoConcurso } from "@/lib/api";
import {
  Sparkles,
  BarChart3,
  Trophy,
  RefreshCw,
  Info,
  MapPin,
} from "lucide-react";

// Importações para a tabela (garantir que estão corretas)
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";


function Home() {
  const queryClient = useQueryClient();

  const { data: c, isLoading, isFetching } = useQuery({
    queryKey: ["home"],
    queryFn: getUltimoConcurso,
    staleTime: 1000 * 60 * 30,
  });

  const forceRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["home"] });
  };

  const formatarMoeda = (valor) =>
    Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-12">
           <LoadingCard />
        </div>
      </Layout>
    );
  }

  if (!c) {
     return (
      <Layout>
        <div className="container py-20 text-center">
          Não foi possível carregar os dados do último concurso.
        </div>
      </Layout>
    );
  }

  // Dados do Concurso 3582
  const dezenas = c.dezenas.map((d) => Number(d));
  const pares = c.pares;
  const impares = c.impares;
  const somaTotal = c.soma;
  const estaAcumulado = c.acumulado;
  const ganhadores15 = Number(c.ganhadores_15 || 0);

  // CORREÇÃO CRÍTICA: Faz o parsing da string JSON dos municípios
  let municipios = [];
  try {
    // Se o campo municipios não for nulo ou vazio, faz o parse
    if (c.municipios) {
        municipios = JSON.parse(c.municipios);
    }
  } catch (e) {
    console.error("Erro ao fazer parse dos municípios:", e);
  }


  return (
    <Layout>
      {/* HERO SECTION */}
      <section className="gradient-hero text-primary-foreground py-16 md:py-24 text-center">
        <div className="container space-y-6 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 text-sm border border-white/10">
            <Sparkles className="h-4 w-4 text-yellow-300" />
            Estatísticas Lotofácil Atualizadas (2026)
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold">
            Confira o Resultado Oficial
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Concurso {c.concurso} - {c.data}
          </p>
          <Button asChild size="lg" className="gradient-accent shadow-glow">
            <Link to="/palpites">Gerar Palpites</Link>
          </Button>
        </div>
      </section>

      {/* CONTEÚDO */}
      <section className="py-12 container">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display text-2xl font-bold">
            Resultado Completo
          </h2>
           <Button
            onClick={forceRefresh}
            variant="outline"
            size="sm"
            disabled={isFetching}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>

        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6">
            
            {/* CONCURSO CARD (DEZENAS SORTeadas) */}
            <ConcursoCard
              concurso={c.concurso}
              data={c.data}
              dezenas={dezenas}
            />

            {/* DASHBOARD E PRÊMIO PRINCIPAL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-none shadow-md bg-slate-950 text-white">
                <CardContent className="p-6">
                  <h3 className="text-[10px] uppercase text-slate-500 mb-4 flex items-center gap-2">
                    <BarChart3 className="h-3 w-3" /> Estatística do Sorteio
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-3xl font-bold">
                        {pares}P / {impares}Í
                      </p>
                      <p className="text-[10px] text-slate-500 uppercase">
                        Paridade
                      </p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold">{somaTotal}</p>
                      <p className="text-[10px] text-slate-500 uppercase">
                        Soma Total
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md bg-primary text-primary-foreground">
                <CardContent className="p-6">
                  <h3 className="text-[10px] uppercase mb-2">
                    Próximo Prêmio Estimado
                  </h3>
                  <div className="flex justify-between items-end">
                    <p className="text-3xl font-black">
                      {formatarMoeda(c.estimativa_proximo)}
                    </p>
                    {estaAcumulado && (
                      <span className="text-[9px] bg-white/20 px-2 py-1 rounded font-bold">
                        ACUMULOU
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* CIDADES PREMIADAS (Agora usando o array parsed) */}
            {municipios.length > 0 && (
              <Card className="border-none shadow-sm bg-white">
                <CardHeader className="bg-red-50 px-6 py-3 border-b flex flex-row items-center gap-2">
                  <MapPin className="h-4 w-4 text-red-500" />
                  <CardTitle className="font-bold text-xs uppercase text-red-700">
                    {ganhadores15} {ganhadores15 === 1 ? 'Aposta Ganhadora' : 'Apostas Ganhadoras'} (15 acertos)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 flex flex-wrap gap-2">
                  {municipios.map((m, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 bg-gray-50 border px-3 py-2 rounded-xl text-sm"
                    >
                      <span className="font-black text-red-600">
                        {m.uf || "--"}
                      </span>
                      <span className="font-semibold">{m.municipio}</span>
                      <span className="bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                        {m.ganhadores} aposta(s)
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* TABELA DE RATEIO COMPLETA */}
            <Card className="border-none shadow-md bg-white overflow-hidden">
              <div className="bg-muted/30 px-6 py-4 border-b flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <h3 className="font-bold text-sm uppercase">Rateio Oficial</h3>
              </div>
              <CardContent className="p-0">
                {[15, 14, 13, 12, 11].map((n) => (
                  <div
                    key={n}
                    className={`flex justify-between px-6 py-4 border-b ${
                      n === 15 ? "bg-primary/5 font-bold" : ""
                    }`}
                  >
                    <span>{n} Acertos</span>
                    <span>
                      {Number(c[`ganhadores_${n}`]).toLocaleString("pt-BR")} —{" "}
                      {formatarMoeda(c[`valor_${n}`])}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex justify-center text-muted-foreground text-[10px] gap-2">
              <Info className="h-3 w-3" />
              Arrecadação total do concurso {c.concurso}: {formatarMoeda(c.arrecadacao)}
            </div>
        </div>
      </section>
    </Layout>
  );
}

export default Home;

