'use client';

import { ConcentrationChart } from './ConcentrationChart';
import { VelocityChart } from './VelocityChart';
import { WinRateChart } from './WinRateChart';
import { StuckDealsTable } from './StuckDealsTable';
import { Analysis } from '@/types';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Target, Clock, Users, DollarSign } from 'lucide-react';

interface PipelineAnalysisProps {
  analysis: Analysis;
}

export function PipelineAnalysis({ analysis }: PipelineAnalysisProps) {
  const findings = analysis.findings;

  if (!findings) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'green':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'amber':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'red':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Overall Assessment - Hero Card */}
      {findings.overall_assessment && (
        <div className={`
          p-6 rounded-xl border-2 transition-all
          ${findings.overall_assessment?.status === 'red'
            ? 'bg-gradient-to-br from-red-500/10 to-red-900/5 border-red-500/40'
            : findings.overall_assessment?.status === 'amber'
            ? 'bg-gradient-to-br from-amber-500/10 to-amber-900/5 border-amber-500/40'
            : 'bg-gradient-to-br from-green-500/10 to-green-900/5 border-green-500/40'}
        `}>
          <div className="flex items-start gap-4">
            <div className={`
              p-3 rounded-xl
              ${findings.overall_assessment?.status === 'red' ? 'bg-red-500/20' :
                findings.overall_assessment?.status === 'amber' ? 'bg-amber-500/20' :
                'bg-green-500/20'}
            `}>
              {getStatusIcon(findings.overall_assessment?.status)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-white font-semibold text-lg">Overall Assessment</h3>
                <span className={`
                  px-2 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide
                  ${findings.overall_assessment?.status === 'red' ? 'bg-red-500/20 text-red-400' :
                    findings.overall_assessment?.status === 'amber' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-green-500/20 text-green-400'}
                `}>
                  {findings.overall_assessment?.status}
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-700 text-zinc-300">
                  {findings.overall_assessment?.confidence} confidence
                </span>
              </div>
              <p className="text-zinc-300 leading-relaxed">{findings.overall_assessment?.summary}</p>
              {findings.overall_assessment?.thesis_impact && (
                <div className="mt-4 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
                  <p className="text-zinc-400 text-sm">
                    <span className="text-white font-medium">Thesis Impact:</span>{' '}
                    {findings.overall_assessment.thesis_impact}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics Grid with Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Concentration */}
        {findings.concentration && (
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5 hover:border-zinc-700 transition-colors">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-blue-400" />
              <h4 className="text-white font-medium">Pipeline Concentration</h4>
              <span className={`
                ml-auto px-2 py-0.5 rounded-full text-xs font-medium
                ${findings.concentration?.risk_level === 'high' ? 'bg-red-500/20 text-red-400' :
                  findings.concentration?.risk_level === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-green-500/20 text-green-400'}
              `}>
                {findings.concentration?.risk_level}
              </span>
            </div>
            <ConcentrationChart topPercent={findings.concentration?.top_10_percent || 0} />
            <p className="text-zinc-400 text-sm mt-3">{findings.concentration?.finding}</p>
          </div>
        )}

        {/* Velocity */}
        {findings.velocity && (
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5 hover:border-zinc-700 transition-colors">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-purple-400" />
              <h4 className="text-white font-medium">Stage Velocity</h4>
              <span className={`
                ml-auto px-2 py-0.5 rounded-full text-xs font-medium
                ${findings.velocity?.risk_level === 'high' ? 'bg-red-500/20 text-red-400' :
                  findings.velocity?.risk_level === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-green-500/20 text-green-400'}
              `}>
                {findings.velocity?.risk_level}
              </span>
            </div>
            {findings.velocity?.avg_days_by_stage && (
              <VelocityChart data={findings.velocity.avg_days_by_stage} />
            )}
            <p className="text-zinc-400 text-sm mt-3">{findings.velocity?.finding}</p>
          </div>
        )}

        {/* Win Rates */}
        {findings.win_rates && (
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5 hover:border-zinc-700 transition-colors">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-cyan-400" />
              <h4 className="text-white font-medium">Win Rates</h4>
            </div>
            <WinRateChart
              overall={findings.win_rates?.overall || 0}
              bySegment={findings.win_rates?.by_segment}
            />
            <p className="text-zinc-400 text-sm mt-3">{findings.win_rates?.finding}</p>
          </div>
        )}

        {/* Stuck Deals */}
        {findings.velocity?.stuck_deals && (
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5 hover:border-zinc-700 transition-colors">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <h4 className="text-white font-medium">Stuck Deals</h4>
            </div>
            <StuckDealsTable deals={findings.velocity.stuck_deals} />
          </div>
        )}
      </div>

      {/* Forecast Accuracy */}
      {findings.forecast_accuracy && (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-green-400" />
            <h4 className="text-white font-medium">Forecast Accuracy</h4>
            <span className={`
              ml-auto px-2 py-0.5 rounded-full text-xs font-medium
              ${findings.forecast_accuracy?.risk_level === 'high' ? 'bg-red-500/20 text-red-400' :
                findings.forecast_accuracy?.risk_level === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                'bg-green-500/20 text-green-400'}
            `}>
              {findings.forecast_accuracy?.risk_level}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-zinc-800/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">
                {findings.forecast_accuracy?.analyzed_periods || 0}
              </div>
              <div className="text-zinc-500 text-sm">Periods Analyzed</div>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-4 text-center">
              <div className={`text-2xl font-bold ${
                (findings.forecast_accuracy?.avg_variance_percent || 0) > 20 ? 'text-red-400' :
                (findings.forecast_accuracy?.avg_variance_percent || 0) > 10 ? 'text-amber-400' :
                'text-green-400'
              }`}>
                {findings.forecast_accuracy?.avg_variance_percent?.toFixed(1) || 0}%
              </div>
              <div className="text-zinc-500 text-sm">Avg Variance</div>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white capitalize">
                {findings.forecast_accuracy?.pattern || 'N/A'}
              </div>
              <div className="text-zinc-500 text-sm">Pattern</div>
            </div>
          </div>
          <p className="text-zinc-400 text-sm">{findings.forecast_accuracy?.finding}</p>
        </div>
      )}

      {/* Red Flags */}
      {findings.red_flags?.length > 0 && (
        <div className="bg-gradient-to-br from-red-500/5 to-transparent rounded-xl border border-red-500/20 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <h3 className="text-white font-semibold">Red Flags</h3>
            <span className="ml-auto bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full text-xs font-medium">
              {findings.red_flags.length} issue{findings.red_flags.length > 1 ? 's' : ''}
            </span>
          </div>
          <ul className="space-y-3">
            {findings.red_flags.map((flag: string, i: number) => (
              <li key={i} className="flex items-start gap-3 p-3 bg-zinc-900/50 rounded-lg">
                <span className="w-2 h-2 bg-red-500 rounded-full mt-2 shrink-0 animate-pulse" />
                <span className="text-zinc-300">{flag}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Negotiation Levers */}
      {findings.negotiation_levers?.length > 0 && (
        <div className="bg-gradient-to-br from-green-500/5 to-transparent rounded-xl border border-green-500/20 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <h3 className="text-white font-semibold">Negotiation Levers</h3>
          </div>
          <ul className="space-y-3">
            {findings.negotiation_levers.map((lever: string, i: number) => (
              <li key={i} className="flex items-start gap-3 p-3 bg-zinc-900/50 rounded-lg border border-green-500/10">
                <span className="flex items-center justify-center w-6 h-6 bg-green-500/20 text-green-400 rounded-full text-sm font-medium shrink-0">
                  {i + 1}
                </span>
                <span className="text-zinc-300">{lever}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Evidence Gaps */}
      {findings.evidence_gaps?.length > 0 && (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-zinc-800 rounded-lg">
              <TrendingDown className="w-5 h-5 text-zinc-400" />
            </div>
            <h3 className="text-zinc-400 font-medium">Evidence Gaps</h3>
          </div>
          <ul className="space-y-2">
            {findings.evidence_gaps.map((gap: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-zinc-500 text-sm">
                <span className="text-zinc-600 mt-0.5">○</span>
                <span>{gap}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
