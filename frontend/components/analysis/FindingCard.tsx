'use client';

interface FindingCardProps {
  title: string;
  status?: 'high' | 'medium' | 'low' | string;
  finding?: string;
  metric?: string;
}

const STATUS_STYLES = {
  high: 'border-red-500/30 bg-red-500/5',
  medium: 'border-amber-500/30 bg-amber-500/5',
  low: 'border-green-500/30 bg-green-500/5',
  red: 'border-red-500/30 bg-red-500/5',
  amber: 'border-amber-500/30 bg-amber-500/5',
  green: 'border-green-500/30 bg-green-500/5',
};

const STATUS_DOT = {
  high: 'bg-red-500',
  medium: 'bg-amber-500',
  low: 'bg-green-500',
  red: 'bg-red-500',
  amber: 'bg-amber-500',
  green: 'bg-green-500',
};

export function FindingCard({ title, status, finding, metric }: FindingCardProps) {
  const statusKey = status?.toLowerCase() as keyof typeof STATUS_STYLES;
  const borderStyle = STATUS_STYLES[statusKey] || 'border-zinc-700 bg-zinc-800/50';
  const dotStyle = STATUS_DOT[statusKey] || 'bg-zinc-500';

  return (
    <div className={`rounded-lg border p-4 ${borderStyle}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${dotStyle}`} />
          <h4 className="text-white font-medium text-sm">{title}</h4>
        </div>
        {metric && (
          <span className="text-zinc-400 text-sm font-medium">{metric}</span>
        )}
      </div>
      {finding && (
        <p className="text-zinc-400 text-sm">{finding}</p>
      )}
    </div>
  );
}
