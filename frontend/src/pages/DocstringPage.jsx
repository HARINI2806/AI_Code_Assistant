import React from 'react';
import DiffViewer from '../components/DiffViewer';

const DocstringPage = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold">Generate and Preview Docstrings</h2>
      <DiffViewer />
    </div>
  );
};

export default DocstringPage;