'use client';

import { Analysis } from '@/types';
import { formatDate } from '@/lib/utils';
import { FileSearch, TrendingUp, DollarSign, BarChart3, ChevronRight } from 'lucide-react';

interface AnalysisListProps {
  analyses: Analysis[];
  onSelect: (analysis: Analysis) => void;
  selectedId?: string;
}

const ANALYSIS_TYPE_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  pipeline_analysis: {
    label: 'Pipeline Analysis',
    icon: TrendingUp,
    color: 'text-blue-400',
  },
  utilisation_analysis: {
    label: 'Utilisation Analysis',
    icon: BarChart3,
    color: 'text-purple-400',
  },
  ar_ageing_analysis: {
    label: 'AR Ageing Analysis',
    icon: DollarSign,
    color: 'text-amber-400',
  },
};

const STATUS_COLORS = {
  green: 'bg-green-500',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
  grey: 'bg-zinc-500',
};

export function AnalysisList({ analyses, onSelect, selectedId }: AnalysisListProps) {
  if (analyses.length === 0) {
    return (
      <div className="text-center py-8 text-zinc-500">
        <FileSearch className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>No analyses run yet</p>
        <p className="text-sm">Upload and map evidence to run analysis</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-zinc-800">
      {analyses.map((analysis) => {
        const config = ANALYSIS_TYPE_CONFIG[analysis.analysis_type] || {
          label: analysis.analysis_type,
          icon: FileSearch,
          color: 'text-zinc-400',
        };
        const Icon = config.icon;
        const isSelected = selectedId === analysis.id;
        const status = analysis.findings?.overall_assessment?.status || 'grey';
        const confidence = analysis.confidence || 'none';

        return (
          <div
            key={analysis.id}
            className={`
              p-4 hover:bg-zinc-800/50 cursor-pointer transition-colors
              ${isSelected ? 'bg-zinc-800 border-l-2 border-l-green-500' : ''}
            `}
            onClick={() => onSelect(analysis)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 bg-zinc-800 rounded-lg ${config.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-white font-medium">{config.label}</p>
                  <p className="text-zinc-500 text-sm">{formatDate(analysis.created_at)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${STATUS_COLORS[status as keyof typeof STATUS_COLORS] || STATUS_COLORS.grey}`} />
                  <span className="text-zinc-400 text-sm capitalize">{status}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </div>
            </div>
            {analysis.findings?.overall_assessment?.summary && (
              <p className="text-zinc-500 text-sm mt-2 line-clamp-2">
                {analysis.findings.overall_assessment.summary}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
