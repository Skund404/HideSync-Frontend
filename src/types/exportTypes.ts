// src/types/exportTypes.ts
export type ExportFormat = 'csv' | 'excel' | 'pdf';

export interface ExportOptions {
  format: ExportFormat;
  timeframe: string;
  includeSections: {
    revenueData: boolean;
    materialCosts: boolean;
    productMetrics: boolean;
    projectFinancials: boolean;
    platformData: boolean;
    costInsights: boolean;
    pricingReferences: boolean;
  };
}

export interface ExportSection {
  name: string;
  data: any[];
  headers: string[];
}

export interface ExportResult {
  filename: string;
  success: boolean;
  message?: string;
}
