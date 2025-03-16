// src/components/documentation/printable/PrintableTemplate.tsx

import React from 'react';
import ContentRenderer from '../ContentRenderer';

interface PrintableTemplateProps {
  title: string;
  description: string;
  content: string;
  date: string;
  author?: string;
  category?: string;
}

// Extract print styles to a constant to avoid jsx and global attributes
const printStyles = `
  @media print {
    /* Print-specific styles */
    @page {
      size: letter;
      margin: 0.5in;
    }

    body {
      font-size: 12pt;
    }

    .print-template {
      padding: 0;
    }

    /* Hide UI elements when printing */
    header,
    nav,
    footer,
    .sidebar,
    .no-print {
      display: none !important;
    }

    /* Ensure content breaks nicely across pages */
    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      page-break-after: avoid;
      break-after: avoid;
    }

    p,
    li {
      page-break-inside: avoid;
      break-inside: avoid;
    }

    table {
      page-break-inside: auto;
      break-inside: auto;
    }

    tr {
      page-break-inside: avoid;
      break-inside: avoid;
    }

    /* Handle images better for printing */
    img {
      max-width: 100% !important;
      max-height: 3in !important;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    /* Enhance code block visibility */
    pre,
    code {
      white-space: pre-wrap !important;
      word-wrap: break-word !important;
      border: 1px solid #ddd;
      background-color: #f8f8f8 !important;
      color: #333 !important;
    }

    /* Make links more useful in print */
    a::after {
      content: ' (' attr(href) ')';
      font-size: 90%;
      color: #555;
    }

    /* Print QR codes at a good size */
    .qr-code {
      width: 1.5in !important;
      height: 1.5in !important;
    }
  }
`;

const PrintableTemplate: React.FC<PrintableTemplateProps> = ({
  title,
  description,
  content,
  date,
  author,
  category,
}) => {
  return (
    <div className='print-template p-8 max-w-4xl mx-auto'>
      {/* Header */}
      <div className='mb-8 border-b pb-4'>
        <div className='flex justify-between items-center'>
          <h1 className='text-2xl font-bold'>{title}</h1>
          <div className='text-right'>
            <img
              src='/logo.svg'
              alt='HideSync Logo'
              className='h-10 w-auto print-logo'
            />
            <p className='text-sm text-gray-500'>Printed on: {date}</p>
          </div>
        </div>

        <p className='mt-2 text-gray-600'>{description}</p>

        {(author || category) && (
          <div className='flex mt-2 text-sm text-gray-500'>
            {author && <span className='mr-4'>Author: {author}</span>}
            {category && <span>Category: {category}</span>}
          </div>
        )}
      </div>

      {/* Content with print-optimized styles */}
      <div className='print-content'>
        <ContentRenderer content={content} className='print-optimized' />
      </div>

      {/* Footer */}
      <div className='mt-8 pt-4 border-t text-sm text-gray-500 flex justify-between'>
        <span>HideSync Documentation</span>
        <span>
          Page {'{PAGE_NUM}'} of {'{PAGE_COUNT}'}
        </span>
      </div>

      {/* Regular style tag without jsx or global attributes */}
      <style>{printStyles}</style>
    </div>
  );
};

export default PrintableTemplate;
