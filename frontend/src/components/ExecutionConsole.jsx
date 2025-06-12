// src/components/ExecutionConsole.js
import React, { useState } from 'react';
import axios from 'axios';

const ExecutionConsole = () => {
  const [functionName, setFunctionName] = useState('');
  const [args, setArgs] = useState('');
  const [output, setOutput] = useState('');

  const runFunction = async () => {
    try {
      const response = await axios.post('/api/executor/run', {
        function_name: functionName,
        args: args.trim() ? JSON.parse(args) : [],
      });
      setOutput(response.data.output);
    } catch (err) {
      setOutput(`Error: ${err.response?.data?.detail || err.message}`);
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Enter function name (e.g. my_module.my_func)"
        value={functionName}
        onChange={(e) => setFunctionName(e.target.value)}
        className="w-full border bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 placeholder-gray-400 dark:placeholder-gray-500 rounded px-4 py-2"
      />
      <textarea
        placeholder='Optional arguments (JSON format: ["arg1", 123, true])'
        value={args}
        onChange={(e) => setArgs(e.target.value)}
       className="w-full border bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 placeholder-gray-400 dark:placeholder-gray-500 rounded px-4 py-2"
        rows={4}
      />
      <button
        onClick={runFunction}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Run
      </button>
      {output && (
        <pre className="bg-gray-100 p-4 rounded whitespace-pre-wrap">
          {output}
        </pre>
      )}
    </div>
  );
};

export default ExecutionConsole;
