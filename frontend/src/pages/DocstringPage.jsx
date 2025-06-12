import React from 'react';
import DiffViewer from '../components/DiffViewer';

const DocstringPage = () => {
  return (
    <div className="p-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
    <div className="p-6">
      <h2 className="text-2xl font-semibold">Generate and Preview Docstrings</h2>
      <DiffViewer />
    </div>
    </div>
  );
};

export default DocstringPage;