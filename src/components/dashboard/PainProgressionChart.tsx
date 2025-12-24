import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';

interface PainChartProps {
    data: {
        date: string;
        before: number | null;
        after: number | null;
        improvement: number;
    }[];
}

export const PainProgressionChart: React.FC<PainChartProps> = ({ data }) => {
    // Filter only days with data
    const dataWithValues = data.filter(d => d.before !== null || d.after !== null);

    // Calculate overall improvement
    const hasData = dataWithValues.length > 0;
    const avgImprovement = hasData
        ? Math.round(dataWithValues.reduce((sum, d) => sum + d.improvement, 0) / dataWithValues.length)
        : 0;

    return (
        <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="font-display font-semibold text-lg text-foreground">
                        Pain Progression
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Track your pain levels before & after exercises
                    </p>
                </div>

                {hasData && (
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${avgImprovement > 0
                            ? 'bg-green-500/10 text-green-500'
                            : avgImprovement < 0
                                ? 'bg-red-500/10 text-red-500'
                                : 'bg-muted text-muted-foreground'
                        }`}>
                        {avgImprovement > 0 ? (
                            <TrendingDown className="w-4 h-4" />
                        ) : avgImprovement < 0 ? (
                            <TrendingUp className="w-4 h-4" />
                        ) : (
                            <Minus className="w-4 h-4" />
                        )}
                        {Math.abs(avgImprovement)}% {avgImprovement > 0 ? 'improved' : avgImprovement < 0 ? 'increase' : 'stable'}
                    </div>
                )}
            </div>

            {!hasData ? (
                <div className="h-48 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <span className="text-2xl">📊</span>
                    </div>
                    <p className="text-muted-foreground mb-1">No pain data recorded yet</p>
                    <p className="text-sm text-muted-foreground">
                        Complete exercises to track your pain progression
                    </p>
                </div>
            ) : (
                <>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="beforeGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="afterGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    stroke="hsl(var(--muted-foreground))"
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    domain={[0, 10]}
                                    stroke="hsl(var(--muted-foreground))"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    ticks={[0, 2, 4, 6, 8, 10]}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: '12px',
                                        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                                    }}
                                    labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                                    formatter={(value: number, name: string) => [
                                        value !== null ? `${value}/10` : 'No data',
                                        name === 'before' ? 'Before Exercise' : 'After Exercise'
                                    ]}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="before"
                                    stroke="#ef4444"
                                    strokeWidth={2}
                                    fill="url(#beforeGradient)"
                                    dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 6 }}
                                    connectNulls
                                />
                                <Area
                                    type="monotone"
                                    dataKey="after"
                                    stroke="#22c55e"
                                    strokeWidth={2}
                                    fill="url(#afterGradient)"
                                    dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 6 }}
                                    connectNulls
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Legend */}
                    <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500" />
                            <span className="text-muted-foreground">Before Exercise</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500" />
                            <span className="text-muted-foreground">After Exercise</span>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default PainProgressionChart;
