import { useState } from "react";

import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

import { LotteryBall } from "./LotteryBall";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  Save,
  Trophy,
  Check,
  Loader2,
} from "lucide-react";

import { useToast } from "@/hooks/use-toast";

interface PalpiteCardProps {
  numeros: number[];

  scoreMedio?: number;

  metricas?: {
    soma: number;
    pares: number;
    impares: number;
    primos: number;
    moldura?: number;
    centro?: number;
  };

  index?: number;

  showSaveButton?: boolean;

  className?: string;

  highlight?: boolean;
}

export function PalpiteCard({
  numeros,
  scoreMedio,
  metricas,
  index,
  showSaveButton = false,
  className,
  highlight = false,
}: PalpiteCardProps) {
  const { toast } = useToast();

  const [saving, setSaving] = useState(false);

  const [saved, setSaved] = useState(false);

  // ======================================================
  // PROTEÇÃO ARRAY
  // ======================================================

  const sortedNumeros = Array.isArray(numeros)
    ? [...numeros].sort((a, b) => a - b)
    : [];

  // ======================================================
  // SALVAR PALPITE
  // ======================================================

  const handleSave = async () => {
    if (!sortedNumeros.length) return;

    setSaving(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "Login necessário",
          description:
            "Faça login para salvar palpites.",
          variant: "destructive",
        });

        return;
      }

      // ============================================
      // EVITAR DUPLICADOS
      // ============================================

      const { data: existing } = await supabase
        .from("saved_games")
        .select("id")
        .eq("user_id", user.id)
        .eq("numbers", sortedNumeros)
        .maybeSingle();

      if (existing) {
        toast({
          title: "Palpite já salvo",
          description:
            "Este jogo já existe no seu histórico.",
        });

        setSaved(true);

        return;
      }

      // ============================================
      // SALVAR
      // ============================================

      const payload = {
        user_id: user.id,

        numbers: sortedNumeros,

        contest_type: "standard",

        stats: {
          score: scoreMedio || 0,

          soma: metricas?.soma || 0,

          pares: metricas?.pares || 0,

          impares: metricas?.impares || 0,

          primos: metricas?.primos || 0,
        },

        played: false,

        prize_amount: 0,
      };

      const { error } = await supabase
        .from("saved_games")
        .insert(payload);

      if (error) {
        console.error(error);

        toast({
          title: "Erro ao salvar",
          description: error.message,
          variant: "destructive",
        });

        return;
      }

      setSaved(true);

      toast({
        title: "Palpite salvo",
        description:
          "O jogo foi salvo no seu histórico.",
      });
    } catch (error) {
      console.error(error);

      toast({
        title: "Erro inesperado",
        description:
          "Não foi possível salvar o jogo.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all duration-300 hover:shadow-lg border-border/60",
        highlight && "ring-2 ring-primary shadow-glow",
        className
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-display flex items-center gap-2">
            {index !== undefined && (
              <span className="text-muted-foreground">
                #{index + 1}
              </span>
            )}

            {highlight && (
              <Trophy className="h-5 w-5 text-lottery-gold" />
            )}

            Palpite
          </CardTitle>

          {scoreMedio !== undefined && (
            <Badge
              variant="secondary"
              className="font-mono"
            >
              Score: {scoreMedio.toFixed(1)}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* NÚMEROS */}

        <div className="flex flex-wrap gap-2 justify-center">
          {sortedNumeros.length > 0 ? (
            sortedNumeros.map((num, i) => (
              <LotteryBall
                key={`${index}-ball-${i}`}
                number={num}
                active
                highlighted={highlight}
                size="md"
              />
            ))
          ) : (
            <p className="text-xs text-muted-foreground italic">
              Nenhum número disponível
            </p>
          )}
        </div>

        {/* MÉTRICAS */}

        {metricas && (
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <div className="bg-muted rounded-lg p-2">
              <div className="text-muted-foreground text-xs">
                Soma
              </div>

              <div className="font-semibold">
                {metricas.soma}
              </div>
            </div>

            <div className="bg-muted rounded-lg p-2">
              <div className="text-muted-foreground text-xs">
                Pares
              </div>

              <div className="font-semibold">
                {metricas.pares}
              </div>
            </div>

            <div className="bg-muted rounded-lg p-2">
              <div className="text-muted-foreground text-xs">
                Ímpares
              </div>

              <div className="font-semibold">
                {metricas.impares}
              </div>
            </div>
          </div>
        )}

        {/* BOTÃO SALVAR */}

        {showSaveButton && (
          <Button
            onClick={handleSave}
            disabled={saving || saved}
            variant={saved ? "default" : "outline"}
            className="w-full"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : saved ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Salvo
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar Palpite
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}