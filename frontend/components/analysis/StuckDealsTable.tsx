'use client';

import { AlertTriangle } from 'lucide-react';

interface StuckDeal {
  name: string;
  stage: string;
  days_in_stage: number;
}

interface StuckDealsTableProps {
  deals: StuckDeal[];
}

export function StuckDealsTable({ deals }: StuckDealsTableProps) {
  if (!deals || deals.length === 0) {
    return (
      <div className="text-center py-6 text-zinc-500">
        <div className="text-green-500 text-lg mb-1">✓</div>
        <p className="text-sm">No stuck deals detected</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-amber-500 mb-3">
        <AlertTriangle className="w-4 h-4" />
        <span className="text-sm font-medium">{deals.length} stuck deal{deals.length > 1 ? 's' : ''}</span>
      </div>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {deals.map((deal, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/50"
          >
            <div className="min-w-0 flex-1">
              <p className="text-white text-sm font-medium truncate">{deal.name}</p>
              <p className="text-zinc-500 text-xs">{deal.stage}</p>
            </div>
            <div className="text-right ml-3">
              <span className={`text-sm font-bold ${
                deal.days_in_stage > 90 ? 'text-red-400' : 'text-amber-400'
              }`}>
                {deal.days_in_stage}d
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
