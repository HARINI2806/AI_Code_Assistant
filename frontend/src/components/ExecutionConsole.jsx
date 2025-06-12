// src/components/ExecutionConsole.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ReactJson from 'react18-json-view';

const ExecutionConsole = () => {
  const [codebases, setCodebases] = useState([]);
  const [codebase, setCodebase] = useState('');
  const [functionName, setFunctionName] = useState('');
  const [args, setArgs] = useState('[]');
  const [kwargs, setKwargs] = useState('{}');
  const [output, setOutput] = useState('');

  useEffect(() => {
    const fetchCodebases = async () => {
      try {
        const res = await axios.get('http://localhost:8000/pdf/pdf/codebases');
        setCodebases(res.data.codebases);
        setCodebase(res.data.codebases[0] || '');
      } catch (err) {
        console.error('Failed to fetch codebases:', err);
      }
    };

    fetchCodebases();
  }, []);

  const runFunction = async () => {
    try {
      const response = await axios.post('http://localhost:8000/execute/execute', {
        codebase_path: `./sample-codebase/${codebase}`,
        function_name: functionName,
        args: args.trim() ? JSON.parse(args) : [],
        kwargs: kwargs.trim() ? JSON.parse(kwargs) : {},
      });
      setOutput(response.data.output);
    } catch (err) {
      setOutput(`Error: ${err.response?.data?.detail || err.message}`);
    }
  };

  return (
    <div className="space-y-4 p-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="flex gap-4 items-center">
        <label>Codebase:</label>
        <select
          value={codebase}
          onChange={(e) => setCodebase(e.target.value)}
          className="p-2 border rounded bg-white dark:bg-gray-800"
        >
          {codebases.map((cb) => (
            <option key={cb} value={cb}>
              {cb}
            </option>
          ))}
        </select>
      </div>

      <input
        type="text"
        placeholder="Enter function name (e.g. sample_run)"
        value={functionName}
        onChange={(e) => setFunctionName(e.target.value)}
        className="w-full border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 rounded px-4 py-2"
      />

      <textarea
        placeholder='Arguments (JSON array: ["arg1", 123])'
        value={args}
        onChange={(e) => setArgs(e.target.value)}
        className="w-full border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 rounded px-4 py-2"
        rows={3}
      />

      <textarea
        placeholder='Keyword arguments (JSON object: {"key": "value"})'
        value={kwargs}
        onChange={(e) => setKwargs(e.target.value)}
        className="w-full border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 rounded px-4 py-2"
        rows={3}
      />

      <button
        type='button'
        onClick={runFunction}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Run Function
      </button>
      <br></br>

      {output && (
        <ReactJson
          src={output}
          name={false}
          collapsed={2}
          enableClipboard={true}
          displayDataTypes={false}
          theme="rjv-default"
          style={{ backgroundColor: 'transparent', marginTop: '10px', width: '100%'}}
        />
      )
    }
    </div>
  );
};

export default ExecutionConsole;
