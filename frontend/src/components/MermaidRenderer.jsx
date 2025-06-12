// src/components/MermaidRenderer.jsx
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import mermaid from 'mermaid';

mermaid.initialize({ startOnLoad: false });

const MermaidRenderer = () => {
  const [diagramType, setDiagramType] = useState('class'); // or 'dependency'
  const [diagramText, setDiagramText] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloadLink, setDownloadLink] = useState('');
  const diagramRef = useRef(null);

  useEffect(() => {
    if (diagramText && diagramRef.current) {
      renderMermaidDiagram(diagramText);
    }
  }, [diagramText]);

  const renderMermaidDiagram = async (code) => {
    try {
      const { svg } = await mermaid.render('mermaid-diagram', code);
      diagramRef.current.innerHTML = svg;
    } catch (err) {
      diagramRef.current.innerHTML = `<p class="text-red-500">Error rendering Mermaid diagram</p>`;
    }
  };

  const generateDiagram = async () => {
    setLoading(true);
    setDiagramText('');
    setDownloadLink('');
    if (diagramRef.current) {
    diagramRef.current.innerHTML = '';
  }

    try {
      const endpoint =
        diagramType === 'class'
          ? 'http://localhost:8000/visualizer/visualizer/class-diagram'
          : 'http://localhost:8000/visualizer/visualizer/dependency-graph';
      
      console.log(endpoint)
      const res = await axios.post(endpoint);
      if(res.status == 200){
        const filename = res.data.file.split('\\').pop();
        const fetchText = await axios.get(`http://localhost:8000/visualizer/visualizer/download?file=${filename}`);
        setDiagramText(fetchText.data);
        setDownloadLink(`http://localhost:8000/visualizer/visualizer/download?file=${filename}`);
      }
    } catch (err) {
      alert('Error generating diagram: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded shadow w-full max-w-5xl mx-auto">
      <h3 className="text-2xl font-semibold mb-4">Mermaid Diagram Generator</h3>

      <div className="flex flex-wrap items-center gap-4 mb-4">
        <label htmlFor="type" className="text-sm">Diagram Type:</label>
        <select
          id="type"
          className="p-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          value={diagramType}
          onChange={(e) => setDiagramType(e.target.value)}
        >
          <option value="class">Class Diagram</option>
          <option value="dependency">Dependency Graph</option>
        </select>

        <button
          onClick={generateDiagram}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Generate Diagram'}
        </button>

        {downloadLink && (
          <a
            href={downloadLink}
            download
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Download .mmd
          </a>
        )}
      </div>

      {diagramText && (
        <>
          <div
            ref={diagramRef}
            className="bg-white dark:bg-gray-800 p-4 border rounded shadow overflow-auto"
          />
          <pre className="mt-4 text-sm bg-gray-100 dark:bg-gray-800 border p-3 rounded overflow-auto">
            {diagramText}
          </pre>
        </>
      )}
    </div>
  );
};

export default MermaidRenderer;