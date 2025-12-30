'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { dealsAPI, evidenceAPI, analysisAPI } from '@/lib/api';
import { DealWithDetails, Evidence, Analysis } from '@/types';
import { StressMap } from '@/components/stress-map/StressMap';
import { UploadZone } from '@/components/evidence/UploadZone';
import { EvidenceTable } from '@/components/evidence/EvidenceTable';
import { ColumnMapper } from '@/components/evidence/ColumnMapper';
import { AnalysisList } from '@/components/analysis/AnalysisList';
import { PipelineAnalysis } from '@/components/analysis/PipelineAnalysis';
import { MemoViewer } from '@/components/memo/MemoViewer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import {
  Loader2,
  Building2,
  Upload,
  BarChart3,
  FileText,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const STAGE_CONFIG = {
  in_sight: { label: 'In Sight', variant: 'secondary' as const },
  diligence: { label: 'Diligence', variant: 'amber' as const },
  stabilise: { label: 'Stabilise', variant: 'green' as const },
};

export default function DealDetailPage() {
  const params = useParams();
  const dealId = params.dealId as string;

  const [deal, setDeal] = useState<DealWithDetails | null>(null);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | null>(null);

  const loadDeal = useCallback(async () => {
    try {
      const [dealData, evidenceData, analysesData] = await Promise.all([
        dealsAPI.get(dealId),
        evidenceAPI.list(dealId),
        analysisAPI.list(dealId),
      ]);
      setDeal(dealData);
      setEvidence(evidenceData);
      setAnalyses(analysesData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [dealId]);

  useEffect(() => {
    loadDeal();
  }, [loadDeal]);

  const handleEvidenceUpload = async (newEvidence: Evidence) => {
    setEvidence((prev) => [newEvidence, ...prev]);
    setSelectedEvidence(newEvidence);
  };

  const handleMappingConfirmed = async () => {
    await loadDeal();
    if (selectedEvidence) {
      const updated = await evidenceAPI.get(selectedEvidence.id);
      setSelectedEvidence(updated);
    }
  };

  const handleAnalysisComplete = async () => {
    await loadDeal();
    setSelectedEvidence(null);
  };

  const handleDeleteEvidence = async (item: Evidence) => {
    if (!confirm('Are you sure you want to delete this evidence?')) return;
    await evidenceAPI.delete(item.id);
    setEvidence((prev) => prev.filter((e) => e.id !== item.id));
    if (selectedEvidence?.id === item.id) {
      setSelectedEvidence(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-zinc-400 animate-spin" />
      </div>
    );
  }

  if (error || !deal) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-red-400">{error || 'Deal not found'}</p>
          <Button onClick={loadDeal} variant="outline" className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const stageConfig = STAGE_CONFIG[deal.stage] || STAGE_CONFIG.in_sight;

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-zinc-800 rounded-xl">
            <Building2 className="w-8 h-8 text-zinc-400" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{deal.name}</h1>
              <Badge variant={stageConfig.variant}>{stageConfig.label}</Badge>
            </div>
            <p className="text-zinc-400">{deal.target_company}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-zinc-500">
              {deal.target_revenue && (
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  {formatCurrency(Number(deal.target_revenue), deal.currency)}
                </span>
              )}
              <span>{evidence.length} evidence files</span>
              <span>{analyses.length} analyses</span>
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={loadDeal}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Thesis */}
      {deal.thesis_summary && (
        <div className="mb-6 p-4 bg-zinc-900 rounded-lg border border-zinc-800">
          <h3 className="text-sm font-medium text-zinc-400 mb-1">Investment Thesis</h3>
          <p className="text-zinc-300">{deal.thesis_summary}</p>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Stress Map */}
        <div className="lg:col-span-1">
          <StressMap stressLines={deal.stress_lines} />
        </div>

        {/* Right Column - Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="evidence" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="evidence" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Evidence
              </TabsTrigger>
              <TabsTrigger value="analysis" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Analysis
              </TabsTrigger>
              <TabsTrigger value="memo" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Memo
              </TabsTrigger>
            </TabsList>

            {/* Evidence Tab */}
            <TabsContent value="evidence" className="mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Left: Evidence list and upload */}
                <div className="space-y-4">
                  <UploadZone dealId={dealId} onUploadComplete={handleEvidenceUpload} />

                  <div className="bg-zinc-900 rounded-lg border border-zinc-800">
                    <div className="p-4 border-b border-zinc-800">
                      <h3 className="text-white font-medium">Evidence Register</h3>
                    </div>
                    <EvidenceTable
                      evidence={evidence}
                      onSelect={setSelectedEvidence}
                      selectedId={selectedEvidence?.id}
                      onDelete={handleDeleteEvidence}
                    />
                  </div>
                </div>

                {/* Right: Column mapper */}
                <div>
                  {selectedEvidence ? (
                    <ColumnMapper
                      evidence={selectedEvidence}
                      onMappingConfirmed={handleMappingConfirmed}
                      onAnalysisComplete={handleAnalysisComplete}
                    />
                  ) : (
                    <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-8 text-center">
                      <Upload className="w-12 h-12 mx-auto mb-3 text-zinc-700" />
                      <p className="text-zinc-500">
                        Select an evidence file to map columns and run analysis
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Analysis Tab */}
            <TabsContent value="analysis" className="mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Left: Analysis list */}
                <div className="bg-zinc-900 rounded-lg border border-zinc-800">
                  <div className="p-4 border-b border-zinc-800">
                    <h3 className="text-white font-medium">Completed Analyses</h3>
                  </div>
                  <AnalysisList
                    analyses={analyses}
                    onSelect={setSelectedAnalysis}
                    selectedId={selectedAnalysis?.id}
                  />
                </div>

                {/* Right: Analysis detail */}
                <div>
                  {selectedAnalysis ? (
                    <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-4">
                      <PipelineAnalysis analysis={selectedAnalysis} />
                    </div>
                  ) : (
                    <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-8 text-center">
                      <BarChart3 className="w-12 h-12 mx-auto mb-3 text-zinc-700" />
                      <p className="text-zinc-500">
                        Select an analysis to view findings
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Memo Tab */}
            <TabsContent value="memo" className="mt-4">
              <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-6">
                <MemoViewer dealId={dealId} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
