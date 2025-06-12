// src/components/PDFViewer.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PDFViewer = ({ fileUrl, downloadUrl }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.2);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const viewerRef = useRef();

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const goToPage = (page) => {
    setPageNumber(page);
    viewerRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const zoomIn = () => setScale((prev) => Math.min(prev + 0.2, 3));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.6));
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handlePrint = () => {
    const printWindow = window.open(fileUrl, '_blank');
    printWindow?.focus();
    printWindow?.print();
  };

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {sidebarOpen && (
        <div className="flex md:flex-col gap-2 p-2 border rounded bg-gray-50 max-h-[80vh] md:w-40 overflow-auto">
          {Array.from({ length: numPages }, (_, index) => (
            <div
              key={`thumb_${index + 1}`}
              onClick={() => goToPage(index + 1)}
              className={`cursor-pointer border rounded ${pageNumber === index + 1 ? 'border-blue-500' : 'border-gray-300'}`}
            >
              <Document file={fileUrl}>
                <Page
                  pageNumber={index + 1}
                  width={100}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </Document>
            </div>
          ))}
        </div>
      )}

      <div className="flex-1 flex flex-col items-center">
        {/* Controls */}
        <div className="flex flex-wrap gap-3 justify-between items-center w-full mb-4">
          <div className="flex gap-2">
            <button onClick={zoomOut} className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-black dark:text-white px-3 py-1 rounded mx-1">-</button>
            <span className="text-sm">Zoom: {(scale * 100).toFixed(0)}%</span>
            <button onClick={zoomIn} className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-black dark:text-white px-3 py-1 rounded mx-1">+</button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={toggleSidebar}
            className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-black dark:text-white px-3 py-1 rounded mx-1"
            >
              {sidebarOpen ? 'Hide Sidebar' : 'Show Sidebar'}
            </button>
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
            >
              Download PDF
            </a>
            <button
              onClick={handlePrint}
              className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
            >
              Print
            </button>
          </div>
        </div>

        {/* Viewer */}
        <div ref={viewerRef} className="flex-1 overflow-auto border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-4 rounded shadow">
          <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess}>
            <Page pageNumber={pageNumber} scale={scale} />
          </Document>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex justify-between w-full max-w-sm">
          <button
            className="bg-blue-500 text-white px-4 py-1 rounded disabled:opacity-50"
            onClick={() => goToPage(pageNumber - 1)}
            disabled={pageNumber <= 1}
          >
            Prev
          </button>
          <p>
            Page {pageNumber} of {numPages}
          </p>
          <button
            className="bg-blue-500 text-white px-4 py-1 rounded disabled:opacity-50"
            onClick={() => goToPage(pageNumber + 1)}
            disabled={pageNumber >= numPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;