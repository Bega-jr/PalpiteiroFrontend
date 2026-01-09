import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { ConcursoCard } from "@/components/ConcursoCard";
import { LoadingCard } from "@/components/LoadingStates";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

function Home() {
  const queryClient = useQueryClient();

  const { data: rawData, isLoading, isFetching, isError } = useQuery({
    queryKey: ["home"],
    queryFn: getUltimoConcurso,
    staleTime: 1000 * 60 * 30,
  });

  // LÓGICA DE SEGURANÇA: Se rawData for uma lista, pegamos o primeiro item [0].
  // Isso resolve o erro de "Não foi possível carregar os dados".
  const c = Array.isArray(rawData) ? rawData[0] : rawData;

  const forceRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["home"] });
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

  // Se após a extração 'c' ainda for nulo ou não tiver a propriedade concurso
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

  // Tratamento de Dezenas e Municípios para 2026
  const dezenas = Array.isArray(c.dezenas) ? c.dezenas.map((d: any) => Number(d)) : [];
  
  let municipios = [];
  if (c.municipios) {
    municipios = typeof c.municipios === "string" ? JSON.parse(c.municipios) : c.municipios;
  }

  return (
    <Layout>
      {/* HERO SECTION */}
      <section className="gradient-hero text-primary-foreground py-16 md:py-24 text-center">
        <div className="container space-y-6 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 text-sm border border-white/10 text-white">
            <Sparkles className="h-4 w-4 text-yellow-300" />
            Loterias em Tempo Real • 2026
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-white">
            Lotofácil <span className="text-primary-foreground underline decoration-primary">Oficial</span>
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Acompanhe o resultado do Concurso {c.concurso} ({c.data}) e estatísticas detalhadas.
          </p>
          <Button asChild size="lg" className="bg-white text-primary hover:bg-slate-100 shadow-xl font-bold">
            <Link to="/palpites">Gerar Palpites Estratégicos</Link>
          </Button>
        </div>
      </section>

      <section className="py-12 container space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold">Último Sorteio</h2>
          <Button onClick={forceRefresh} variant="outline" size="sm" disabled={isFetching} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} /> 
            {isFetching ? "Sincronizando..." : "Atualizar"}
          </Button>
        </div>

        {/* CARD DAS DEZENAS */}
        <ConcursoCard concurso={c.concurso} data={c.data} dezenas={dezenas} />

        {/* DASHBOARD RÁPIDO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-slate-950 text-white border-none shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-[10px] uppercase text-slate-500 mb-4 flex items-center gap-2 font-bold">
                <BarChart3 className="h-3 w-3" /> Estatísticas do Concurso
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-3xl font-bold">{c.pares}P / {c.impares}Í</p>
                  <p className="text-[10px] text-slate-500 uppercase">Paridade</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">{c.soma}</p>
                  <p className="text-[10px] text-slate-500 uppercase">Soma Total</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary text-primary-foreground border-none shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-[10px] uppercase mb-2 font-bold">Estimativa de Prêmio</h3>
              <div className="flex justify-between items-end">
                <p className="text-3xl font-black">{formatarMoeda(c.estimativa_proximo)}</p>
                {c.acumulado && <Badge className="bg-white/20 text-white border-none animate-pulse">ACUMULOU</Badge>}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ONDE SAIU O PRÊMIO (MUNICÍPIOS) */}
        {municipios.length > 0 && (
          <Card className="border-none shadow-sm overflow-hidden bg-white">
            <CardHeader className="bg-red-50/50 py-3 border-b flex flex-row items-center gap-2">
              <MapPin className="h-4 w-4 text-red-600" />
              <CardTitle className="text-xs uppercase font-bold text-red-800">
                Ganhadores dos 15 Acertos
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex flex-wrap gap-3">
              {municipios.map((m: any, i: number) => (
                <div key={i} className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm">
                  <span className="font-black text-red-600 text-base">{m.uf}</span>
                  <span className="font-bold text-slate-700">{m.municipio}</span>
                  <Badge variant="secondary" className="font-bold bg-white">{m.ganhadores} aposta</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* TABELA DE RATEIO */}
        <Card className="border-none shadow-md overflow-hidden bg-white">
          <div className="bg-slate-50 px-6 py-4 border-b flex items-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-500" />
            <h3 className="font-bold text-sm uppercase">Rateio Detalhado</h3>
          </div>
          <CardContent className="p-0">
            {[15, 14, 13, 12, 11].map((n) => (
              <div key={n} className={`flex justify-between items-center px-6 py-4 border-b last:border-0 ${n === 15 ? "bg-primary/5" : ""}`}>
                <span className={`text-sm ${n === 15 ? "font-bold text-primary" : "font-semibold"}`}>{n} Acertos</span>
                <div className="text-right">
                  <p className="text-sm font-bold">{Number(c[`ganhadores_${n}`]).toLocaleString("pt-BR")} ganhadores</p>
                  <p className="text-xs text-muted-foreground">{formatarMoeda(c[`valor_${n}`])}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="text-center text-[10px] text-muted-foreground flex items-center justify-center gap-2 pb-10">
          <Info className="h-3 w-3" /> 
          Arrecadação Total: {formatarMoeda(c.arrecadacao)} • Concurso {c.concurso}
        </div>
      </section>
    </Layout>
  );
}

export default Home;
