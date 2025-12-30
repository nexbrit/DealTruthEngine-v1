'use client';

import Link from 'next/link';
import { Deal } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Building2, Calendar, TrendingUp, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DealCardProps {
  deal: Deal;
}

const STAGE_CONFIG = {
  in_sight: { label: 'In Sight', variant: 'secondary' as const },
  diligence: { label: 'Diligence', variant: 'amber' as const },
  stabilise: { label: 'Stabilise', variant: 'green' as const },
};

export function DealCard({ deal }: DealCardProps) {
  const stageConfig = STAGE_CONFIG[deal.stage] || STAGE_CONFIG.in_sight;

  return (
    <Link href={`/deals/${deal.id}`}>
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 hover:border-zinc-700 transition-colors cursor-pointer">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-zinc-800 rounded-lg">
              <Building2 className="w-5 h-5 text-zinc-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">{deal.name}</h3>
              <p className="text-zinc-400 text-sm">{deal.target_company}</p>
            </div>
          </div>
          <Badge variant={stageConfig.variant}>{stageConfig.label}</Badge>
        </div>

        <div className="mt-4 flex items-center gap-4 text-sm text-zinc-500">
          {deal.target_revenue && (
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              <span>{formatCurrency(Number(deal.target_revenue), deal.currency)}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(deal.created_at)}</span>
          </div>
        </div>

        {deal.thesis_summary && (
          <p className="mt-3 text-zinc-500 text-sm line-clamp-2">
            {deal.thesis_summary}
          </p>
        )}

        <div className="mt-4 flex items-center justify-end text-green-500 text-sm font-medium">
          View Deal <ChevronRight className="w-4 h-4 ml-1" />
        </div>
      </div>
    </Link>
  );
}
