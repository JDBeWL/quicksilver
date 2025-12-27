'use client';

import { useState, useEffect } from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface InteractiveChartProps {
    title?: string;
    data: any[];
}

export default function InteractiveChart({ title = 'Chart', data }: InteractiveChartProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <Card className="my-8">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full" style={{ minHeight: '300px' }}>
                    {mounted ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                <Tooltip />
                                <Bar dataKey="total" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                            Loading chart...
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
