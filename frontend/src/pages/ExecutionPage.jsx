import React from 'react';
import ExecutionConsole from '../components/ExecutionConsole';

const ExecutionPage = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold">Run Functions in Your Codebase</h2>
      <ExecutionConsole />
    </div>
  );
};
export default ExecutionPage;