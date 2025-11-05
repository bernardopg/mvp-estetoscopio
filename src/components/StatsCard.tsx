"use client";

import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    label: string;
  };
  color?: "blue" | "purple" | "green" | "orange" | "red";
}

const colorClasses = {
  blue: {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    icon: "text-blue-600 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-900",
  },
  purple: {
    bg: "bg-purple-50 dark:bg-purple-950/30",
    icon: "text-purple-600 dark:text-purple-400",
    border: "border-purple-200 dark:border-purple-900",
  },
  green: {
    bg: "bg-green-50 dark:bg-green-950/30",
    icon: "text-green-600 dark:text-green-400",
    border: "border-green-200 dark:border-green-900",
  },
  orange: {
    bg: "bg-orange-50 dark:bg-orange-950/30",
    icon: "text-orange-600 dark:text-orange-400",
    border: "border-orange-200 dark:border-orange-900",
  },
  red: {
    bg: "bg-red-50 dark:bg-red-950/30",
    icon: "text-red-600 dark:text-red-400",
    border: "border-red-200 dark:border-red-900",
  },
};

export default function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  color = "blue",
}: StatsCardProps) {
  const colors = colorClasses[color];

  return (
    <div
      className={`${colors.bg} ${colors.border} border rounded-xl p-6 transition-all hover:shadow-lg`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">
            {title}
          </p>
          <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            {value}
          </p>
          {description && (
            <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-1">
              {description}
            </p>
          )}
          {trend && (
            <p
              className={`text-xs font-medium mt-2 ${
                trend.value >= 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {trend.value >= 0 ? "+" : ""}
              {trend.value} {trend.label}
            </p>
          )}
        </div>
        <div
          className={`${colors.icon} p-3 rounded-lg bg-white dark:bg-zinc-800`}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
