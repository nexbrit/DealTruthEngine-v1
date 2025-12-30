export interface Deal {
  id: string;
  name: string;
  target_company: string;
  target_revenue: number | null;
  currency: string;
  stage: 'in_sight' | 'diligence' | 'stabilise';
  thesis_summary: string | null;
  created_at: string;
  updated_at: string;
}

export interface StressLine {
  id: string;
  name: string;
  status: 'green' | 'amber' | 'red' | 'grey';
  confidence: 'high' | 'medium' | 'low' | 'none';
  summary: string | null;
  flags: string[];
}

export interface Evidence {
  id: string;
  deal_id: string;
  file_name: string;
  original_file_name: string;
  file_type: string;
  file_size: number | null;
  evidence_type: string | null;
  source_system: string | null;
  period_start: string | null;
  period_end: string | null;
  version: number;
  status: 'uploaded' | 'processing' | 'mapped' | 'analyzed' | 'error';
  column_mapping: Record<string, string | null> | null;
  row_count: number | null;
  notes: string | null;
  uploaded_at: string;
}

export interface DealWithDetails extends Deal {
  stress_lines: StressLine[];
  evidence: Evidence[];
}

export interface ColumnMapping {
  detected_source_system: string;
  confidence: 'high' | 'medium' | 'low';
  mappings: Record<string, string | null>;
  unmapped_columns: string[];
  warnings: string[];
  suggested_evidence_type: string;
}

export interface Analysis {
  id: string;
  deal_id: string;
  evidence_id: string | null;
  stress_line_name: string | null;
  analysis_type: string;
  findings: Record<string, any>;
  recommendations: string[];
  confidence: string | null;
  created_at: string;
}

export interface Memo {
  deal_id: string;
  content: string;
  generated_at: string;
}

export type StressLineName =
  | 'revenue_quality'
  | 'margin_utilisation'
  | 'working_capital'
  | 'execution_capacity'
  | 'customer_concentration';

export const STRESS_LINE_LABELS: Record<StressLineName, string> = {
  revenue_quality: 'Revenue Quality',
  margin_utilisation: 'Margin & Utilisation',
  working_capital: 'Working Capital',
  execution_capacity: 'Execution Capacity',
  customer_concentration: 'Customer Concentration',
};
