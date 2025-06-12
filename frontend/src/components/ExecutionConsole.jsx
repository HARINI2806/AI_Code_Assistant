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

  useEffect(() => {
    const fetchRunnableFiles = async () => {
      try {
        const res = await axios.get('http://localhost:8000/execute/runnable-files');
        setRunnableFiles(res.data.runnable_files);
        setSelectedFile(res.data.runnable_files[0] || '');
      } catch (err) {
        console.error('Failed to fetch runnable files:', err);
        setError('Failed to fetch runnable files');
      }
    };

    fetchRunnableFiles();
  }, []);

  const validateJSON = (jsonString, fieldName) => {
    if (!jsonString.trim()) return true;
    
    try {
      JSON.parse(jsonString);
      return true;
    } catch (err) {
      setError(`Invalid JSON in ${fieldName}: ${err.message}`);
      return false;
    }
  };

  const formatOutput = (rawOutput) => {
    // If the output is already an object/array, return as is
    if (typeof rawOutput === 'object' && rawOutput !== null) {
      return rawOutput;
    }

    // If it's a string, try to parse it as JSON first
    if (typeof rawOutput === 'string') {
      try {
        const parsed = JSON.parse(rawOutput);
        return parsed;
      } catch (err) {
        // If it's not valid JSON, return as a string value
        return { result: rawOutput, type: 'string' };
      }
    }

    // For other primitive types
    return { result: rawOutput, type: typeof rawOutput };
  };

  const runFunction = async () => {
    setError('');
    setOutput(null);
    setExecutionTime(null);

    // Validate inputs
    if (!functionName.trim()) {
      setError('Function name is required');
      return;
    }

    if (!selectedFile) {
      setError('Please select a Python file to run');
      return;
    }

    if (!validateJSON(args, 'arguments')) return;
    if (!validateJSON(kwargs, 'keyword arguments')) return;

    try {
      setLoading(true);
      const startTime = performance.now();

      // Construct the correct codebase path
      const codebasePath = `./sample-codebase/${selectedFile}`;

      const response = await axios.post('http://localhost:8000/execute/execute', {
        codebase_path: codebasePath,
        function_name: functionName,
        args: args.trim() ? JSON.parse(args) : [],
        kwargs: kwargs.trim() ? JSON.parse(kwargs) : {},
      });

      const endTime = performance.now();
      setExecutionTime(Math.round(endTime - startTime));

      const formattedOutput = formatOutput(response.data.output);
      setOutput(formattedOutput);

    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message;
      setError(errorMessage);
      
      // Also set error as output for display
      setOutput({
        error: true,
        message: errorMessage,
        status: err.response?.status || 'Unknown',
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const clearOutput = () => {
    setOutput(null);
    setError('');
    setExecutionTime(null);
  };

  const copyToClipboard = () => {
    if (output) {
      navigator.clipboard.writeText(JSON.stringify(output, null, 2));
    }
  };

  return (
    <div className="space-y-6 p-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Function Execution Console</h2>
        
        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-300 rounded">
            <div className="flex justify-between items-start">
              <span>{error}</span>
              <button 
                onClick={() => setError('')} 
                className="ml-2 text-red-500 hover:text-red-700 font-bold"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Python File Selection */}
        <div className="flex gap-4 items-center mb-4">
          <label className="font-medium min-w-max">Python File:</label>
          <select
            value={selectedFile}
            onChange={(e) => setSelectedFile(e.target.value)}
            className="flex-1 p-2 border rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
            disabled={loading}
          >
            <option value="">Select a Python file...</option>
            {runnableFiles.map((file) => (
              <option key={file} value={file}>
                {file}
              </option>
            ))}
          </select>
        </div>

        {/* Function Name */}
        <div className="mb-4">
          <label className="block font-medium mb-2">Function Name:</label>
          <input
            type="text"
            placeholder="Enter function name (e.g. sample_run)"
            value={functionName}
            onChange={(e) => setFunctionName(e.target.value)}
            className="w-full border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded px-4 py-2 text-gray-900 dark:text-gray-100"
            disabled={loading}
          />
        </div>

        {/* Arguments */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block font-medium mb-2">Arguments (JSON Array):</label>
            <textarea
              placeholder='["arg1", 123, true]'
              value={args}
              onChange={(e) => setArgs(e.target.value)}
              className="w-full border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded px-4 py-2 text-gray-900 dark:text-gray-100 font-mono text-sm"
              rows={3}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block font-medium mb-2">Keyword Arguments (JSON Object):</label>
            <textarea
              placeholder='{"key": "value", "num": 42}'
              value={kwargs}
              onChange={(e) => setKwargs(e.target.value)}
              className="w-full border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded px-4 py-2 text-gray-900 dark:text-gray-100 font-mono text-sm"
              rows={3}
              disabled={loading}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 items-center">
          <button
            type="button"
            onClick={runFunction}
            disabled={loading || !functionName.trim() || !selectedFile}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Running...
              </>
            ) : (
              'Run Function'
            )}
          </button>

          <button
            type="button"
            onClick={clearOutput}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            disabled={!output}
          >
            Clear
          </button>

          {output && (
            <button
              type="button"
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

      {/* Output Display */}
      {output && (
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold">Output:</h3>
            <div className="flex gap-2">
              {output.error && (
                <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded text-sm">
                  Error
                </span>
              )}
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-sm">
                JSON
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 overflow-auto max-h-96">
            <ReactJson
              src={output}
              name={false}
              collapsed={false}
              enableClipboard={true}
              displayDataTypes={true}
              displayObjectSize={true}
              displayArrayKey={true}
              theme="rjv-default"
              style={{
                backgroundColor: 'transparent',
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", monospace',
                fontSize: '13px',
                lineHeight: '1.4'
              }}
              iconStyle="circle"
              indentWidth={4}
              collapseStringsAfterLength={100}
              shouldCollapse={(field) => {
                // Auto-collapse large arrays/objects
                if (field.src && typeof field.src === 'object') {
                  const keys = Object.keys(field.src);
                  return keys.length > 10;
                }
                return false;
              }}
            />
          </div>
        </div>
      )}

      {/* Usage Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
        <h4 className="font-semibold mb-2">Usage Instructions:</h4>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>• Select a Python file from the dropdown (only files with main.py are shown)</li>
          <li>• Enter the exact function name you want to execute</li>
          <li>• Provide arguments as a JSON array (e.g., ["hello", 123, true])</li>
          <li>• Provide keyword arguments as a JSON object</li>
          <li>• Click "Run Function" to execute</li>
        </ul>
      </div>
    </div>
  );
};

export default ExecutionConsole;