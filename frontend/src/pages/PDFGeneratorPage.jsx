// src/pages/PDFGeneratorPage.jsx
import React from 'react';
import PDFViewer from '../components/PDFViewer';

const PDFGeneratorPage = () => {
  return (
    <div className="p-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
      <h2 className="text-2xl font-semibold mb-4">Generate and View Codebase Summary PDF</h2>
      <PDFViewer />
    </div>
  );
};

export default PDFGeneratorPage;
