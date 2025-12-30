'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';

interface WinRateChartProps {
  overall: number;
  bySegment?: Record<string, number>;
}

export function WinRateChart({ overall, bySegment }: WinRateChartProps) {
  const chartData = bySegment
    ? Object.entries(bySegment).map(([segment, rate]) => ({
        segment: segment.length > 15 ? segment.slice(0, 15) + '...' : segment,
        rate,
        fill: rate >= overall ? '#22c55e' : rate >= overall * 0.7 ? '#f59e0b' : '#ef4444',
      }))
    : [];

  if (chartData.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl font-bold text-white">{overall.toFixed(1)}%</div>
          <div className="text-zinc-500 text-sm mt-1">Overall Win Rate</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ left: 10, right: 20, top: 10, bottom: 10 }}>
          <XAxis
            dataKey="segment"
            tick={{ fill: '#a1a1aa', fontSize: 11 }}
            axisLine={{ stroke: '#3f3f46' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#71717a', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#18181b',
              border: '1px solid #3f3f46',
              borderRadius: '8px',
              color: '#fff',
            }}
            formatter={(value: number) => [`${value.toFixed(1)}%`, 'Win Rate']}
          />
          <ReferenceLine
            y={overall}
            stroke="#a1a1aa"
            strokeDasharray="3 3"
            label={{ value: `Avg: ${overall.toFixed(0)}%`, fill: '#a1a1aa', fontSize: 10, position: 'right' }}
          />
          <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
