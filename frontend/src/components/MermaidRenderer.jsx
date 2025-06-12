// src/components/MermaidRenderer.js
import React, { useState } from 'react';
import axios from 'axios';
import mermaid from 'mermaid';

const MermaidRenderer = () => {
  const [diagram, setDiagram] = useState('');
  const [renderedHtml, setRenderedHtml] = useState('');

  const generateDiagram = async () => {
    try {
      const response = await axios.post('http://localhost:8000/visualizer/visualizer/dependency-graph', {
        type: 'class', // You could let the user choose type
      });
      setDiagram(response.data.diagram);

      const { svg } = await mermaid.render('generatedDiagram', response.data.diagram);
      setRenderedHtml(svg);
    } catch (err) {
      setDiagram('');
      setRenderedHtml('');
      alert('Failed to generate diagram');
    }
  };

  const download = async (format = 'svg') => {
    const res = await axios.get(`/api/visualizer/download?format=${format}`, {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `diagram.${format}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-4">
      <button onClick={generateDiagram} className="bg-blue-500 text-white px-4 py-2 rounded">
        Generate Diagram
      </button>
      {diagram && (
        <>
          <div
            className="bg-white p-4 border rounded"
            dangerouslySetInnerHTML={{ __html: renderedHtml }}
          />
          <div className="space-x-2">
            <button
              onClick={() => download('mmd')}
              className="bg-gray-500 text-white px-3 py-1 rounded"
            >
              Download .mmd
            </button>
            <button
              onClick={() => download('svg')}
              className="bg-gray-700 text-white px-3 py-1 rounded"
            >
              Download .svg
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default MermaidRenderer;
