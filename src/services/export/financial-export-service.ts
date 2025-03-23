// src/services/export/financial-export-service.ts
import { ExportOptions, ExportResult } from '../../types/exportTypes';
import {
  CostOptimizationInsight,
  FinancialSummary,
  PlatformPerformance,
  ProductTypeMetric,
  ProjectFinancials,
  RevenueTrend,
} from '../../types/financialTypes';
import { apiClient } from '../api-client';

export class FinancialExportService {
  /**
   * Export financial data according to provided options
   */
  static async exportFinancialData(
    options: ExportOptions,
    data?: {
      summary?: FinancialSummary;
      revenueTrends?: RevenueTrend[];
      productMetrics?: ProductTypeMetric[];
      projectFinancials?: ProjectFinancials[];
      platformPerformance?: PlatformPerformance[];
      costInsights?: CostOptimizationInsight[];
    }
  ): Promise<ExportResult> {
    try {
      // Prepare the request payload
      const payload = {
        format: options.format,
        timeframe: options.timeframe,
        includeSections: options.includeSections,
        data,
      };

      // Make the API request
      const response = await apiClient.post<ExportResult>(
        '/financial/export',
        payload
      );

      // If the API returns a URL for download (adding this as an extension to ExportResult)
      const resultWithUrl = response.data as ExportResult & {
        fileUrl?: string;
      };
      if (resultWithUrl.fileUrl) {
        // Trigger download if needed
        this.triggerDownload(
          resultWithUrl.fileUrl,
          resultWithUrl.filename || `financial_export.${options.format}`
        );
      }

      return response.data;
    } catch (error) {
      console.error('Export failed:', error);
      return {
        success: false,
        filename: '',
        message:
          error instanceof Error
            ? error.message
            : 'Failed to generate export file',
      };
    }
  }

  /**
   * Trigger a file download from a URL
   */
  private static triggerDownload(url: string, filename: string): void {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
