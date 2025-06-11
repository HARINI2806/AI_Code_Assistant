// src/pages/VisualizerPage.js
import React from 'react';
import MermaidRenderer from '../components/MermaidRenderer';

const VisualizerPage = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold">Visualize Codebase Structure</h2>
      <MermaidRenderer />
    </div>
  );
};

export default VisualizerPage;
