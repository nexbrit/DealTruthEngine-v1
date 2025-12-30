'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';

interface VelocityChartProps {
  data: Record<string, number>;
  benchmark?: number;
}

export function VelocityChart({ data, benchmark = 45 }: VelocityChartProps) {
  const chartData = Object.entries(data).map(([stage, days]) => ({
    stage: stage.length > 12 ? stage.slice(0, 12) + '...' : stage,
    days,
    fill: days > benchmark ? '#ef4444' : days > benchmark * 0.7 ? '#f59e0b' : '#22c55e',
  }));

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20 }}>
          <XAxis
            type="number"
            tick={{ fill: '#71717a', fontSize: 12 }}
            axisLine={{ stroke: '#3f3f46' }}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="stage"
            tick={{ fill: '#a1a1aa', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={80}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#18181b',
              border: '1px solid #3f3f46',
              borderRadius: '8px',
              color: '#fff',
            }}
            formatter={(value: number) => [`${value} days`, 'Avg Duration']}
          />
          <ReferenceLine
            x={benchmark}
            stroke="#71717a"
            strokeDasharray="3 3"
            label={{ value: 'Benchmark', fill: '#71717a', fontSize: 10 }}
          />
          <Bar dataKey="days" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
