import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
}

export function StatCard({ label, value, icon: Icon, trend }: StatCardProps) {
  return (
    <Card className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-gray-400">{label}</p>
        <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center">
          <Icon size={14} className="text-gray-500" />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {trend && (
        <p className="text-xs text-emerald-600 font-medium">{trend} vs semaine préc.</p>
      )}
    </Card>
  );
}
