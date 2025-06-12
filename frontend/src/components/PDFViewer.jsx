// Enhanced additions to PDFViewer.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import axios from 'axios';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PDFViewer = () => {
  const [paths, setPaths] = useState([]);
  const [selectedPath, setSelectedPath] = useState('ALL');
  const [pdfUrl, setPdfUrl] = useState('');
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.2);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [matches, setMatches] = useState([]);
  const viewerRef = useRef();

  const [fileList, setFileList] = useState([]); // sidebar filenames

  useEffect(() => {
    axios.get('/api/pdf/codebases').then(res => {
      setPaths(res.data.codebases);
    });
  }, []);

  const handleGenerate = async () => {
    const res = await axios.post('/api/pdf', { codebase_path: selectedPath });
    const blob = await axios.get('/api/pdf/download', { responseType: 'blob' });
    const blobUrl = URL.createObjectURL(blob.data);
    setPdfUrl(blobUrl);
    setPageNumber(1);
    extractFileList(res.data.file_path);
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
    if (!pdfUrl || !searchTerm.trim()) return;

    const loadingPdf = await pdfjs.getDocument(pdfUrl).promise;
    const foundPages = [];

    for (let i = 1; i <= loadingPdf.numPages; i++) {
      const page = await loadingPdf.getPage(i);
      const content = await page.getTextContent();
      const fullText = content.items.map(it => it.str).join(' ').toLowerCase();
      if (fullText.includes(searchTerm.toLowerCase())) foundPages.push(i);
    }

    setMatches(foundPages);
    if (foundPages.length) setPageNumber(foundPages[0]);
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-4">PDF Summary Generator</h2>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <select
          className="p-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          value={selectedPath}
          onChange={(e) => setSelectedPath(e.target.value)}
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
        />
        <button onClick={handleSearch} className="bg-blue-500 text-white px-3 py-1 rounded">Search</button>

        <button onClick={handleGenerate} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Generate</button>
        <button onClick={() => window.open('/api/pdf/download', '_blank')} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Download</button>
        <button onClick={() => window.open(pdfUrl)?.print()} className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">Print</button>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="bg-gray-300 dark:bg-gray-700 px-3 py-2 rounded">{sidebarOpen ? 'Hide' : 'Show'} Sidebar</button>
      </div>

      {pdfUrl && (
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
                      <li key={p} className="cursor-pointer hover:underline" onClick={() => setPageNumber(p)}>Page {p}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}

          {/* Viewer */}
          <div className="flex-1 flex flex-col items-center">
            <div className="flex gap-4 mb-4">
              <button onClick={() => setScale((s) => Math.max(0.5, s - 0.2))} className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded">−</button>
              <span className="text-sm">Zoom: {(scale * 100).toFixed(0)}%</span>
              <button onClick={() => setScale((s) => Math.min(3, s + 0.2))} className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded">+</button>
            </div>

            <div ref={viewerRef} className="max-w-4xl border bg-white dark:bg-gray-800 p-4 rounded shadow">
              <Document file={pdfUrl} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
                <Page pageNumber={pageNumber} scale={scale} />
              </Document>
            </div>

            <div className="flex justify-between items-center mt-4 w-full max-w-sm">
              <button onClick={() => setPageNumber((p) => Math.max(1, p - 1))} disabled={pageNumber === 1} className="bg-gray-300 dark:bg-gray-700 px-4 py-1 rounded disabled:opacity-50">Prev</button>
              <span>Page {pageNumber} of {numPages}</span>
              <button onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))} disabled={pageNumber === numPages} className="bg-gray-300 dark:bg-gray-700 px-4 py-1 rounded disabled:opacity-50">Next</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFViewer;
