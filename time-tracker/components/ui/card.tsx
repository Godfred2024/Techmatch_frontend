import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
}

export function Card({ className, glass, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl p-4",
        glass
          ? "bg-white/80 backdrop-blur-sm border border-white/40 shadow-sm"
          : "bg-white shadow-sm border border-gray-100",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
