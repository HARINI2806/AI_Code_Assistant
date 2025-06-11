// src/pages/QAView.js
import React from 'react';
import QAPrompt from '../components/QAPrompt';

const QAView = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Ask Questions About Your Codebase</h2>
      <QAPrompt />
    </div>
  );
};

export default QAView;
