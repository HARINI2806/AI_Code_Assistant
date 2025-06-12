// src/pages/PDFGeneratorPage.jsx
import React from 'react';
import PDFViewer from '../components/PDFViewer';

const PDFGeneratorPage = () => {
  const pdfViewUrl = 'http://localhost:8000/pdf';
  const pdfDownloadUrl = 'http://localhost:8000/pdf/download';

  return (
     <div className="p-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Generated Summary PDF</h2>
      <PDFViewer fileUrl={pdfViewUrl} downloadUrl={pdfDownloadUrl} />
    </div>
    </div>
  );
};

export default PDFGeneratorPage;