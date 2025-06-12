import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Editor from '@monaco-editor/react';

const SummaryViewer = () => {
  const [codebases, setCodebases] = useState([]);
  const [selectedPath, setSelectedPath] = useState('');
  const [mode, setMode] = useState('code'); // 'code', 'upload', 'dropdown'

  const [newCode, setNewCode] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [impactSummary, setImpactSummary] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:8000/execute/runnable-files').then(res => {
      setCodebases(res.data.runnable_files);
      setSelectedPath(res.data.codebases[0] || '');
    });
  }, []);

  useEffect(() => {
    if (mode === 'dropdown' && selectedPath) {
      const normalizedPath = selectedPath.replace(/\\/g, '/');
      axios
        .get(`http://localhost:8000/summary/codebase/file?path=${normalizedPath}`)
        .then((res) => setNewCode(res.data.code))
        .catch((err) => console.error('Failed to load file:', err));
        setLoading(false)
    }
  }, [selectedPath, mode]);

  const handleGenerateImpact = async () => {
    setLoading(true);
    setImpactSummary('');

    const form = new FormData();

    if (mode === 'upload') {
      if (!uploadFile) return;
      form.append('file', uploadFile);
    } else if (mode === 'code') {
      if (!newCode.trim()) return;
      form.append('code', newCode);
    } else if (mode === 'dropdown') {
      if (!newCode.trim()) return;
      form.append('code', newCode);
      form.append('file_path', selectedPath);
    }

    try {
      const res = await axios.post('http://localhost:8000/summary/summary/impact', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImpactSummary(res.data.impact_summary);
    } catch (err) {
      console.error('Impact summary error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 space-y-4 min-h-screen">
    
      <div className="flex flex-wrap gap-4 items-center">
        <label>Mode:</label>
        <select
          value={mode}
          onChange={(e) => {setMode(e.target.value); setImpactSummary(''); setNewCode(''); setUploadFile(null)}}
          className="p-2 border rounded bg-white dark:bg-gray-800"
        >
          <option value="code">Paste Code</option>
          <option value="upload">Upload File</option>
          <option value="dropdown">Select Existing File</option>
        </select>

        {mode === 'dropdown' && (
          <select
            value={selectedPath}
            onChange={(e) => setSelectedPath(e.target.value)}
            className="p-2 border rounded bg-white dark:bg-gray-800"
          >
            {codebases?.map((cb) => (
              <option key={cb} value={cb}>{cb}</option>
            ))}
          </select>
        )}

        <button
          onClick={handleGenerateImpact}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Analyze Impact
        </button>
      </div>

      {mode === 'upload' && (
        <input
          type="file"
          accept=".py,.js,.java"
          onChange={(e) => setUploadFile(e.target.files[0])}
          className="p-2"
        />
      )}

      {(mode === 'code' || mode === 'dropdown') && (
        <div className="mt-4">
          <Editor
            height="400px"
            language="python"
            value={newCode}
            theme="vs-dark"
            onChange={(value) => setNewCode(value || '')}
            className="rounded border"
          />
        </div>
      )}

      {loading && <p>Generating business logic impact...</p>}

      {impactSummary && (
        <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded">
          <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
            Business Logic Impact Summary
          </h3>
          <pre className="whitespace-pre-wrap text-sm">{impactSummary}</pre>
        </div>
      )}
    </div>
  );
};

export default SummaryViewer;
