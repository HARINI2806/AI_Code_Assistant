// src/components/DiffViewer.jsx
import React, { useState } from 'react';
import axios from 'axios';
import ReactDiffViewer from 'react-diff-viewer-continued';

const DiffViewer = () => {
  const [original, setOriginal] = useState('');
  const [modified, setModified] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [language, setLanguage] = useState('python');
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!selectedFile || !language) return;
    setLoading(true);

    const form = new FormData();
    form.append('file', selectedFile);
    form.append('language', language);

    try {
      const res = await axios.post('http://localhost:8000/docstring/docstring/generate', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setOriginal(res.data.original);
      setModified(res.data.modified);
    } catch (err) {
      alert('Failed to generate docstrings: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Docstring Generator & Preview</h2>

      <div className="flex flex-wrap gap-4 mb-4 items-center">
        <input
          type="file"
          accept=".py,.js,.java"
          onChange={(e) => setSelectedFile(e.target.files[0])}
          className="p-2 bg-white dark:bg-gray-800 text-black dark:text-white border rounded"
        />

        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border rounded"
        >
          <option value="python">Python</option>
          <option value="javascript">JavaScript</option>
          <option value="java">Java</option>
        </select>

        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={handleUpload}
          disabled={!selectedFile || loading}
        >
          {loading ? 'Generating...' : 'Generate Docstrings'}
        </button>
      </div>

      {original && modified && (
        <div className="mt-6">
          <ReactDiffViewer
            oldValue={original}
            newValue={modified}
            splitView={true}
            showDiffOnly={false}
            hideLineNumbers={false}
            leftTitle="Original"
            rightTitle="With Docstrings"
          />
        </div>
      )}
    </div>
  );
};

export default DiffViewer;
