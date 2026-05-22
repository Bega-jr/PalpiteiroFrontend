import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout/Layout";
import { PalpiteCard } from "@/components/palpites/PalpiteCard";
import { LoadingCard } from "@/components/feedback/LoadingStates";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import * as apiFunctions from "@/lib/api";
import { RefreshCw, BarChart3, Calculator, Calendar, ShieldAlert, Cpu, Sparkles, History } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { PalpiteEstatistico } from "@/types/palpites";
import { useAuth } from "@/hooks/useAuth";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


interface RespostaPalpitesUnificada {
  status: string;
  data_referencia: string | null;
  total: number;
  tipo_regime: string;
  dispersao: number;
  palpites: PalpiteEstatistico[];
}

export default function Palpites() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // 🔐 RESGATA O USUÁRIO LOGADO DIRETAMENTE DO SEU ECOSSISTEMA
  const { user } = useAuth(); 

  // 📡 REQUISIÇÃO CENTRALIZADA: Consome a rota única unificada do seu service Python
  const {
    data: respostaApi,
    isLoading,
    isFetching,
  } = useQuery<RespostaPalpitesUnificada>({
    queryKey: ["todosPalpites"],
    queryFn: apiFunctions.getPalpitesEstatisticos,
  });

  // 🧠 SEPARAÇÃO DINÂMICA DE ESCOPO:
  // Palpite de índice 1 vira o destaque "Ouro do Dia"
  const palpiteFixo = respostaApi?.palpites?.find(p => p.indice_palpite === 1);

  // Palpites de índice superior a 1 vão para o grid de sugestões
  const palpitesEstatisticos = respostaApi?.palpites?.filter(p => p.indice_palpite > 1) || [];

  // Metadados contextuais do motor adaptativo v19.0
  const dataReferencia = respostaApi?.data_referencia;
  const tipoRegime = respostaApi?.tipo_regime || "NEUTRO";
  const dispersao = respostaApi?.dispersao || 0;

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["todosPalpites"] });
    toast({ title: "Dados sincronizados com sucesso!" });
  };

  // Garante o parse correto das dezenas (Trata o JSONB nativo do Supabase)
  const parseNumbers = (val: unknown): number[] => {
    if (Array.isArray(val)) return val;
    try {
      return typeof val === "string" ? JSON.parse(val) : [];
    } catch {
      return [];
    }
  };

  return (
    <Layout>
      {/* HERO */}
      <section className="gradient-hero text-primary-foreground py-12 md:py-16">
        <div className="container max-w-3xl space-y-4">
          <div className="flex items-center gap-2 text-white/60 text-sm mb-2">
            <Calendar className="h-4 w-4" />
            <span>
              {dataReferencia
                ? `Análise de hoje: ${format(new Date(dataReferencia + 'T00:00:00'), "dd 'de' MMMM", { locale: ptBR })}`
                : "Aguardando dados de hoje..."}
            </span>
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
            Gerador de Palpites
          </h1>
          <p className="text-white/80 text-lg leading-relaxed">
            Palpites inteligentes recalculados por inteligência contextual, meta-learning e algoritmos genéticos para 2026.
          </p>
        </div>
      </section>

      <div className="container py-8 md:py-12 space-y-10">

               {/* 🧠 PAINEL CONTEXTUAL DO MOTOR DE IA (v19.0) */}
        <TooltipProvider delayDuration={200}>
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* CARD 1: DIRECIOMENTO DO MOTOR */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="bg-primary/5 border-primary/10 cursor-help transition-colors hover:bg-primary/10">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Direcionamento do Motor</p>
                      <h3 className="text-base font-bold font-display tracking-tight">
                        {tipoRegime === "CONTRACAO_FRIAS" 
                          ? "🛡️ Regime de Contração" 
                          : tipoRegime === "EXPANSAO_QUENTES" 
                          ? "🔥 Regime de Expansão" 
                          : "🔄 Regime Estável"}
                      </h3>
                    </div>
                    <Badge variant={tipoRegime === "CONTRACAO_FRIAS" ? "destructive" : "default"} className="font-mono text-[10px]">
                      {tipoRegime}
                    </Badge>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs p-3 bg-popover text-popover-foreground border shadow-md rounded-xl">
                <p className="text-xs font-bold text-primary mb-1">🧠 Como funciona o Regime?</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Avalia a média móvel de acertos dos palpites. Se o mercado oscilar negativamente, ativa-se o modo <span className="font-bold text-destructive">Contração</span> para blindar os jogos. Métricas estáveis liberam o modo <span className="font-bold text-primary">Expansão</span>.
                </p>
              </TooltipContent>
            </Tooltip>

            {/* CARD 2: VOLATILIDADE (SPREAD) */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="bg-primary/5 border-primary/10 cursor-help transition-colors hover:bg-primary/10">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Volatilidade (Spread)</p>
                      <h3 className="text-base font-bold font-display tracking-tight">
                        {dispersao >= 4 ? "Alta Variabilidade" : "Dispersão Controlada"}
                      </h3>
                    </div>
                    <Badge variant="outline" className="font-mono text-[10px] flex items-center gap-1">
                      <ShieldAlert className="h-3 w-3 text-amber-500" />
                      Spread: {dispersao}
                    </Badge>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs p-3 bg-popover text-popover-foreground border shadow-md rounded-xl">
                <p className="text-xs font-bold text-primary mb-1">📊 O que significa o Spread?</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Mede a distância matemática (amplitude) de acertos entre o melhor e o pior palpite do dia. Um <span className="font-bold text-amber-600">Spread &gt;= 4</span> indica alta oscilação no mercado, forçando o motor de IA a recalibrar os pesos estruturais.
                </p>
              </TooltipContent>
            </Tooltip>

            {/* CARD 3: CORE ALGORÍTMICO */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="bg-primary/5 border-primary/10 cursor-help transition-colors hover:bg-primary/10">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Core Algorítmico</p>
                      <h3 className="text-base font-bold font-display tracking-tight">Genetic Engine Ativo</h3>
                    </div>
                    <Badge variant="secondary" className="font-mono text-[10px] flex items-center gap-1">
                      <Cpu className="h-3 w-3" />
                      v19.0 Genetic
                    </Badge>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs p-3 bg-popover text-popover-foreground border shadow-md rounded-xl">
                <p className="text-xs font-bold text-primary mb-1">🧬 Motor Genético Evolutivo</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Combina cruzamentos matemáticos e mutações probabilísticas com base em mais de 3.600 concursos. Ele valida milhões de jogos por dia para extrair os 7 palpites com os melhores scores contextuais.
                </p>
              </TooltipContent>
            </Tooltip>

          </section>
        </TooltipProvider>

        {/* 🔐 INDICADOR DE CONTA CONECTADA (useAuth) */}
        {user?.email && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 px-3 py-2 rounded-xl border border-dashed w-fit animate-fade-in">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Palpites salvos serão associados à conta: <strong className="text-foreground font-mono text-primary/90">{user.email}</strong></span>
          </div>
        )}

        {/* PALPITE FIXO (OURO DO DIA - ÍNDICE 1) */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="font-display text-2xl font-bold">Ouro do Dia</h2>
              <Badge className="bg-lottery-gold text-white border-none animate-pulse flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> Melhor Score
              </Badge>
              {palpiteFixo?.memoria_aplicada && (
                <Badge className="bg-emerald-600 text-white border-none text-[10px] font-medium">
                  🧠 Memória Ativa
                </Badge>
              )}
            </div>
            {palpiteFixo && palpiteFixo.score > 0 && (
              <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-md font-mono">
                Confiança: {(palpiteFixo.score * 100).toFixed(2)}%
              </span>
            )}
          </div>
          {isLoading ? (
            <LoadingCard />
          ) : palpiteFixo?.numeros ? (
            <div className="space-y-3">
              <PalpiteCard
                numeros={parseNumbers(palpiteFixo.numeros)}
                highlight
                showSaveButton
              />
              <div className="flex flex-wrap items-center justify-between gap-4 px-2 text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                <div className="flex gap-4">
                  <span className="flex items-center gap-1">
                    <Calculator className="h-3 w-3"/> Soma: {palpiteFixo.soma_total || '--'}
                  </span>
                  <span>Pares: {palpiteFixo.pares || '--'}</span>
                  <span>Ímpares: {palpiteFixo.impares || '--'}</span>
                </div>
                <div className="flex items-center gap-4 font-mono text-[9px] lowercase text-muted-foreground/70">
                  {palpiteFixo.score_backtest && (
                    <span className="flex items-center gap-1 uppercase font-sans tracking-normal font-bold">
                      <History className="h-3 w-3 text-primary" /> Backtest: {palpiteFixo.score_backtest.toFixed(4)}
                    </span>
                  )}
                  {palpiteFixo.versao_gerador && <span>{palpiteFixo.versao_gerador}</span>}
                </div>
              </div>
            </div>
          ) : (
            <Card className="border-dashed bg-muted/10">
              <CardContent className="p-12 text-center text-muted-foreground">
                Nenhum palpite mestre gerado para o concurso vigente.
              </CardContent>
            </Card>
          )}
        </section>

        {/* PALPITES ESTATÍSTICOS (RESTANTE DA LISTA: ÍNDICES DE 2 A 7) */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <h2 className="font-display text-2xl font-bold">Sugestões do Sistema</h2>
            <Badge variant="secondary" className="font-mono">
              {palpitesEstatisticos.length}
            </Badge>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <LoadingCard key={i} />
              ))}
            </div>
          ) : palpitesEstatisticos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {palpitesEstatisticos.map((p: PalpiteEstatistico) => (
                <div key={p.indice_palpite} className="space-y-2 relative">
                  
                  {/* Selo dinâmico de Inteligência de Ancoragem Histórica */}
                  {p.memoria_aplicada && (
                    <Badge className="absolute -top-2 -right-1 bg-emerald-600 hover:bg-emerald-600 text-white text-[9px] border-none z-10 font-medium">
                      🧠 Memória Ativa
                    </Badge>
                  )}

                  <PalpiteCard
                    index={p.indice_palpite}
                    numeros={parseNumbers(p.numeros)}
                    showSaveButton
                  />
                  <div className="flex justify-between items-center px-1">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex gap-2 text-[9px] text-muted-foreground font-bold uppercase">
                        <span>Soma: {p.soma_total || '--'}</span>
                        <span>P: {p.pares || '--'} / I: {p.impares || '--'}</span>
                      </div>
                      
                      {/* Exibe o indicador de Backtest Real calculado pelo service */}
                      {p.score_backtest && (
                        <span className="text-[8px] font-bold text-muted-foreground/70 tracking-wide uppercase flex items-center gap-0.5 font-sans">
                          <History className="h-2 w-2 text-primary/70" /> Backtest: <span className="font-mono text-primary font-extrabold">{p.score_backtest.toFixed(4)}</span>
                        </span>
                      )}
                    </div>
                    {p.score > 0 && (
                      <Badge variant="outline" className="text-[9px] h-4 py-0 leading-none border-primary/20 text-primary font-mono font-bold">
                        Score: {(p.score * 100).toFixed(2)}%
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="p-12 text-center text-muted-foreground">
                Aguardando a consolidação diária dos palpites adaptativos.
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </Layout>
  );
}
