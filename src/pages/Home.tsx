import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { Layout } from "@/components/Layout";
import { ConcursoCard } from "@/components/ConcursoCard";
import { LoadingCard } from "@/components/LoadingStates";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { getUltimoConcurso, getDesempenhoGerador } from "@/lib/api";

import {
  Sparkles,
  BarChart3,
  Trophy,
  RefreshCw,
  Info,
  MapPin,
  Target,
} from "lucide-react";

function Home() {
  const queryClient = useQueryClient();

  const { data: rawData, isLoading, isFetching, isError } = useQuery({
    queryKey: ["home"],
    queryFn: getUltimoConcurso,
    staleTime: 1000 * 60 * 30,
  });

  const { data: desempenhoFixo, isLoading: loadingFixo } = useQuery({
    queryKey: ["desempenho", "fixo"],
    queryFn: () => getDesempenhoGerador({ ano: 2026, tipo: "fixo" }),
    staleTime: 1000 * 60 * 60,
  });

  const { data: desempenhoEst, isLoading: loadingEst } = useQuery({
    queryKey: ["desempenho", "estatistico"],
    queryFn: () => getDesempenhoGerador({ ano: 2026, tipo: "estatistico" }),
    staleTime: 1000 * 60 * 60,
  });

  const c = rawData && typeof rawData === "object" && "concurso" in rawData
  ? rawData
  : null;

  const forceRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["home"] });
    queryClient.invalidateQueries({ queryKey: ["desempenho"] });
  };

  const formatarMoeda = (valor: any) =>
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

  if (isError || !c || !c.concurso) {
    return (
      <Layout>
        <div className="container py-20 text-center space-y-4">
          <p className="text-muted-foreground font-medium">
            Não foi possível carregar os dados do último concurso.
          </p>
          <Button onClick={forceRefresh} variant="outline" className="gap-2">
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            Tentar novamente
          </Button>
        </div>
      </Layout>
    );
  }

  const dezenas = Array.isArray(c.dezenas) ? c.dezenas.map(Number) : [];
  const municipios =
    typeof c.municipios === "string"
      ? JSON.parse(c.municipios)
      : c.municipios || [];

  const desempenhoTotal: Record<string, number> = {};
  [11, 12, 13, 14, 15].forEach((n) => {
    const v1 = desempenhoFixo?.resumo?.[String(n)] ?? 0;
    const v2 = desempenhoEst?.resumo?.[String(n)] ?? 0;
    desempenhoTotal[String(n)] = v1 + v2;
  });

  const isDesempenhoLoading = loadingFixo || loadingEst;

  return (
    <Layout>
      {/* HERO */}
      <section className="gradient-hero text-primary-foreground py-16 md:py-24 text-center">
        <div className="container space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 text-sm border border-white/10 text-white">
            <Sparkles className="h-4 w-4 text-yellow-300" />
            Loterias em Tempo Real • 2026
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-white">
            Lotofácil <span className="underline decoration-primary">Oficial</span>
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Concurso {c.concurso} ({c.data})
          </p>
          <Button asChild size="lg" className="bg-white text-primary font-bold">
            <Link to="/palpites">Gerar Palpites Estratégicos</Link>
          </Button>
        </div>
      </section>

      <section className="py-12 container space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold">Último Sorteio</h2>
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

        <ConcursoCard concurso={c.concurso} data={c.data} dezenas={dezenas} />

        {/* ESTATÍSTICAS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-slate-950 text-white border-none">
            <CardContent className="p-6">
              <h3 className="text-[10px] uppercase text-slate-500 mb-4 flex gap-2 font-bold">
                <BarChart3 className="h-3 w-3" /> Estatísticas
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-3xl font-bold">
                    {c.pares}P / {c.impares}Í
                  </p>
                  <p className="text-[10px] text-slate-500 uppercase">
                    Paridade
                  </p>
                </div>
                <div>
                  <p className="text-3xl font-bold">{c.soma}</p>
                  <p className="text-[10px] text-slate-500 uppercase">Soma</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary text-primary-foreground border-none">
            <CardContent className="p-6">
              <h3 className="text-[10px] uppercase mb-2 font-bold">
                Estimativa de Prêmio
              </h3>
              <div className="flex justify-between items-end">
                <p className="text-3xl font-black">
                  {formatarMoeda(c.estimativa_proximo)}
                </p>
                {c.acumulado && <Badge className="bg-white/20">ACUMULOU</Badge>}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* DESEMPENHO */}
        <Card className="border-none shadow-md bg-gradient-to-br from-slate-50 to-white">
          <CardHeader className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm uppercase font-bold">
              Desempenho do Gerador • 2026
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            {isDesempenhoLoading
              ? [11, 12, 13, 14, 15].map((n) => (
                  <div key={n} className="space-y-1 animate-pulse">
                    <div className="h-6 w-10 bg-slate-300 rounded mx-auto" />
                    <p className="text-[10px] uppercase text-muted-foreground">
                      {n} pontos
                    </p>
                  </div>
                ))
              : [11, 12, 13, 14, 15].map((n) => (
                  <div key={n} className="space-y-1">
                    <p className="text-2xl font-black text-primary">
                      {desempenhoTotal[String(n)]}
                    </p>
                    <p className="text-[10px] uppercase text-muted-foreground">
                      {n} pontos
                    </p>
                  </div>
                ))}
          </CardContent>
        </Card>

        {/* MUNICÍPIOS */}
        {municipios.length > 0 && (
          <Card className="border-none bg-white">
            <CardHeader className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-red-600" />
              <CardTitle className="text-xs uppercase">
                Ganhadores 15 pontos
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              {municipios.map((m: any, i: number) => (
                <div
                  key={i}
                  className="flex gap-3 bg-slate-50 border rounded-xl px-4 py-3 text-sm"
                >
                  <span className="font-black text-red-600">{m.uf}</span>
                  <span className="font-bold">{m.municipio}</span>
                  <Badge>{m.ganhadores}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* RATEIO */}
        <Card className="border-none bg-white">
          <div className="bg-slate-50 px-6 py-4 border-b flex gap-2">
            <Trophy className="h-4 w-4 text-yellow-500" />
            <h3 className="font-bold text-sm uppercase">Rateio</h3>
          </div>
          <CardContent className="p-0">
            {[15, 14, 13, 12, 11].map((n) => (
              <div key={n} className="flex justify-between px-6 py-4 border-b">
                <span className="font-semibold">{n} acertos</span>
                <div className="text-right">
                  <p className="font-bold">
                    {Number(c[`ganhadores_${n}`]).toLocaleString("pt-BR")}
                  </p>
                  <p className="text-xs">
                    {formatarMoeda(c[`valor_${n}`])}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="text-center text-[10px] text-muted-foreground flex gap-2 justify-center pb-10">
          <Info className="h-3 w-3" />
          Arrecadação: {formatarMoeda(c.arrecadacao)} • Concurso {c.concurso}
        </div>
      </section>
    </Layout>
  );
}

export default Home;

