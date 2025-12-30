'use client';

import { FindingCard } from './FindingCard';
import { Analysis } from '@/types';

interface PipelineAnalysisProps {
  analysis: Analysis;
}

export function PipelineAnalysis({ analysis }: PipelineAnalysisProps) {
  const findings = analysis.findings;

  if (!findings) return null;

  return (
    <div className="space-y-6">
      {/* Overall Assessment */}
      {findings.overall_assessment && (
        <div className={`
          p-4 rounded-lg border
          ${findings.overall_assessment?.status === 'red' ? 'bg-red-500/10 border-red-500/30' :
            findings.overall_assessment?.status === 'amber' ? 'bg-amber-500/10 border-amber-500/30' :
            'bg-green-500/10 border-green-500/30'}
        `}>
          <h3 className="text-white font-medium mb-2">Overall Assessment</h3>
          <p className="text-zinc-300">{findings.overall_assessment?.summary}</p>
          {findings.overall_assessment?.thesis_impact && (
            <p className="text-zinc-400 text-sm mt-2">
              <strong>Thesis Impact:</strong> {findings.overall_assessment.thesis_impact}
            </p>
          )}
        </div>
      )}

      {/* Key Findings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {findings.concentration && (
          <FindingCard
            title="Pipeline Concentration"
            status={findings.concentration?.risk_level}
            finding={findings.concentration?.finding}
            metric={findings.concentration?.top_10_percent ? `Top 10: ${findings.concentration.top_10_percent.toFixed(1)}%` : undefined}
          />
        )}
        {findings.velocity && (
          <FindingCard
            title="Stage Velocity"
            status={findings.velocity?.risk_level}
            finding={findings.velocity?.finding}
            metric={findings.velocity?.stuck_deals?.length > 0 ?
              `${findings.velocity.stuck_deals.length} stuck deals` : 'Healthy'}
          />
        )}
        {findings.forecast_accuracy && (
          <FindingCard
            title="Forecast Accuracy"
            status={findings.forecast_accuracy?.risk_level}
            finding={findings.forecast_accuracy?.finding}
            metric={findings.forecast_accuracy?.pattern}
          />
        )}
        {findings.win_rates && (
          <FindingCard
            title="Win Rates"
            status={findings.win_rates?.outlier_reps?.length > 0 ? 'medium' : 'low'}
            finding={findings.win_rates?.finding}
            metric={findings.win_rates?.overall ? `Overall: ${findings.win_rates.overall.toFixed(1)}%` : undefined}
          />
        )}
      </div>

      {/* Red Flags */}
      {findings.red_flags?.length > 0 && (
        <div className="bg-zinc-800 rounded-lg p-4">
          <h3 className="text-white font-medium mb-3">Red Flags</h3>
          <ul className="space-y-2">
            {findings.red_flags.map((flag: string, i: number) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full mt-2 shrink-0" />
                <span className="text-zinc-300">{flag}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Negotiation Levers */}
      {findings.negotiation_levers?.length > 0 && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
          <h3 className="text-green-400 font-medium mb-3">Negotiation Levers</h3>
          <ul className="space-y-2">
            {findings.negotiation_levers.map((lever: string, i: number) => (
              <li key={i} className="text-zinc-300">{i + 1}. {lever}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Evidence Gaps */}
      {findings.evidence_gaps?.length > 0 && (
        <div className="bg-zinc-800 rounded-lg p-4">
          <h3 className="text-zinc-400 font-medium mb-3">Evidence Gaps</h3>
          <ul className="space-y-1">
            {findings.evidence_gaps.map((gap: string, i: number) => (
              <li key={i} className="text-zinc-400 text-sm flex items-start gap-2">
                <span className="text-zinc-600">-</span>
                <span>{gap}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
