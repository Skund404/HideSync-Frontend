// src/services/export/financialExportService.ts
import * as Papa from 'papaparse';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as XLSX from 'xlsx';
import {
  ExportOptions,
  ExportResult,
  ExportSection,
} from '../../types/exportTypes';
import {
  CostOptimizationInsight,
  FinancialSummary,
  PlatformPerformance,
  ProductTypeMetric,
  ProjectFinancials,
  RevenueTrend,
} from '../../types/financialTypes';

export class FinancialExportService {
  // Utility method to convert data to CSV
  private static convertToCSV(sections: ExportSection[]): string {
    return sections
      .map((section) =>
        Papa.unparse({
          fields: section.headers,
          data: section.data.map((item) =>
            section.headers.map(
              (header) => item[header.toLowerCase().replace(/\s+/g, '_')] || ''
            )
          ),
        })
      )
      .join('\n\n');
  }

  // Utility method to convert data to Excel workbook
  private static convertToExcel(sections: ExportSection[]): XLSX.WorkBook {
    const workbook = XLSX.utils.book_new();

    sections.forEach((section) => {
      const worksheet = XLSX.utils.json_to_sheet(section.data);
      XLSX.utils.book_append_sheet(workbook, worksheet, section.name);
    });

    return workbook;
  }

  // Utility method to generate PDF
  private static async generatePDF(
    sections: ExportSection[]
  ): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const page = pdfDoc.addPage();
    const { height } = page.getSize();
    const fontSize = 10;

    let yPosition = height - 50;

    // PDF Header
    page.drawText('HideSync Financial Report', {
      x: 50,
      y: height - 30,
      size: 16,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });

    // Render each section
    sections.forEach((section) => {
      // Section Title
      page.drawText(section.name, {
        x: 50,
        y: yPosition,
        size: 12,
        font: helveticaFont,
        color: rgb(0.2, 0.2, 0.2),
      });
      yPosition -= 20;

      // Headers
      section.headers.forEach((header, index) => {
        page.drawText(header, {
          x: 50 + index * 100,
          y: yPosition,
          size: fontSize,
          font: helveticaFont,
          color: rgb(0.4, 0.4, 0.4),
        });
      });
      yPosition -= 15;

      // Data rows
      section.data.forEach((item) => {
        section.headers.forEach((header, index) => {
          page.drawText(
            String(item[header.toLowerCase().replace(/\s+/g, '_')] || ''),
            {
              x: 50 + index * 100,
              y: yPosition,
              size: fontSize,
              font: helveticaFont,
              color: rgb(0, 0, 0),
            }
          );
        });
        yPosition -= 12;

        // Reset page if needed
        if (yPosition < 50) {
          page.moveTo(50, height - 50);
          yPosition = height - 50;
        }
      });

      yPosition -= 20;
    });

    return await pdfDoc.save();
  }

  // Main export method
  static async exportFinancialData(
    options: ExportOptions,
    data: {
      summary?: FinancialSummary;
      revenueTrends?: RevenueTrend[];
      productMetrics?: ProductTypeMetric[];
      projectFinancials?: ProjectFinancials[];
      platformPerformance?: PlatformPerformance[];
      costInsights?: CostOptimizationInsight[];
    }
  ): Promise<ExportResult> {
    const sections: ExportSection[] = [];

    // Prepare sections based on selected options
    if (options.includeSections.revenueData && data.revenueTrends) {
      sections.push({
        name: 'Revenue Trends',
        headers: ['Month', 'Revenue', 'Costs', 'Profit', 'Margin'],
        data: data.revenueTrends.map((trend) => ({
          month: trend.month,
          revenue: trend.revenue,
          costs: trend.costs,
          profit: trend.profit,
          margin: trend.margin,
        })),
      });
    }

    if (options.includeSections.productMetrics && data.productMetrics) {
      sections.push({
        name: 'Product Metrics',
        headers: ['Product', 'Sales', 'Quantity', 'Margin'],
        data: data.productMetrics.map((product) => ({
          product: product.name,
          sales: product.sales,
          quantity: product.quantity,
          margin: product.margin,
        })),
      });
    }

    if (options.includeSections.projectFinancials && data.projectFinancials) {
      sections.push({
        name: 'Project Financials',
        headers: [
          'Project',
          'Customer',
          'Revenue',
          'Costs',
          'Profit',
          'Margin',
        ],
        data: data.projectFinancials.map((project) => ({
          project: project.name,
          customer: project.customer,
          revenue: project.revenue,
          costs: project.costs,
          profit: project.profit,
          margin: project.margin,
        })),
      });
    }

    if (options.includeSections.platformData && data.platformPerformance) {
      sections.push({
        name: 'Platform Performance',
        headers: ['Platform', 'Sales', 'Orders', 'Profit', 'Margin'],
        data: data.platformPerformance.map((platform) => ({
          platform: platform.platform,
          sales: platform.sales,
          orders: platform.orders,
          profit: platform.profit,
          margin: platform.margin,
        })),
      });
    }

    if (options.includeSections.costInsights && data.costInsights) {
      sections.push({
        name: 'Cost Insights',
        headers: ['Material', 'Issue', 'Impact', 'Suggestion', 'Savings'],
        data: data.costInsights.map((insight) => ({
          material: insight.material,
          issue: insight.issue,
          impact: insight.impact,
          suggestion: insight.suggestion,
          savings: insight.savings,
        })),
      });
    }

    // Check if any sections are selected
    if (sections.length === 0) {
      return {
        success: false,
        filename: '',
        message: 'No data sections selected for export',
      };
    }

    // Generate the file based on selected format
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const baseFilename = `HideSync_Financial_Report_${timestamp}`;

    try {
      let fileContent: string | Uint8Array;
      let mimeType: string;
      let extension: string;

      switch (options.format) {
        case 'csv':
          fileContent = this.convertToCSV(sections);
          mimeType = 'text/csv';
          extension = 'csv';
          break;
        case 'excel':
          const workbook = this.convertToExcel(sections);
          fileContent = XLSX.write(workbook, {
            type: 'buffer',
            bookType: 'xlsx',
          });
          mimeType =
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          extension = 'xlsx';
          break;
        case 'pdf':
          fileContent = await this.generatePDF(sections);
          mimeType = 'application/pdf';
          extension = 'pdf';
          break;
      }

      // Trigger download
      const blob = new Blob([fileContent], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${baseFilename}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      return {
        success: true,
        filename: `${baseFilename}.${extension}`,
        message: 'Export successful',
      };
    } catch (error) {
      console.error('Export failed', error);
      return {
        success: false,
        filename: '',
        message: 'Failed to generate export file',
      };
    }
  }
}
