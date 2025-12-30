'use client';

import { StressLine } from './StressLine';
import { StressLine as StressLineType, STRESS_LINE_LABELS, StressLineName } from '@/types';

interface StressMapProps {
  stressLines: StressLineType[];
  onLineClick?: (name: string) => void;
}

export function StressMap({ stressLines, onLineClick }: StressMapProps) {
  // Sort stress lines in a consistent order
  const orderedNames: StressLineName[] = [
    'revenue_quality',
    'margin_utilisation',
    'working_capital',
    'execution_capacity',
    'customer_concentration',
  ];

  const sortedLines = orderedNames.map(
    name => stressLines.find(sl => sl.name === name)
  ).filter((sl): sl is StressLineType => sl !== undefined);

  return (
    <div className="bg-zinc-900 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-white mb-4">Thesis Stress Map</h2>
      <div className="space-y-3">
        {sortedLines.map((line) => (
          <StressLine
            key={line.name}
            label={STRESS_LINE_LABELS[line.name as StressLineName] || line.name}
            status={line.status}
            confidence={line.confidence}
            summary={line.summary}
            flags={line.flags}
            onClick={() => onLineClick?.(line.name)}
          />
        ))}
        {sortedLines.length === 0 && (
          <p className="text-zinc-500 text-sm text-center py-4">
            No stress lines configured
          </p>
        )}
      </div>
    </div>
  );
}
