import React, { ReactNode } from 'react';
import { Card } from './ui/card';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'success' | 'danger';
}

export function KPICard({
  title,
  value,
  icon: Icon,
  subtitle,
  trend,
  variant = 'default',
}: KPICardProps) {
  const variantStyles = {
    default: 'bg-white',
    primary: 'bg-[#0052CC] text-white',
    success: 'bg-[#00C47E] text-white',
    danger: 'bg-[#FF3B30] text-white',
  };

  const iconStyles = {
    default: 'bg-[#0052CC]/10 text-[#0052CC]',
    primary: 'bg-white/20 text-white',
    success: 'bg-white/20 text-white',
    danger: 'bg-white/20 text-white',
  };

  return (
    <Card className={`p-6 ${variantStyles[variant]}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p
            className={`text-sm mb-1 ${
              variant === 'default' ? 'text-muted-foreground' : 'opacity-90'
            }`}
          >
            {title}
          </p>
          <h2 className="text-3xl mb-1">{value}</h2>
          {subtitle && (
            <p
              className={`text-sm ${
                variant === 'default' ? 'text-muted-foreground' : 'opacity-80'
              }`}
            >
              {subtitle}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${iconStyles[variant]}`}>
          <Icon className="size-6" />
        </div>
      </div>
      {trend && (
        <div className="flex items-center gap-1">
          <span
            className={`text-sm ${
              trend.isPositive
                ? variant === 'default'
                  ? 'text-green-600'
                  : 'text-white'
                : variant === 'default'
                ? 'text-red-600'
                : 'text-white'
            }`}
          >
            {trend.isPositive ? '↑' : '↓'} {trend.value}
          </span>
        </div>
      )}
    </Card>
  );
}
