// src/pages/QAView.js
import React from 'react';
import QAPrompt from '../components/QAPrompt';

const QAView = () => {
  return (
     <div className="p-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Ask Questions About Your Codebase</h2>
      <QAPrompt />
    </div>
    </div>
  );
};

export default QAView;
