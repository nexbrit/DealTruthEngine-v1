'use client';

import { ChevronRight } from 'lucide-react';
import { ConfidenceBadge } from './ConfidenceBadge';

interface StressLineProps {
  label: string;
  status: 'green' | 'amber' | 'red' | 'grey';
  confidence: 'high' | 'medium' | 'low' | 'none';
  summary?: string | null;
  flags: string[];
  onClick?: () => void;
}

const STATUS_COLORS = {
  green: 'bg-green-500',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
  grey: 'bg-zinc-500',
};

export function StressLine({ label, status, confidence, summary, flags, onClick }: StressLineProps) {
  return (
    <div
      className="bg-zinc-800 rounded-lg p-4 hover:bg-zinc-750 cursor-pointer transition-colors border border-zinc-700/50"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${STATUS_COLORS[status]}`} />
          <span className="text-white font-medium">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <ConfidenceBadge confidence={confidence} />
          <ChevronRight className="w-4 h-4 text-zinc-400" />
        </div>
      </div>
      {summary && (
        <p className="text-zinc-400 text-sm mt-2 ml-6">{summary}</p>
      )}
      {flags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2 ml-6">
          {flags.slice(0, 3).map((flag, i) => (
            <span key={i} className="text-xs bg-zinc-700 text-zinc-300 px-2 py-0.5 rounded">
              {flag}
            </span>
          ))}
          {flags.length > 3 && (
            <span className="text-xs text-zinc-500">+{flags.length - 3} more</span>
          )}
        </div>
      )}
    </div>
  );
}
