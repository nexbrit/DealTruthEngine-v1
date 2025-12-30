'use client';

interface ConfidenceBadgeProps {
  confidence: 'high' | 'medium' | 'low' | 'none';
}

const CONFIDENCE_STYLES = {
  high: 'bg-green-500/20 text-green-400',
  medium: 'bg-amber-500/20 text-amber-400',
  low: 'bg-red-500/20 text-red-400',
  none: 'bg-zinc-500/20 text-zinc-400',
};

const CONFIDENCE_LABELS = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  none: 'None',
};

export function ConfidenceBadge({ confidence }: ConfidenceBadgeProps) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CONFIDENCE_STYLES[confidence]}`}>
      {CONFIDENCE_LABELS[confidence]}
    </span>
  );
}
