// src/components/DiffViewer.js
import React, { useState } from 'react';
import ReactDiffViewer from 'react-diff-viewer';
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
    <div className="space-y-4">
      <textarea
        rows="10"
        value={originalCode}
        onChange={(e) => setOriginalCode(e.target.value)}
        className="w-full border p-2 rounded"
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
  );
};

export default DiffViewer;
