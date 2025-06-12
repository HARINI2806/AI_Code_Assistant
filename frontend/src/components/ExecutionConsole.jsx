// src/components/ExecutionConsole.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ReactJson from 'react18-json-view';

const ExecutionConsole = () => {
  const [runnableFiles, setRunnableFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState('');
  const [functionName, setFunctionName] = useState('');
  const [args, setArgs] = useState('[]');
  const [kwargs, setKwargs] = useState('{}');
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [executionTime, setExecutionTime] = useState(null);
  const [filesLoading, setFilesLoading] = useState(true);

  // 🧩 Utility: Validate JSON input
  const parseJSON = (json, field) => {
    try {
      return JSON.parse(json);
    } catch (err) {
      throw new Error(`Invalid JSON in ${field}: ${err.message}`);
    }
  };

  // 🌐 Fetch available Python files
  useEffect(() => {
    const fetchRunnableFiles = async () => {
      try {
        const res = await axios.get('http://localhost:8000/execute/runnable-files');
        const files = res.data.runnable_files || [];
        setRunnableFiles(files);
        if (files.length > 0) setSelectedFile(files[0]);
      } catch (err) {
        setError('Failed to fetch runnable files');
        console.error(err);
      } finally {
        setFilesLoading(false);
      }
    };
    fetchRunnableFiles();
  }, []);

  // 🧠 Format output safely
  const formatOutput = (raw) => {
    if (typeof raw === 'object' && raw !== null) return raw;
    if (typeof raw === 'string') {
      try {
        return JSON.parse(raw);
      } catch {
        return { result: raw, type: 'string' };
      }
    }
    return { result: raw, type: typeof raw };
  };

  // ▶️ Run the selected function
  const runFunction = async () => {
    setError('');
    setOutput(null);
    setExecutionTime(null);

    if (!functionName.trim()) return setError('Function name is required');
    if (!selectedFile) return setError('Please select a Python file');

    try {
      const parsedArgs = parseJSON(args, 'Arguments');
      const parsedKwargs = parseJSON(kwargs, 'Keyword Arguments');

      setLoading(true);
      const start = performance.now();

      const response = await axios.post('http://localhost:8000/execute/execute', {
        codebase_path: `./sample-codebase/${selectedFile}`,
        function_name: functionName.trim(),
        args: parsedArgs,
        kwargs: parsedKwargs
      });

      const end = performance.now();
      setExecutionTime(Math.round(end - start));
      setOutput(formatOutput(response.data.output));
    } catch (err) {
      const msg = err.response?.data?.detail || err.message;
      setError(msg);
      setOutput({
        error: true,
        message: msg,
        status: err.response?.status || 'Unknown',
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  // 🔘 UI helpers
  const clearOutput = () => {
    setOutput(null);
    setError('');
    setExecutionTime(null);
  };

  const copyToClipboard = () => {
    if (output) navigator.clipboard.writeText(JSON.stringify(output, null, 2));
  };

  const groupFilesByFolder = (files) => {
    const grouped = {};
    files.forEach((file) => {
      const [dir, ...rest] = file.split('/');
      const folder = rest.length ? dir : '.';
      grouped[folder] = grouped[folder] || [];
      grouped[folder].push(file);
    });
    return grouped;
  };

  return (
    <div className="space-y-6 p-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Function Execution Console</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-300 rounded">
            <div className="flex justify-between items-start">
              <span>{error}</span>
              <button onClick={() => setError('')} className="ml-2 font-bold">×</button>
            </div>
          </div>
        )}

        {/* File Dropdown */}
        <div className="flex gap-4 items-center mb-4">
          <label className="font-medium min-w-max">Python File:</label>
          <select
            value={selectedFile}
            onChange={(e) => setSelectedFile(e.target.value)}
            className="flex-1 p-2 border rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
            disabled={loading || filesLoading}
          >
            {filesLoading ? (
              <option>Loading files...</option>
            ) : runnableFiles.length === 0 ? (
              <option>No Python files found</option>
            ) : (
              Object.entries(groupFilesByFolder(runnableFiles)).map(([folder, files]) => (
                <optgroup key={folder} label={folder === '.' ? 'Root' : folder}>
                  {files.map((file) => (
                    <option key={file} value={file}>
                      {file}
                    </option>
                  ))}
                </optgroup>
              ))
            )}
          </select>
        </div>

        {/* Function name and arguments */}
        <div className="mb-4">
          <label className="block font-medium mb-2">Function Name:</label>
          <input
            type="text"
            placeholder="e.g. sample_run"
            value={functionName}
            onChange={(e) => setFunctionName(e.target.value)}
            className="w-full px-4 py-2 rounded border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
            disabled={loading}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block font-medium mb-2">Arguments (JSON Array):</label>
            <textarea
              value={args}
              onChange={(e) => setArgs(e.target.value)}
              className="w-full px-4 py-2 rounded border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 font-mono"
              rows={3}
              disabled={loading}
              placeholder='["arg1", 123]'
            />
          </div>
          <div>
            <label className="block font-medium mb-2">Keyword Arguments (JSON Object):</label>
            <textarea
              value={kwargs}
              onChange={(e) => setKwargs(e.target.value)}
              className="w-full px-4 py-2 rounded border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 font-mono"
              rows={3}
              disabled={loading}
              placeholder='{"param": "value"}'
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap gap-3 items-center mb-4">
          <button
            onClick={runFunction}
            disabled={loading || !functionName || !selectedFile}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Running...' : 'Run Function'}
          </button>

          <button
            onClick={clearOutput}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            disabled={!output}
          >
            Clear
          </button>

          {output && (
            <button
              onClick={copyToClipboard}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Copy Output
            </button>
          )}

          {executionTime && (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Executed in {executionTime}ms
            </span>
          )}
        </div>
      </div>

      {/* Output display */}
      {output && (
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 overflow-auto max-w-full">
          <h3 className="text-lg font-semibold mb-2">Output:</h3>
          <ReactJson
            src={output}
            name={false}
            collapsed={false}
            displayDataTypes={false}
            displayObjectSize={false}
            collapseStringsAfterLength={false}
            iconStyle="none" // 👈 hides the expand/collapse icon
            enableClipboard
            indentWidth={2}
            theme="harmonic"
            style={{
              fontSize: '14px',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              backgroundColor: 'transparent',
              whiteSpace: 'pre',
              wordBreak: 'break-word',
            }}
          />
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
        <h4 className="font-semibold mb-2">Usage Instructions:</h4>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
          <li>Select a Python file from the dropdown</li>
          <li>Enter the exact function name</li>
          <li>Arguments must be a JSON array (e.g., ["hello", 123])</li>
          <li>Keyword arguments must be a JSON object (e.g., {"{"}name: "value"{"}"})</li>
        </ul>
      </div>
    </div>
  );
};

export default ExecutionConsole;
