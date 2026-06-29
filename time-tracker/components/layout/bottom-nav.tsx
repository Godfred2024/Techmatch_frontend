"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Clock, BarChart2, CalendarDays, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Accueil", icon: LayoutDashboard },
  { href: "/log", label: "Saisir", icon: Clock },
  { href: "/stats", label: "Stats", icon: BarChart2 },
  { href: "/calendar", label: "Agenda", icon: CalendarDays },
  { href: "/goals", label: "Objectifs", icon: ListChecks },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 max-w-md mx-auto">
      <div className="bg-white/90 backdrop-blur-xl border-t border-gray-100 safe-bottom">
        <div className="flex items-center justify-around px-2 pt-2 pb-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-150 min-w-0",
                  isActive ? "text-gray-900" : "text-gray-400 hover:text-gray-600"
                )}
              >
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.2 : 1.8}
                  className={cn(isActive && "fill-gray-900/8")}
                />
                <span className={cn("text-[10px] font-medium tracking-wide", isActive ? "text-gray-900" : "text-gray-400")}>
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
