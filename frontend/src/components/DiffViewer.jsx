// src/components/DiffViewer.jsx
import React, { useState } from 'react';
import ReactDiffViewer from 'react-diff-viewer-continued';
import axios from 'axios';

const DiffViewer = () => {
  const [originalCode, setOriginalCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [diff, setDiff] = useState('');

  const handlePreviewDocstrings = async () => {
    try {
      const formData = new FormData();
      const blob = new Blob([originalCode], { type: 'text/plain' });
      formData.append('file', blob, 'code.py');
      formData.append('language', language);

      const res = await axios.post(
        'http://localhost:8000/docstring/docstring/preview',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setDiff(res.data.diff);
    } catch (err) {
      console.error('Error previewing docstrings:', err);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen space-y-4">
      <textarea
        rows="10"
        value={originalCode}
        onChange={(e) => setOriginalCode(e.target.value)}
        className="w-full border bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 placeholder-gray-400 dark:placeholder-gray-500 rounded px-4 py-2"
        placeholder="Paste your original code here..."
      />

      <div className="flex gap-4 items-center">
        <label className="text-sm">Language:</label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="p-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="python">Python</option>
          <option value="javascript">JavaScript</option>
          <option value="java">Java</option>
        </select>

        <button
          onClick={handlePreviewDocstrings}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Preview Docstrings
        </button>
      </div>

      {diff && (
        <ReactDiffViewer
          oldValue={originalCode}
          newValue={diff}
          splitView={true}
        />
      )}
    </div>
  );
};

export default DiffViewer;
