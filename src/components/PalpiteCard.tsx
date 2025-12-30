import { cn } from "@/lib/utils";
import { LotteryBall } from "./LotteryBall";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Save, Trophy } from "lucide-react";

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
  onSave?: () => void;
  className?: string;
  highlight?: boolean;
}

export function PalpiteCard({
  numeros,
  scoreMedio,
  metricas,
  index,
  showSaveButton = false,
  onSave,
  className,
  highlight = false,
}: PalpiteCardProps) {
  
  // ✅ CORREÇÃO 1: Proteção contra 'numeros' não ser uma array
  // Se 'numeros' vier como null ou objeto da API, o componente não quebra.
  const sortedNumeros = Array.isArray(numeros) 
    ? [...numeros].sort((a, b) => a - b) 
    : [];

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all duration-300 hover:shadow-lg",
        highlight && "ring-2 ring-primary shadow-glow",
        className
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-display flex items-center gap-2">
            {index !== undefined && (
              <span className="text-muted-foreground">#{index + 1}</span>
            )}
            {highlight && <Trophy className="h-5 w-5 text-lottery-gold" />}
            Palpite
          </CardTitle>
          {scoreMedio !== undefined && (
            <Badge variant="secondary" className="font-mono">
              Score: {scoreMedio.toFixed(1)}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Números do palpite */}
        <div className="flex flex-wrap gap-2 justify-center">
          {/* ✅ CORREÇÃO 2: .map protegido */}
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
            <p className="text-xs text-muted-foreground italic">Nenhum número disponível</p>
          )}
        </div>

        {/* Métricas */}
        {metricas && (
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <div className="bg-muted rounded-lg p-2">
              <div className="text-muted-foreground text-xs">Soma</div>
              <div className="font-semibold">{metricas.soma}</div>
            </div>
            <div className="bg-muted rounded-lg p-2">
              <div className="text-muted-foreground text-xs">Pares</div>
              <div className="font-semibold">{metricas.pares}</div>
            </div>
            <div className="bg-muted rounded-lg p-2">
              <div className="text-muted-foreground text-xs">Ímpares</div>
              <div className="font-semibold">{metricas.impares}</div>
            </div>
            <div className="bg-muted rounded-lg p-2">
              <div className="text-muted-foreground text-xs">Primos</div>
              <div className="font-semibold">{metricas.primos}</div>
            </div>
            {metricas.moldura !== undefined && (
              <div className="bg-muted rounded-lg p-2">
                <div className="text-muted-foreground text-xs">Moldura</div>
                <div className="font-semibold">{metricas.moldura}</div>
              </div>
            )}
            {metricas.centro !== undefined && (
              <div className="bg-muted rounded-lg p-2">
                <div className="text-muted-foreground text-xs">Centro</div>
                <div className="font-semibold">{metricas.centro}</div>
              </div>
            )}
          </div>
        )}

        {/* Botão Salvar */}
        {showSaveButton && onSave && (
          <Button onClick={onSave} variant="outline" className="w-full">
            <Save className="mr-2 h-4 w-4" />
            Salvar Palpite
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
