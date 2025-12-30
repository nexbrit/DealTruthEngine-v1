'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface ConcentrationChartProps {
  topPercent: number;
  label?: string;
}

export function ConcentrationChart({ topPercent, label = "Top 10 Opportunities" }: ConcentrationChartProps) {
  const data = [
    { name: label, value: topPercent, color: '#ef4444' },
    { name: 'Others', value: 100 - topPercent, color: '#3f3f46' },
  ];

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={70}
            paddingAngle={2}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#18181b',
              border: '1px solid #3f3f46',
              borderRadius: '8px',
              color: '#fff',
            }}
            formatter={(value: number) => [`${value.toFixed(1)}%`, '']}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => <span className="text-zinc-400 text-sm">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
