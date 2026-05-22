import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Props {
  children: React.ReactNode;
  className?: string;
}

export function AppCard({
  children,
  className,
}: Props) {
  return (
    <Card
      className={cn(
        "rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-lg",
        className
      )}
    >
      {children}
    </Card>
  );
}