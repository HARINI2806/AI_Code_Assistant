// src/components/SummaryViewer.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const SummaryViewer = () => {
  const [codebases, setCodebases] = useState([]);
  const [selectedPath, setSelectedPath] = useState('');
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // fetch codebase folders
    const fetchCodebases = async () => {
      try {
        const res = await axios.get('http://localhost:8000/pdf/pdf/codebases');
        setCodebases(res.data.codebases);
        setSelectedPath(res.data.codebases[0] || '');
      } catch (err) {
        console.error('Failed to fetch codebases:', err);
      }
    };
    fetchCodebases();
  }, []);

  const fetchSummary = async () => {
    if (!selectedPath) return;
    setLoading(true);
    setSummaries([]);

    try {
      const res = await axios.post('http://localhost:8000/summary/summary', {
        codebase_path: `./sample-codebase/${selectedPath}`,
      });

      const summaryList = Array.isArray(res.data.summary)
      ? res.data.summary
      : [res.data.summary];
    setSummaries(summaryList);
      console.log(summaryList)
    } catch (error) {
      console.error('Error fetching summary:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded shadow space-y-4">
      <h2 className="text-xl font-semibold">Codebase Summary</h2>

      <div className="flex gap-4 items-center">
        <label>Codebase:</label>
        <select
          value={selectedPath}
          onChange={(e) => setSelectedPath(e.target.value)}
          className="p-2 border rounded bg-white dark:bg-gray-800"
        >
          {codebases.map((cb) => (
            <option key={cb} value={cb}>
              {cb}
            </option>
          ))}
        </select>

        <button
          onClick={fetchSummary}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Generate Summary
        </button>
      </div>

      {loading && <p>Loading summary...</p>}

      {loading && <p>Generating summary...</p>}

      {summaries.length > 0 && (
        <div className="space-y-4 mt-4">
          {summaries.map((text, index) => (
            <div
              key={index}
              className="p-4 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 shadow"
            >
              <h3 className="font-semibold text-lg text-blue-700 dark:text-blue-300">
                Summary {index + 1}
              </h3>
              <p className="mt-2 text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                {text}
              </p>
            </div>
          ))}
        </div>
      )}


      {!loading && summaries.length === 0 && (
        <p className="text-sm text-gray-500">
          No summary available. Click "Generate Summary" to fetch one.
        </p>
      )}
    </div>
  );
};

export default SummaryViewer;
