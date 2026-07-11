import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'orange' | 'purple' | 'red';
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  color = 'blue',
}: StatsCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-brand-500',
    orange: 'bg-orange-500',
    purple: 'bg-purple-500',
    red: 'bg-red-500',
  };
  const glowClasses = {
    blue: 'from-blue-500/5',
    green: 'from-brand-500/5',
    orange: 'from-orange-500/5',
    purple: 'from-purple-500/5',
    red: 'from-red-500/5',
  };

  return (
    <Card className="relative overflow-hidden transition-shadow hover:shadow-md">
      <div
        className={cn(
          'pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent',
          glowClasses[color]
        )}
      />
      <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-semibold text-gray-600">{title}</CardTitle>
        <div className={cn('p-2 rounded-lg shadow-sm', colorClasses[color])}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </CardHeader>
      <CardContent className="relative">
        <div className="text-3xl font-bold tracking-tight text-gray-900 tabular-nums">{value}</div>
        {description && <p className="text-xs text-gray-500 mt-1 font-medium">{description}</p>}
        {trend && (
          <div className="flex items-center mt-3">
            <span
              className={cn(
                'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-semibold',
                trend.isPositive ? 'bg-brand-50 text-brand-700' : 'bg-red-50 text-red-600'
              )}
            >
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </span>
            <span className="text-xs text-gray-400 ml-2 font-medium">vs mes anterior</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
