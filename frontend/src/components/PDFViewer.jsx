// Enhanced additions to PDFViewer.jsx
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
  const [pdfFile, setPdfFile] = useState(null); // Changed from pdfUrl to pdfFile
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.2);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const viewerRef = useRef();

  const [fileList, setFileList] = useState([]); // sidebar filenames

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

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setError(null);
      setPageNumber(1);
      setPdfFile(null);
      setNumPages(null);
      setFileList([]);

      // Generate PDF
      await axios.post('http://localhost:8000/pdf/pdf', { codebase_path: selectedPath });

      // Download PDF as blob
      const response = await axios.get('http://localhost:8000/pdf/pdf/download', {
        responseType: 'blob', // Changed from 'arraybuffer' to 'blob'
      });

      // Create blob URL for the PDF
      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
      const pdfUrl = URL.createObjectURL(pdfBlob);
      setPdfFile(pdfUrl);

      // Try to extract file list (this might need adjustment based on your backend)
      // extractFileList('output/codebase_summary.pdf');
    } catch (err) {
      console.error('Failed to generate or load PDF:', err);
      setError('Failed to generate or load PDF: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const extractFileList = async (pdfPath) => {
    try {
      const txtRes = await axios.get(`/api/pdf/text?file=${encodeURIComponent(pdfPath)}`);
      const files = [...txtRes.data.matchAll(/^### File: (.+)$/gm)].map(m => m[1]);
      setFileList(files);
    } catch (e) {
      console.warn('Could not load file summary list');
    }
  };

  const handleSearch = async () => {
    if (!pdfFile || !searchTerm.trim()) return;

    try {
      setLoading(true);
      const loadingPdf = await pdfjs.getDocument(pdfFile).promise;
      const foundPages = [];

      for (let i = 1; i <= loadingPdf.numPages; i++) {
        const page = await loadingPdf.getPage(i);
        const content = await page.getTextContent();
        const fullText = content.items.map(it => it.str).join(' ').toLowerCase();
        if (fullText.includes(searchTerm.toLowerCase())) foundPages.push(i);
      }

      setMatches(foundPages);
      if (foundPages.length) setPageNumber(foundPages[0]);
    } catch (err) {
      console.error('Search failed:', err);
      setError('Search failed: ' + err.message);
    } finally {
      setLoading(false);
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

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setError(null);
  };

  const onDocumentLoadError = (error) => {
    console.error("PDF load error:", error);
    setError('Failed to load PDF: ' + error.message);
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-4">PDF Summary Generator</h2>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 background-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="mb-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded">
          Loading...
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

        <input
          type="text"
          placeholder="Search in PDF..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border rounded bg-white dark:bg-gray-800 text-black dark:text-white"
          disabled={!pdfFile || loading}
        />
        <button 
          onClick={handleSearch} 
          className="bg-blue-500 text-white px-3 py-1 rounded disabled:opacity-50"
          disabled={!pdfFile || loading}
        >
          Search
        </button>

        <button 
          onClick={handleGenerate} 
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Generate'}
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
          className="bg-gray-300 dark:bg-gray-700 px-3 py-2 rounded"
        >
          {sidebarOpen ? 'Hide' : 'Show'} Sidebar
        </button>
      </div>

      {pdfFile && (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          {sidebarOpen && (
            <div className="w-full lg:w-64 bg-gray-100 dark:bg-gray-800 border p-2 rounded overflow-auto max-h-[80vh]">
              <h4 className="font-semibold mb-2">Files Covered</h4>
              <ul className="text-sm list-disc pl-5">
                {fileList.map((file, i) => (
                  <li key={i}>{file}</li>
                ))}
              </ul>

              {matches.length > 0 && (
                <>
                  <h4 className="font-semibold mt-4 mb-1">Search Matches</h4>
                  <ul className="text-xs text-blue-500">
                    {matches?.map((p) => (
                      <li key={p} className="cursor-pointer hover:underline" onClick={() => setPageNumber(p)}>
                        Page {p}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}

          {/* Viewer */}
          <div className="flex-1 flex flex-col items-center">
            <div className="flex gap-4 mb-4">
              <button 
                onClick={() => setScale((s) => Math.max(0.5, s - 0.2))} 
                className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded"
              >
                −
              </button>
              <span className="text-sm">Zoom: {(scale * 100).toFixed(0)}%</span>
              <button 
                onClick={() => setScale((s) => Math.min(3, s + 0.2))} 
                className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded"
              >
                +
              </button>
            </div>

            <div ref={viewerRef} className="max-w-4xl border bg-white dark:bg-gray-800 p-4 rounded shadow">
              <Document
                file={pdfFile}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={<div className="p-4 text-center">Loading PDF...</div>}
                error={<div className="p-4 text-center text-red-500">Failed to load PDF</div>}
                noData={<div className="p-4 text-center">No PDF loaded</div>}
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
              <div className="flex justify-between items-center mt-4 w-full max-w-sm">
                <button 
                  onClick={() => setPageNumber((p) => Math.max(1, p - 1))} 
                  disabled={pageNumber === 1} 
                  className="bg-gray-300 dark:bg-gray-700 px-4 py-1 rounded disabled:opacity-50"
                >
                  Prev
                </button>
                <span>Page {pageNumber} of {numPages}</span>
                <button 
                  onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))} 
                  disabled={pageNumber === numPages} 
                  className="bg-gray-300 dark:bg-gray-700 px-4 py-1 rounded disabled:opacity-50"
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