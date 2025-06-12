// src/components/MermaidRenderer.jsx
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import mermaid from 'mermaid';
import { Download, RefreshCw, Eye, FileText, GitBranch, Activity, Package, Zap, AlertCircle } from 'lucide-react';

// Initialize Mermaid
mermaid.initialize({ 
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  themeVariables: {
    primaryColor: '#3B82F6',
    primaryTextColor: '#1F2937',
    primaryBorderColor: '#2563EB',
    lineColor: '#6B7280',
    secondaryColor: '#F3F4F6',
    tertiaryColor: '#FBBF24'
  }
});

const MermaidRenderer = () => {
  const [diagramType, setDiagramType] = useState('class');
  const [diagramText, setDiagramText] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloadLink, setDownloadLink] = useState('');
  const [error, setError] = useState('');
  const [availableDiagrams, setAvailableDiagrams] = useState([]);
  const [codebasePath, setCodebasePath] = useState('./sample-codebase');
  const [includePrivate, setIncludePrivate] = useState(true);
  const diagramRef = useRef(null);

  const diagramTypes = [
    {
      id: 'class',
      name: 'Enhanced Class Diagram',
      description: 'Shows classes with methods, attributes, and inheritance relationships',
      icon: Package,
      endpoint: 'http://localhost:8000/visualizer/visualizer/class-diagram'
    },
    {
      id: 'dependency',
      name: 'Module Dependency Graph',
      description: 'Shows dependencies between modules and packages',
      icon: GitBranch,
      endpoint: 'http://localhost:8000/visualizer/visualizer/dependency-graph'
    },
    {
      id: 'call_flow',
      name: 'Function Call Flow',
      description: 'Shows function call relationships and flow',
      icon: Zap,
      endpoint: 'http://localhost:8000/visualizer/visualizer/call-flow'
    },
    {
      id: 'complexity',
      name: 'Complexity Heatmap',
      description: 'Visual representation of code complexity metrics',
      icon: Activity,
      endpoint: 'http://localhost:8000/visualizer/visualizer/complexity-heatmap'
    },
    {
      id: 'package',
      name: 'Package Structure',
      description: 'Shows the directory and package structure',
      icon: FileText,
      endpoint: 'http://localhost:8000/visualizer/visualizer/package-structure'
    }
  ];

  useEffect(() => {
    loadAvailableDiagrams();
  }, []);

  useEffect(() => {
    if (diagramText && diagramRef.current) {
      renderMermaidDiagram(diagramText);
    }
  }, [diagramText]);

  const loadAvailableDiagrams = async () => {
    try {
      const response = await axios.get('http://localhost:8000/visualizer/visualizer/list');
      setAvailableDiagrams(response.data.diagrams || []);
    } catch (err) {
      console.error('Error loading available diagrams:', err);
    }
  };

  const renderMermaidDiagram = async (code) => {
    try {
      // Generate unique ID for each render
      const diagramId = `mermaid-diagram-${Date.now()}`;
      const { svg } = await mermaid.render(diagramId, code);
      
      if (diagramRef.current) {
        diagramRef.current.innerHTML = svg;
      }
    } catch (err) {
      console.error('Mermaid rendering error:', err);
      if (diagramRef.current) {
        diagramRef.current.innerHTML = `
          <div class="flex items-center justify-center p-8 bg-red-50 border border-red-200 rounded-lg">
            <div class="text-center">
              <div class="w-12 h-12 mx-auto mb-3 text-red-500">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </div>
              <p class="text-red-700 font-semibold">Error rendering Mermaid diagram</p>
              <p class="text-red-600 text-sm mt-1">${err.message}</p>
            </div>
          </div>
        `;
      }
    }
  };

  const generateDiagram = async () => {
    setLoading(true);
    setDiagramText('');
    setDownloadLink('');
    setError('');
    
    if (diagramRef.current) {
      diagramRef.current.innerHTML = '';
    }

    try {
      const selectedType = diagramTypes.find(t => t.id === diagramType);
      
      // Prepare request payload
      const requestData = {
        codebase_path: codebasePath,
        include_private: includePrivate
      };

      // Make API call to generate diagram
      const response = await axios.post(selectedType.endpoint, requestData);
      
      if (response.data.file) {
        // Extract filename from path
        const filename = response.data.file.split('\\').pop();
        
        // Fetch the diagram content
        const diagramResponse = await axios.get(`http://localhost:8000/visualizer/visualizer/download?file=${filename}`);
        
        setDiagramText(diagramResponse.data);
        setDownloadLink(`http://localhost:8000/visualizer/visualizer/download?file=${filename}`);
        
        // Refresh available diagrams list
        await loadAvailableDiagrams();
      }
      
    } catch (err) {
      console.error('Error generating diagram:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Unknown error occurred';
      setError(`Error generating diagram: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const loadExistingDiagram = async (filename) => {
    try {
      const response = await axios.get(`http://localhost:8000/visualizer/visualizer/download?file=${filename}`);
      setDiagramText(response.data);
      setDownloadLink(`http://localhost:8000/visualizer/visualizer/download?file=${filename}`);
      
      // Try to determine diagram type from filename
      const typeMatch = filename.match(/^(\w+)_.*\.mmd$/);
      if (typeMatch) {
        const fileType = typeMatch[1];
        const matchingType = diagramTypes.find(t => 
          filename.includes(t.id) || 
          filename.includes(fileType.replace('_', ''))
        );
        if (matchingType) {
          setDiagramType(matchingType.id);
        }
      }
    } catch (err) {
      setError(`Error loading diagram: ${err.message}`);
    }
  };

  const selectedDiagramType = diagramTypes.find(t => t.id === diagramType);
  const IconComponent = selectedDiagramType?.icon || Package;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="max-w-7xl mx-auto dark:bg-gray-900 dark:text-white ">
        {/* Header */}
        <div className="text-center mb-8 dark:bg-gray-900 dark:text-white">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 dark:bg-gray-900 dark:text-white">
            Advanced Codebase Visualizer
          </h1>
          <p className="text-gray-600 text-lg dark:bg-gray-900 dark:text-white">
            Generate comprehensive diagrams to understand your codebase structure and complexity
          </p>
        </div>

        {/* Configuration Panel */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 dark:bg-gray-900 dark:text-white">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 dark:bg-gray-900 dark:text-white">Configuration</h2>
          
          <div className="grid md:grid-cols-2 gap-6 dark:bg-gray-900 dark:text-white">
            <div className='dark:bg-gray-900 dark:text-white'>
              <label htmlFor="codebase" className="block text-sm font-medium text-gray-700 mb-2 dark:bg-gray-900 dark:text-white">
                Codebase Path
              </label>
              <input
                id="codebase"
                type="text"
                value={codebasePath}
                onChange={(e) => setCodebasePath(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                placeholder="./sample-codebase"
              />
            </div>
            
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2 dark:bg-gray-900 dark:text-white">
                Diagram Type
              </label>
              <div className="relative dark:bg-gray-900 dark:text-white">
                <select
                  id="type"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  value={diagramType}
                  onChange={(e) => setDiagramType(e.target.value)}
                >
                  {diagramTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Additional Options */}
          <div className="mt-4 dark:bg-gray-900 dark:text-white">
            <label className="flex items-center dark:bg-gray-900 dark:text-white">
              <input
                type="checkbox"
                checked={includePrivate}
                onChange={(e) => setIncludePrivate(e.target.checked)}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-900 text-gray-900 dark:text-white"
              />
              <span className="text-sm text-gray-700 dark:bg-gray-900 dark:text-white">Include private methods and attributes</span>
            </label>
          </div>

          {/* Diagram Type Description */}
          {selectedDiagramType && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
              <div className="flex items-center gap-3 dark:bg-gray-900 dark:text-white">
                <IconComponent className="w-5 h-5 text-blue-600 dark:bg-gray-900 dark:text-white" />
                <div className='dark:bg-gray-900 dark:text-white'>
                  <h3 className="font-medium text-blue-800 dark:bg-gray-900 dark:text-white">{selectedDiagramType.name}</h3>
                  <p className="text-sm text-blue-600 dark:bg-gray-900 dark:text-white">{selectedDiagramType.description}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Panel */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 dark:bg-gray-900 text-gray-900 dark:text-white">
          <div className="flex flex-wrap items-center gap-4 dark:bg-gray-900 dark:text-white">
            <button
              onClick={generateDiagram}
              disabled={loading}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
              {loading ? 'Generating...' : 'Generate Diagram'}
            </button>

            {downloadLink && (
              <a
                href={downloadLink}
                download
                className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 font-medium "
              >
                <Download className="w-4 h-4" />
                Download .mmd
              </a>
            )}

            <button
              onClick={loadAvailableDiagrams}
              className="flex items-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-all duration-200 font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh List
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <p className="text-red-700 font-medium">Error</p>
            </div>
            <p className="text-red-600 mt-1">{error}</p>
          </div>
        )}

        {/* Diagram Display */}
        {diagramText && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6 dark:bg-gray-900 text-gray-900 dark:text-white">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 dark:bg-gray-900 dark:text-white">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 dark:bg-gray-900 dark:text-white">
                <IconComponent className="w-5 h-5" />
                {selectedDiagramType?.name} Preview
              </h3>
            </div>
            
            <div className="p-6">
              <div
                ref={diagramRef}
                className="bg-white border border-gray-200 rounded-lg p-6 mb-6 min-h-[300px] flex items-center justify-center overflow-auto dark:bg-gray-900 dark:text-white"
              />
              
              {/* Diagram Source Code */}
              <div className="mt-6 dark:bg-gray-900 dark:text-white">
                <div className="flex items-center justify-between mb-2 dark:bg-gray-900 dark:text-white">
                  <h4 className="text-sm font-medium text-gray-700 dark:bg-gray-900 dark:text-white">Mermaid Source Code</h4>
                  <button
                    onClick={() => navigator.clipboard.writeText(diagramText)}
                    className="text-xs text-blue-600 hover:text-blue-800 transition-colors dark:bg-gray-900 dark:text-white"
                  >
                    Copy to Clipboard
                  </button>
                </div>
                <div className="bg-gray-900 rounded-lg p-4 overflow-auto max-h-64 dark:bg-gray-900 dark:text-white">
                  <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap ">
                    <code>{diagramText}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Available Diagrams List */}
        {availableDiagrams.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 dark:bg-gray-900 dark:text-white">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 dark:bg-gray-900 dark:text-white">Previously Generated Diagrams</h3>
            <div className="grid gap-4">
              {availableDiagrams.map((diagram, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{diagram.filename}</p>
                      <p className="text-sm text-gray-500">
                        {Math.round(diagram.size / 1024)} KB • {new Date(diagram.modified * 1000).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => loadExistingDiagram(diagram.filename)}
                      className="text-blue-600 hover:text-blue-800 transition-colors p-2 hover:bg-blue-50 rounded"
                      title="Load Diagram"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <a
                      href={diagram.download_url || `http://localhost:8000/visualizer/visualizer/download?file=${diagram.filename}`}
                      download
                      className="text-green-600 hover:text-green-800 transition-colors p-2 hover:bg-green-50 rounded"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Feature Overview */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6 dark:bg-gray-900 dark:text-white">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 dark:bg-gray-900 dark:text-white">Diagram Types Overview</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 dark:bg-gray-900 dark:text-white">
            {diagramTypes.map((type) => {
              const IconComp = type.icon;
              return (
                <div key={type.id} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer dark:bg-gray-900 dark:text-white"
                     onClick={() => setDiagramType(type.id)}>
                  <div className="flex items-center gap-3 mb-2 dark:bg-gray-900 dark:text-white">
                    <IconComp className="w-5 h-5 text-blue-600 dark:bg-gray-900 dark:text-white" />
                    <h4 className="font-medium text-gray-800 dark:bg-gray-900 dark:text-white">{type.name}</h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:bg-gray-900 dark:text-white">{type.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MermaidRenderer;