import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
}: StatCardProps) {
  return (
    <div
      className="
        bg-card
        border
        border-border
        rounded-2xl
        shadow-lg
        p-6
        transition-all
        duration-300
        hover:shadow-xl
        hover:-translate-y-1
      "
    >
      <div className="flex items-start justify-between">

        <div className="space-y-2">

          <p className="text-sm text-muted-foreground font-medium">
            {title}
          </p>

          <h3 className="text-3xl font-bold tracking-tight">
            {value}
          </h3>

          {description && (
            <p className="text-xs text-muted-foreground">
              {description}
            </p>
          )}

        </div>

        <div
          className="
            w-12
            h-12
            rounded-xl
            bg-primary/10
            flex
            items-center
            justify-center
          "
        >
          <Icon className="w-6 h-6 text-primary" />
        </div>

      </div>
    </div>
  );
}