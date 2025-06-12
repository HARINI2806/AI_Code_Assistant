// src/components/DiffViewer.js
import React, { useState } from 'react';
import ReactDiffViewer from 'react-diff-viewer-continued';
import axios from 'axios';

const DiffViewer = () => {
  const [originalCode, setOriginalCode] = useState('');
  const [updatedCode, setUpdatedCode] = useState('');

  const handleGenerateDocstrings = async () => {
    try {
      const res = await axios.post('/api/docstring', { code: originalCode });
      setUpdatedCode(res.data.updated_code);
    } catch (err) {
      console.error('Error generating docstrings:', err);
    }
  };

  return (
     <div className="p-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
    <div className="space-y-4">
      <textarea
        rows="10"
        value={originalCode}
        onChange={(e) => setOriginalCode(e.target.value)}
        className="w-full border bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 placeholder-gray-400 dark:placeholder-gray-500 rounded px-4 py-2"
        placeholder="Paste your original code here..."
      />
      <button
        onClick={handleGenerateDocstrings}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Generate Docstrings
      </button>
      {updatedCode && (
        <ReactDiffViewer
          oldValue={originalCode}
          newValue={updatedCode}
          splitView={true}
        />
      )}
    </div>
    </div>
  );
};

export default DiffViewer;
