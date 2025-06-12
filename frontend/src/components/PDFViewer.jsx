// Enhanced PDFViewer.jsx with fixed search and sidebar
import React, { useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import axios from 'axios';

// Import required CSS for react-pdf
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = "https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js"

const PDFViewer = () => {
  const [paths, setPaths] = useState([]);
  const [selectedPath, setSelectedPath] = useState('ALL');
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfDocument, setPdfDocument] = useState(null); // Store the PDF document instance
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.2);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [matches, setMatches] = useState([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const viewerRef = useRef();

  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8000/pdf/pdf/codebases').then(res => {
      setPaths(res.data.codebases);
    }).catch(err => {
      console.error('Failed to load codebases:', err);
      setError('Failed to load codebases');
    });
  }, []);

  // Cleanup blob URL when component unmounts or pdfFile changes
  useEffect(() => {
    return () => {
      if (pdfFile && typeof pdfFile === 'string' && pdfFile.startsWith('blob:')) {
        URL.revokeObjectURL(pdfFile);
      }
    };
  }, [pdfFile]);

  const extractFileListFromPDF = async (pdfDoc) => {
    try {
      const files = [];
      
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        
        // Look for file patterns in the text
        const filePatterns = [
          /### Summary for (.+?)(?:\n|$)/g,
          /File: (.+?)(?:\n|$)/g,
          /^(.+\.(py|js|jsx|java|cpp|c|h|ts|tsx|html|css|json|xml|yml|yaml|md|txt))$/gm
        ];
        
        filePatterns.forEach(pattern => {
          let match;
          while ((match = pattern.exec(pageText)) !== null) {
            const fileName = match[1].trim();
            if (fileName && !files.includes(fileName)) {
              files.push(fileName);
            }
          }
        });
      }
      
      setFileList([...new Set(files)].sort());
    } catch (err) {
      console.warn('Could not extract file list from PDF:', err);
      setFileList([]);
    }
  };

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setError(null);
      setPageNumber(1);
      setPdfFile(null);
      setPdfDocument(null);
      setNumPages(null);
      setFileList([]);
      setMatches([]);
      setSearchTerm('');

      // Generate PDF
      await axios.post('http://localhost:8000/pdf/pdf', { codebase_path: selectedPath });

      // Download PDF as blob
      const response = await axios.get('http://localhost:8000/pdf/pdf/download', {
        responseType: 'blob',
      });

      // Create blob URL for the PDF
      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
      const pdfUrl = URL.createObjectURL(pdfBlob);
      setPdfFile(pdfUrl);

    } catch (err) {
      console.error('Failed to generate or load PDF:', err);
      setError('Failed to generate or load PDF: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!pdfDocument || !searchTerm.trim()) {
      setMatches([]);
      return;
    }

    try {
      setSearchLoading(true);
      setError(null);
      const foundMatches = [];
      const searchTermLower = searchTerm.toLowerCase();

      for (let i = 1; i <= pdfDocument.numPages; i++) {
        const page = await pdfDocument.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ').toLowerCase();
        
        if (pageText.includes(searchTermLower)) {
          foundMatches.push(i);
        }
      }

      setMatches(foundMatches);
      setCurrentMatchIndex(0);
      
      if (foundMatches.length > 0) {
        setPageNumber(foundMatches[0]);
      } else {
        setError(`No matches found for "${searchTerm}"`);
      }
    } catch (err) {
      console.error('Search failed:', err);
      setError('Search failed: ' + err.message);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleNextMatch = () => {
    if (matches.length > 0) {
      const nextIndex = (currentMatchIndex + 1) % matches.length;
      setCurrentMatchIndex(nextIndex);
      setPageNumber(matches[nextIndex]);
    }
  };

  const handlePrevMatch = () => {
    if (matches.length > 0) {
      const prevIndex = currentMatchIndex === 0 ? matches.length - 1 : currentMatchIndex - 1;
      setCurrentMatchIndex(prevIndex);
      setPageNumber(matches[prevIndex]);
    }
  };

  const handleDownload = () => {
    if (pdfFile) {
      const link = document.createElement('a');
      link.href = pdfFile;
      link.download = 'codebase_summary.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handlePrint = () => {
    if (pdfFile) {
      const printWindow = window.open(pdfFile, '_blank');
      if (printWindow) {
        printWindow.addEventListener('load', () => {
          printWindow.print();
        });
      }
    }
  };

  const onDocumentLoadSuccess = async ({ numPages }) => {
    setNumPages(numPages);
    setError(null);
    
    // Get the PDF document instance for search functionality
    try {
      const pdfDoc = await pdfjs.getDocument(pdfFile).promise;
      setPdfDocument(pdfDoc);
      
      // Extract file list from the PDF content
      await extractFileListFromPDF(pdfDoc);
    } catch (err) {
      console.error('Failed to process PDF document:', err);
    }
  };

  const onDocumentLoadError = (error) => {
    console.error("PDF load error:", error);
    setError('Failed to load PDF: ' + error.message);
    setPdfDocument(null);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-4">PDF Summary Generator</h2>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
          <button 
            onClick={() => setError(null)} 
            className="ml-2 text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="mb-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded">
          Generating PDF...
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <select
          className="p-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          value={selectedPath}
          onChange={(e) => setSelectedPath(e.target.value)}
          disabled={loading}
        >
          {paths?.map((path) => (
            <option key={path} value={path}>{path}</option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search in PDF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            className="p-2 border rounded bg-white dark:bg-gray-800 text-black dark:text-white"
            disabled={!pdfDocument || loading}
          />
          <button 
            onClick={handleSearch} 
            className="bg-blue-500 text-white px-3 py-2 rounded disabled:opacity-50 hover:bg-blue-600"
            disabled={!pdfDocument || loading || searchLoading}
          >
            {searchLoading ? 'Searching...' : 'Search'}
          </button>
          
          {matches.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {matches.length} match{matches.length !== 1 ? 'es' : ''} ({currentMatchIndex + 1}/{matches.length})
              </span>
              <button 
                onClick={handlePrevMatch}
                className="bg-gray-300 dark:bg-gray-700 px-2 py-1 rounded text-sm"
                disabled={matches.length <= 1}
              >
                ↑
              </button>
              <button 
                onClick={handleNextMatch}
                className="bg-gray-300 dark:bg-gray-700 px-2 py-1 rounded text-sm"
                disabled={matches.length <= 1}
              >
                ↓
              </button>
            </div>
          )}
        </div>

        <button 
          onClick={handleGenerate} 
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Generate PDF'}
        </button>
        
        <button 
          onClick={handleDownload} 
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          disabled={!pdfFile}
        >
          Download
        </button>
        
        <button 
          onClick={handlePrint} 
          className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 disabled:opacity-50"
          disabled={!pdfFile}
        >
          Print
        </button>
        
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)} 
          className="bg-gray-300 dark:bg-gray-700 px-3 py-2 rounded hover:bg-gray-400 dark:hover:bg-gray-600"
        >
          {sidebarOpen ? 'Hide' : 'Show'} Sidebar
        </button>
      </div>

      {pdfFile && (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          {sidebarOpen && (
            <div className="w-full lg:w-80 bg-gray-100 dark:bg-gray-800 border p-4 rounded overflow-auto max-h-[80vh]">
              <div className="mb-4">
                <h4 className="font-semibold mb-3 text-lg">Files Covered</h4>
                {fileList.length > 0 ? (
                  <ul className="text-sm space-y-1">
                    {fileList.map((file, i) => (
                      <li key={i} className="p-2 bg-white dark:bg-gray-700 rounded border-l-4 border-blue-500">
                        <span className="font-mono text-xs text-blue-600 dark:text-blue-400">
                          {file}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                    {pdfDocument ? 'No files detected' : 'Generate PDF to see files'}
                  </p>
                )}
              </div>

              {matches.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 text-lg">Search Results</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Found "{searchTerm}" on {matches.length} page{matches.length !== 1 ? 's' : ''}
                  </p>
                  <ul className="text-sm space-y-1">
                    {matches.map((pageNum, index) => (
                      <li key={pageNum}>
                        <button
                          className={`w-full text-left p-2 rounded hover:bg-blue-100 dark:hover:bg-blue-800 ${
                            index === currentMatchIndex 
                              ? 'bg-blue-200 dark:bg-blue-700 font-semibold' 
                              : 'bg-white dark:bg-gray-700'
                          }`}
                          onClick={() => {
                            setPageNumber(pageNum);
                            setCurrentMatchIndex(index);
                          }}
                        >
                          Page {pageNum}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Viewer */}
          <div className="flex-1 flex flex-col items-center">
            <div className="flex gap-4 mb-4 items-center">
              <button 
                onClick={() => setScale((s) => Math.max(0.5, s - 0.2))} 
                className="px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                −
              </button>
              <span className="text-sm font-medium">Zoom: {(scale * 100).toFixed(0)}%</span>
              <button 
                onClick={() => setScale((s) => Math.min(3, s + 0.2))} 
                className="px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                +
              </button>
            </div>

            <div ref={viewerRef} className="max-w-4xl border bg-white dark:bg-gray-800 p-4 rounded shadow-lg">
              <Document
                file={pdfFile}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={<div className="p-8 text-center">Loading PDF...</div>}
                error={<div className="p-8 text-center text-red-500">Failed to load PDF</div>}
                noData={<div className="p-8 text-center">No PDF loaded</div>}
              >
                <Page 
                  pageNumber={pageNumber} 
                  scale={scale}
                  loading={<div className="p-4 text-center">Loading page...</div>}
                  error={<div className="p-4 text-center text-red-500">Failed to load page</div>}
                />
              </Document>
            </div>

            {numPages && (
              <div className="flex justify-between items-center mt-4 w-full max-w-md">
                <button 
                  onClick={() => setPageNumber((p) => Math.max(1, p - 1))} 
                  disabled={pageNumber === 1} 
                  className="bg-gray-300 dark:bg-gray-700 px-4 py-2 rounded disabled:opacity-50 hover:bg-gray-400 dark:hover:bg-gray-600"
                >
                  Previous
                </button>
                <span className="font-medium">
                  Page {pageNumber} of {numPages}
                </span>
                <button 
                  onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))} 
                  disabled={pageNumber === numPages} 
                  className="bg-gray-300 dark:bg-gray-700 px-4 py-2 rounded disabled:opacity-50 hover:bg-gray-400 dark:hover:bg-gray-600"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFViewer;