import { cn } from "@/lib/utils";
import { LotteryBall } from "./LotteryBall";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Calendar, Hash } from "lucide-react";

interface ConcursoCardProps {
  concurso: number;
  data: string;
  dezenas: number[];
  className?: string;
  compact?: boolean;
}

export function ConcursoCard({
  concurso,
  data,
  dezenas,
  className,
  compact = false,
}: ConcursoCardProps) {
  const sortedDezenas = [...dezenas].sort((a, b) => a - b);
  
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  if (compact) {
    return (
      <div className={cn("flex items-center gap-4 p-4 bg-card rounded-lg border", className)}>
        <div className="flex flex-col gap-1">
          <Badge variant="outline" className="w-fit">
            <Hash className="h-3 w-3 mr-1" />
            {concurso}
          </Badge>
          <span className="text-xs text-muted-foreground">{formatDate(data)}</span>
        </div>
        <div className="flex flex-wrap gap-1.5 flex-1">
          {sortedDezenas.map((num, i) => (
            <LotteryBall key={i} number={num} size="sm" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <Hash className="h-5 w-5 text-primary" />
            Concurso {concurso}
          </CardTitle>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(data)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 justify-center">
          {sortedDezenas.map((num, i) => (
            <LotteryBall key={i} number={num} size="md" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
