import React from 'react';
import ExecutionConsole from '../components/ExecutionConsole';

const ExecutionPage = () => {
  return (
     <div className="p-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
    <div className="p-6">
      <h2 className="text-2xl font-semibold">Run Functions in Your Codebase</h2>
      <ExecutionConsole />
    </div>
    </div>
  );
};
export default ExecutionPage;