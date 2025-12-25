import React from 'react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    subtitle?: string;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
    title,
    value,
    icon,
    subtitle,
    trend,
    trendValue,
    className,
}) => {
    return (
        <div className={cn(
            "bg-card rounded-2xl p-6 shadow-card border border-border hover:shadow-glow transition-all duration-300",
            className
        )}>
            <div className="flex items-start justify-between">
                <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <p className="text-3xl font-bold text-foreground">{value}</p>
                    {subtitle && (
                        <p className="text-xs text-muted-foreground">{subtitle}</p>
                    )}
                    {trend && trendValue && (
                        <div className={cn(
                            "flex items-center gap-1 text-xs font-medium",
                            trend === 'up' && "text-green-500",
                            trend === 'down' && "text-red-500",
                            trend === 'neutral' && "text-muted-foreground"
                        )}>
                            {trend === 'up' && '↑'}
                            {trend === 'down' && '↓'}
                            {trendValue}
                        </div>
                    )}
                </div>
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
                    {icon}
                </div>
            </div>
        </div>
    );
};

export default StatsCard;
