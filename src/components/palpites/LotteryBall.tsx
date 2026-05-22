import { cn } from "@/lib/utils";

interface LotteryBallProps {
  number: number;
  active?: boolean;
  size?: "sm" | "md" | "lg";
  highlighted?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
};

export function LotteryBall({
  number,
  active = true,
  size = "md",
  highlighted = false,
  className,
}: LotteryBallProps) {
  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-bold transition-all duration-200",
        sizeClasses[size],
        active
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground",
        highlighted && "shadow-glow animate-pulse-glow",
        className
      )}
    >
      {number.toString().padStart(2, "0")}
    </div>
  );
}
