'use client';

import { FileSpreadsheet, Check, AlertCircle, Loader2, MoreVertical, Trash2 } from 'lucide-react';
import { Evidence } from '@/types';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface EvidenceTableProps {
  evidence: Evidence[];
  onSelect: (evidence: Evidence) => void;
  selectedId?: string;
  onDelete?: (evidence: Evidence) => void;
}

const STATUS_CONFIG = {
  uploaded: { label: 'Uploaded', color: 'bg-blue-500' },
  processing: { label: 'Processing', color: 'bg-amber-500' },
  mapped: { label: 'Mapped', color: 'bg-purple-500' },
  analyzed: { label: 'Analyzed', color: 'bg-green-500' },
  error: { label: 'Error', color: 'bg-red-500' },
};

const EVIDENCE_TYPE_LABELS: Record<string, string> = {
  crm_pipeline: 'CRM Pipeline',
  utilisation: 'Utilisation',
  ar_ageing: 'AR Ageing',
};

export function EvidenceTable({ evidence, onSelect, selectedId, onDelete }: EvidenceTableProps) {
  if (evidence.length === 0) {
    return (
      <div className="text-center py-8 text-zinc-500">
        No evidence files uploaded yet
      </div>
    );
  }

  return (
    <div className="divide-y divide-zinc-800">
      {evidence.map((item) => {
        const statusConfig = STATUS_CONFIG[item.status] || STATUS_CONFIG.uploaded;
        const isSelected = selectedId === item.id;

        return (
          <div
            key={item.id}
            className={`
              p-4 hover:bg-zinc-800/50 cursor-pointer transition-colors
              ${isSelected ? 'bg-zinc-800 border-l-2 border-l-green-500' : ''}
            `}
            onClick={() => onSelect(item)}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-zinc-800 rounded-lg">
                  <FileSpreadsheet className="w-5 h-5 text-zinc-400" />
                </div>
                <div>
                  <p className="text-white font-medium">{item.original_file_name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-zinc-500 text-sm">
                      {formatDate(item.uploaded_at)}
                    </span>
                    {item.row_count && (
                      <span className="text-zinc-500 text-sm">
                        {item.row_count} rows
                      </span>
                    )}
                    {item.evidence_type && (
                      <Badge variant="secondary" className="text-xs">
                        {EVIDENCE_TYPE_LABELS[item.evidence_type] || item.evidence_type}
                      </Badge>
                    )}
                  </div>
                  {item.source_system && (
                    <p className="text-zinc-500 text-xs mt-1">
                      Source: {item.source_system}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${statusConfig.color}`} />
                  <span className="text-zinc-400 text-sm">{statusConfig.label}</span>
                </div>
                {onDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(item);
                    }}
                    className="p-1 hover:bg-zinc-700 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-zinc-500 hover:text-red-400" />
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
