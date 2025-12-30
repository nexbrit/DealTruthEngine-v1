'use client';

import { useState, useEffect } from 'react';
import { Loader2, Check, AlertCircle, ArrowRight } from 'lucide-react';
import { evidenceAPI, analysisAPI } from '@/lib/api';
import { ColumnMapping, Evidence } from '@/types';
import { Button } from '@/components/ui/button';

interface ColumnMapperProps {
  evidence: Evidence;
  onMappingConfirmed: () => void;
  onAnalysisComplete?: () => void;
}

export function ColumnMapper({ evidence, onMappingConfirmed, onAnalysisComplete }: ColumnMapperProps) {
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [mapping, setMapping] = useState<ColumnMapping | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (evidence.status === 'uploaded') {
      fetchMapping();
    }
  }, [evidence.id, evidence.status]);

  async function fetchMapping() {
    setLoading(true);
    setError(null);
    try {
      const result = await evidenceAPI.mapColumns(evidence.id);
      setMapping(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleConfirm = async () => {
    if (!mapping) return;

    try {
      await evidenceAPI.confirmMapping(evidence.id, mapping.mappings);
      onMappingConfirmed();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAnalyze = async () => {
    if (!mapping) return;

    setAnalyzing(true);
    setError(null);

    try {
      // Determine which analysis to run based on evidence type
      const evidenceType = mapping.suggested_evidence_type;

      if (evidenceType === 'crm_pipeline') {
        await analysisAPI.runPipeline(evidence.id);
      } else if (evidenceType === 'utilisation') {
        await analysisAPI.runUtilisation(evidence.id);
      } else if (evidenceType === 'ar_ageing') {
        await analysisAPI.runArAgeing(evidence.id);
      } else {
        // Default to pipeline
        await analysisAPI.runPipeline(evidence.id);
      }

      onAnalysisComplete?.();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 text-green-500 animate-spin mr-2" />
        <span className="text-zinc-400">Analyzing columns with AI...</span>
      </div>
    );
  }

  if (error && !mapping) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
        <div className="flex items-center gap-2 text-red-400">
          <AlertCircle className="w-4 h-4" />
          <p>{error}</p>
        </div>
        <Button onClick={fetchMapping} variant="outline" className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  if (!mapping) {
    return (
      <div className="p-4">
        <Button onClick={fetchMapping}>
          Map Columns
        </Button>
      </div>
    );
  }

  // If already mapped, show run analysis button
  if (evidence.status === 'mapped') {
    return (
      <div className="bg-zinc-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-white">Ready to Analyze</h3>
          <span className="px-2 py-1 rounded text-xs font-medium bg-green-500/20 text-green-400">
            Mapped
          </span>
        </div>

        <p className="text-zinc-400 text-sm mb-4">
          Evidence type: <span className="text-white">{mapping.suggested_evidence_type}</span>
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <Button
          onClick={handleAnalyze}
          disabled={analyzing}
          className="w-full"
        >
          {analyzing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Running Analysis...
            </>
          ) : (
            <>
              <ArrowRight className="w-4 h-4 mr-2" />
              Run Analysis
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-zinc-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-white">Column Mapping</h3>
        <span className={`
          px-2 py-1 rounded text-xs font-medium
          ${mapping.confidence === 'high' ? 'bg-green-500/20 text-green-400' :
            mapping.confidence === 'medium' ? 'bg-amber-500/20 text-amber-400' :
            'bg-red-500/20 text-red-400'}
        `}>
          {mapping.confidence} confidence
        </span>
      </div>

      <p className="text-zinc-400 text-sm mb-4">
        Detected source: <span className="text-white">{mapping.detected_source_system}</span>
        {' - '}
        Type: <span className="text-white">{mapping.suggested_evidence_type}</span>
      </p>

      {mapping.warnings?.length > 0 && (
        <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
            <div>
              {mapping.warnings.map((w: string, i: number) => (
                <p key={i} className="text-amber-400 text-sm">{w}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2 mb-6 max-h-64 overflow-y-auto">
        <div className="grid grid-cols-2 gap-2 text-sm text-zinc-400 font-medium px-3 sticky top-0 bg-zinc-800 py-2">
          <span>Standard Field</span>
          <span>Your Column</span>
        </div>
        {Object.entries(mapping.mappings).map(([standard, original]) => (
          <div key={standard} className="grid grid-cols-2 gap-2 bg-zinc-700/50 rounded p-3">
            <span className="text-white text-sm">{standard}</span>
            <span className="text-zinc-300 text-sm">{(original as string) || '—'}</span>
          </div>
        ))}
      </div>

      {mapping.unmapped_columns?.length > 0 && (
        <div className="mb-6">
          <p className="text-zinc-400 text-sm mb-2">Unmapped columns (will be ignored):</p>
          <div className="flex flex-wrap gap-1">
            {mapping.unmapped_columns.map((col: string) => (
              <span key={col} className="text-xs bg-zinc-700 text-zinc-400 px-2 py-1 rounded">
                {col}
              </span>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <Button
        onClick={handleConfirm}
        className="w-full"
      >
        <Check className="w-4 h-4 mr-2" />
        Confirm Mapping
      </Button>
    </div>
  );
}
