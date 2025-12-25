import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface WeeklyChartProps {
    data: { day: string; sessions: number; reps: number }[];
}

export const WeeklyChart: React.FC<WeeklyChartProps> = ({ data }) => {
    const maxSessions = Math.max(...data.map(d => d.sessions), 1);

    return (
        <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-display font-semibold text-lg text-foreground">
                    Weekly Activity
                </h3>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-primary" />
                        <span>Sessions</span>
                    </div>
                </div>
            </div>

            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                        <XAxis
                            dataKey="day"
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            allowDecimals={false}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '12px',
                                boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                            }}
                            labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                            itemStyle={{ color: 'hsl(var(--muted-foreground))' }}
                            formatter={(value: number, name: string) => [
                                value,
                                name === 'sessions' ? 'Sessions' : 'Reps'
                            ]}
                        />
                        <Bar
                            dataKey="sessions"
                            radius={[8, 8, 0, 0]}
                            maxBarSize={50}
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.sessions > 0
                                        ? `hsl(var(--primary))`
                                        : 'hsl(var(--secondary))'
                                    }
                                    opacity={entry.sessions > 0 ? 0.5 + (entry.sessions / maxSessions) * 0.5 : 0.3}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Summary stats */}
            <div className="mt-4 pt-4 border-t border-border grid grid-cols-3 gap-4">
                <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">
                        {data.reduce((sum, d) => sum + d.sessions, 0)}
                    </p>
                    <p className="text-xs text-muted-foreground">Total Sessions</p>
                </div>
                <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">
                        {data.reduce((sum, d) => sum + d.reps, 0)}
                    </p>
                    <p className="text-xs text-muted-foreground">Total Reps</p>
                </div>
                <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">
                        {data.filter(d => d.sessions > 0).length}
                    </p>
                    <p className="text-xs text-muted-foreground">Active Days</p>
                </div>
            </div>
        </div>
    );
};

export default WeeklyChart;
