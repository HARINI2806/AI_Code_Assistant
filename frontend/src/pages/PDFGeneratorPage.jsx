import React from 'react';
import PDFViewer from '../components/PDFViewer';

const PDFGeneratorPage = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold">Generate Summary PDF</h2>
      <PDFViewer />
    </div>
  );
};

export default PDFGeneratorPage;