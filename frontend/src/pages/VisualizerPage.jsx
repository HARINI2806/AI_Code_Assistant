// src/pages/VisualizerPage.js
import React from 'react';
import MermaidRenderer from '../components/MermaidRenderer';

const VisualizerPage = () => {
  return (
     <div className="p-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
    <div className="p-6">
      <h2 className="text-2xl font-semibold">Visualize Codebase Structure</h2>
      <MermaidRenderer />
    </div>
    </div>
  );
};

export default VisualizerPage;
