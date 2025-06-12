// src/pages/SummaryPage.js
import React from 'react';
import SummaryViewer from '../components/SummaryViewer'

const SummaryPage = () => {
  return (
     <div className="p-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
    <div className="p-6">
      <h2 className="text-2xl font-semibold">Codebase Summary</h2>
      <SummaryViewer />
    </div>
    </div>
  );
};

export default SummaryPage;
